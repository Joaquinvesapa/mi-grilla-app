import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MiGrilla — Tu Agenda del Festival",
    short_name: "MiGrilla",
    description: "Armá tu agenda del festival y coordiná con tus amigos.",
    start_url: "/grilla",
    display: "standalone",
    background_color: "#fdf8ff",
    theme_color: "#fdf8ff",
    orientation: "portrait",
    scope: "/",
    lang: "es-AR",
    categories: ["entertainment", "music", "social"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
