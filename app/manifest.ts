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
    shortcuts: [
      {
        name: "Mi Agenda",
        short_name: "Agenda",
        url: "/agenda",
        description: "Ver tu agenda personalizada del festival",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Grilla Completa",
        short_name: "Grilla",
        url: "/grilla",
        description: "Ver la grilla completa del festival",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Social",
        short_name: "Social",
        url: "/social",
        description: "Ver amigos y grupos",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
    // Share Target — allows receiving shares from other apps (Android)
    // When another app shares text to MiGrilla, it opens the grilla page
    // with the shared text as a search query parameter.
    share_target: {
      action: "/grilla",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  } as MetadataRoute.Manifest & {
    shortcuts: Array<{
      name: string;
      short_name: string;
      url: string;
      description: string;
      icons: Array<{ src: string; sizes: string }>;
    }>;
    share_target: {
      action: string;
      method: string;
      params: { title: string; text: string; url: string };
    };
  };
}
