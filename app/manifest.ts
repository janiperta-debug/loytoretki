import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Löytöretki",
    short_name: "Löytöretki",
    description: "Apuri löytämiseen. Se näyttää suunnan, ei lupaa.",
    start_url: "/sovellus",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e9e0cb",
    theme_color: "#3a4a34",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
