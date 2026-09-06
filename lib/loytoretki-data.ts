export type CompassScore = "high" | "mid" | "low"

export const SCORE_META: Record<
  CompassScore,
  { label: string; blurb: string; token: string; dotClass: string; textClass: string }
> = {
  high: {
    label: "Todennäköinen löytö",
    blurb: "Erittäin vahva viite tuotteesta.",
    token: "var(--forest)",
    dotClass: "bg-forest",
    textClass: "text-forest",
  },
  mid: {
    label: "Mahdollinen löytö",
    blurb: "Kannattaa käydä katsomassa.",
    token: "var(--brass)",
    dotClass: "bg-brass",
    textClass: "text-brass",
  },
  low: {
    label: "Kannattaa vilkaista",
    blurb: "Alueella voi olla kiinnostavaa.",
    token: "var(--info)",
    dotClass: "bg-info",
    textClass: "text-info",
  },
}

export type Category = "kirpputori" | "kierratys" | "huutokauppa" | "antiikki" | "muu"

export const CATEGORY_LABELS: Record<Category, string> = {
  kirpputori: "Kirpputori",
  kierratys: "Kierrätyskeskus",
  huutokauppa: "Huutokauppa",
  antiikki: "Antiikkiliike",
  muu: "Muu",
}

export type ObservedItem = {
  label: string
  count: number
  icon: "skate" | "mug" | "book" | "bike" | "lego"
}

export type Location = {
  id: string
  name: string
  town: string
  category: Category
  distanceKm: number
  hours: string
  score: CompassScore
  markerNumber: number
  tags: string[]
  lastSeen: string
  hitLine: string
  image: string
  /** position on the paper map, in percentages */
  map: { x: number; y: number }
  observed: ObservedItem[]
  likelihood: string
  summary: string
}

export const LOCATIONS: Location[] = [
  {
    id: "hyvinkaan-kirpputori",
    name: "Hyvinkään Kirpputori",
    town: "Hyvinkää",
    category: "kirpputori",
    distanceKm: 2.4,
    hours: "Avoinna 10–17",
    score: "high",
    markerNumber: 7,
    tags: ["Paljon talvivaatteita", "Arabia", "Retroa"],
    lastSeen: "tänään 8:15",
    hitLine: "3 osumaa hakuehdoillesi",
    image: "/images/app/find-market.png",
    map: { x: 47, y: 24 },
    likelihood: "KORKEA",
    summary:
      "Viimeisen 7 päivän aikana paljon ilmoituksia talviurheiluvälineistä ja lasten tuotteista.",
    observed: [
      { label: "Luistimia", count: 3, icon: "skate" },
      { label: "Arabiaa", count: 8, icon: "mug" },
      { label: "Kirjoja", count: 12, icon: "book" },
      { label: "Polkupyöriä", count: 5, icon: "bike" },
      { label: "Legoja", count: 14, icon: "lego" },
    ],
  },
  {
    id: "mantsalan-kirpputori",
    name: "Mäntsälän Kirpputori",
    town: "Mäntsälä",
    category: "kirpputori",
    distanceKm: 6.1,
    hours: "Avoinna 11–18",
    score: "mid",
    markerNumber: 5,
    tags: ["Työkaluja", "Vinyylit", "Astiat"],
    lastSeen: "eilen 18:40",
    hitLine: "2 mahdollista osumaa",
    image: "/images/app/find-skates.png",
    map: { x: 63, y: 62 },
    likelihood: "KESKITASO",
    summary: "Muutamia viitteitä etsimääsi viime päiviltä. Valikoima vaihtelee nopeasti.",
    observed: [
      { label: "Luistimia", count: 2, icon: "skate" },
      { label: "Arabiaa", count: 4, icon: "mug" },
      { label: "Kirjoja", count: 7, icon: "book" },
      { label: "Polkupyöriä", count: 2, icon: "bike" },
      { label: "Legoja", count: 6, icon: "lego" },
    ],
  },
  {
    id: "riihimaen-kirpputori",
    name: "Riihimäen Kirpputori",
    town: "Riihimäki",
    category: "kirpputori",
    distanceKm: 9.4,
    hours: "Avoinna 10–19",
    score: "low",
    markerNumber: 12,
    tags: ["Urheiluvälineet", "Kalusteet", "Lelut"],
    lastSeen: "tänään 7:50",
    hitLine: "Laaja valikoima urheilutarvikkeita",
    image: "/images/app/find-ceramics.png",
    map: { x: 74, y: 30 },
    likelihood: "MATALA",
    summary: "Ei tuoreita osumia juuri etsimääsi, mutta laaja ja vaihtuva yleisvalikoima.",
    observed: [
      { label: "Luistimia", count: 1, icon: "skate" },
      { label: "Arabiaa", count: 3, icon: "mug" },
      { label: "Kirjoja", count: 15, icon: "book" },
      { label: "Polkupyöriä", count: 6, icon: "bike" },
      { label: "Legoja", count: 9, icon: "lego" },
    ],
  },
  {
    id: "jarvenpaan-kierratyskeskus",
    name: "Järvenpään Kierrätyskeskus",
    town: "Järvenpää",
    category: "kierratys",
    distanceKm: 11.2,
    hours: "Avoinna 9–20",
    score: "mid",
    markerNumber: 8,
    tags: ["Huonekalut", "Kirjat", "Retroa"],
    lastSeen: "eilen 12:10",
    hitLine: "Paljon talviurheiluvälineitä",
    image: "/images/app/find-market.png",
    map: { x: 30, y: 44 },
    likelihood: "KESKITASO",
    summary: "Iso kierrätyskeskus, jonne tulee jatkuvasti uutta tavaraa. Ajoitus ratkaisee.",
    observed: [
      { label: "Luistimia", count: 2, icon: "skate" },
      { label: "Arabiaa", count: 6, icon: "mug" },
      { label: "Kirjoja", count: 20, icon: "book" },
      { label: "Polkupyöriä", count: 8, icon: "bike" },
      { label: "Legoja", count: 11, icon: "lego" },
    ],
  },
  {
    id: "nurmijarven-kirppis",
    name: "Nurmijärven Kirppis",
    town: "Nurmijärvi",
    category: "kirpputori",
    distanceKm: 14.8,
    hours: "Avoinna 12–18",
    score: "low",
    markerNumber: 15,
    tags: ["Vaatteet", "Lelut", "Keittiö"],
    lastSeen: "tänään 9:30",
    hitLine: "Yleisvalikoima, vaihtuu usein",
    image: "/images/app/find-ceramics.png",
    map: { x: 34, y: 70 },
    likelihood: "MATALA",
    summary: "Kodikas kylän kirppis. Löytöjä sattuman kaupalla, mutta hinnat ovat ystävällisiä.",
    observed: [
      { label: "Luistimia", count: 0, icon: "skate" },
      { label: "Arabiaa", count: 2, icon: "mug" },
      { label: "Kirjoja", count: 9, icon: "book" },
      { label: "Polkupyöriä", count: 3, icon: "bike" },
      { label: "Legoja", count: 5, icon: "lego" },
    ],
  },
]

export function getLocation(id: string) {
  return LOCATIONS.find((l) => l.id === id)
}

export type JournalEntry = {
  id: string
  date: string
  place: string
  find: string
  note: string
  image: string
}

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "arabia-muki",
    date: "7.5.2026",
    place: "Hyvinkään Kirpputori",
    find: "Arabia-muki, 70-luku",
    note: "Löysin tämän pöydästä 23. Myyjä muisti mistä sarjasta se on. Kolmella eurolla kotiin.",
    image: "/images/app/find-ceramics.png",
  },
  {
    id: "luistimet",
    date: "2.5.2026",
    place: "Järvenpään Kierrätyskeskus",
    find: "Nahkaluistimet, koko 39",
    note: "Ehjät ja teroitetut. Piti kiertää koko halli, mutta kompassi ohjasi oikeaan nurkkaan.",
    image: "/images/app/find-skates.png",
  },
  {
    id: "kirjapino",
    date: "28.4.2026",
    place: "Riihimäen Kirpputori",
    find: "Pino vanhoja karttakirjoja",
    note: "Kolme retkeilyopasta 60-luvulta. Näistä tulee hyvää luettavaa seuraavalle löytöretkelle.",
    image: "/images/app/find-market.png",
  },
]

export type NavKey = "koti" | "kartta" | "paivakirja" | "profiili"

export const SOURCE_TYPES = [
  { label: "Kirpputorit", icon: "store" },
  { label: "Kierrätyskeskukset", icon: "recycle" },
  { label: "Huutokaupat", icon: "gavel" },
  { label: "Antiikkiliikkeet", icon: "landmark" },
  { label: "Ja lisää…", icon: "plus" },
] as const

export const PROFILE = {
  name: "Aino Retkeilijä",
  handle: "@ainon_loydot",
  memberSince: "Mukana toukokuusta 2026",
  stats: [
    { label: "Löytöä", value: 27 },
    { label: "Retkeä", value: 12 },
    { label: "Kohdetta", value: 9 },
  ],
  savedSearches: [
    { term: "Luistimet", radius: "20 km", fresh: 3 },
    { term: "Arabia Kilta", radius: "15 km", fresh: 1 },
    { term: "Lastenpyörä 20\"", radius: "25 km", fresh: 5 },
  ],
  savedLocationIds: ["hyvinkaan-kirpputori", "jarvenpaan-kierratyskeskus"],
  savedFindIds: ["arabia-muki", "luistimet"],
}
