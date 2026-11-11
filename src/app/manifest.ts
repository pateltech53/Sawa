import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sawa · سوا",
    short_name: "Sawa",
    description: "One front door to school life in the UAE.",
    start_url: "/",
    display: "standalone",
    background_color: "#d6d2cc",
    theme_color: "#d6d2cc",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
