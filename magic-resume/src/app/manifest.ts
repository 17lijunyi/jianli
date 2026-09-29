/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */
import type { MetadataRoute } from "next";

export const runtime = "edge";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "简励",
    short_name: "简励",
    description: "简励 · 让下一步，更进一步",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png?v=jianli-fullbleed-20260930",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
