import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Carson Portfolio Marketing Team Dashboard",
    short_name: "Carson Dashboard",
    description: "Focus rotation, tools, and the events calendar for the Carson portfolio.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0808",
    theme_color: "#0a0808",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
