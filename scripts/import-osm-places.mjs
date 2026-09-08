const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OVERPASS_URL = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter"

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the importer.")
}

const query = `
[out:json][timeout:60];
(
  nwr["shop"="second_hand"](61.40,23.60,61.60,24.00);
  nwr["shop"="antiques"](61.40,23.60,61.60,24.00);
  nwr["shop"="charity"](61.40,23.60,61.60,24.00);
  nwr["shop"="auction"](61.40,23.60,61.60,24.00);
  nwr["amenity"="recycling"](61.40,23.60,61.60,24.00);
);
out center tags;
`

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
}

function categoryFor(tags) {
  if (tags.shop === "antiques") return "antiikki"
  if (tags.shop === "auction") return "huutokauppa"
  if (tags.amenity === "recycling") return "kierratys"
  return "kirpputori"
}

function cityFor(tags) {
  return tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "Tampere"
}

function addressFor(tags) {
  const street = tags["addr:street"]
  const houseNumber = tags["addr:housenumber"]
  const postcode = tags["addr:postcode"]
  const firstLine = [street, houseNumber].filter(Boolean).join(" ")
  return [firstLine, postcode].filter(Boolean).join(", ") || null
}

function openingHoursFor(tags) {
  if (!tags.opening_hours) return null
  return { raw: tags.opening_hours }
}

function normalize(element) {
  const tags = element.tags || {}
  const latitude = element.lat ?? element.center?.lat ?? null
  const longitude = element.lon ?? element.center?.lon ?? null

  if (!tags.name || latitude == null || longitude == null) return null

  return {
    name: tags.name,
    category: categoryFor(tags),
    description: tags.description || null,
    address: addressFor(tags),
    city: cityFor(tags),
    latitude,
    longitude,
    website: tags.website || tags["contact:website"] || null,
    phone: tags.phone || tags["contact:phone"] || null,
    opening_hours: openingHoursFor(tags),
  }
}

async function main() {
  const overpassResponse = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  })

  if (!overpassResponse.ok) {
    throw new Error(`Overpass request failed: ${overpassResponse.status} ${await overpassResponse.text()}`)
  }

  const overpass = await overpassResponse.json()
  const normalized = overpass.elements.map(normalize).filter(Boolean)

  const existingResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/places?select=id,name,city`,
    { headers },
  )

  if (!existingResponse.ok) {
    throw new Error(`Supabase read failed: ${existingResponse.status} ${await existingResponse.text()}`)
  }

  const existing = await existingResponse.json()
  const existingByKey = new Map(existing.map((place) => [`${place.name}|${place.city || ""}`.toLowerCase(), place]))

  let inserted = 0
  let updated = 0

  for (const place of normalized) {
    const key = `${place.name}|${place.city || ""}`.toLowerCase()
    const current = existingByKey.get(key)

    if (current) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/places?id=eq.${current.id}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ ...place, updated_at: new Date().toISOString() }),
      })

      if (!response.ok) throw new Error(`Supabase update failed for ${place.name}: ${await response.text()}`)
      updated += 1
      continue
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/places`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify(place),
    })

    if (!response.ok) throw new Error(`Supabase insert failed for ${place.name}: ${await response.text()}`)
    inserted += 1
  }

  console.log(`OSM import complete: ${normalized.length} places normalized, ${inserted} inserted, ${updated} updated.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
