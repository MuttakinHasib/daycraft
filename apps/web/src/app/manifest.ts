import type { MetadataRoute } from "next";

// Installed web app: the blocks-and-pen icon at the PWA sizes, plus a maskable cut kept inside the 80% safe circle.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daycraft",
    short_name: "Daycraft",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
