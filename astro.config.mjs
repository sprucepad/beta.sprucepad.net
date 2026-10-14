// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";

import { satteri } from "@astrojs/markdown-satteri";
import externalLinks from "./src/plugins/external-links";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  site: "https://beta.sprucepad.net/",
  i18n: {
    defaultLocale: "pt",
    locales: ["pt", "en"],
    routing: {
      redirectToDefaultLocale: true,
      prefixDefaultLocale: true,
    },
  },

  integrations: [sitemap(), mdx(), svelte()],
  vite: {
    plugins: [
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
      }),
      tailwindcss(),
    ],
  },

  markdown: {
    shikiConfig: {
      themes: {
        dark: "horizon",
        light: "horizon-bright",
      },
    },
    processor: satteri({
      hastPlugins: [externalLinks],
    }),
  },

  fonts: [
    {
      name: "DM Sans",
      cssVariable: "--font-dm-sans",
      provider: fontProviders.fontsource(),
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jb-mono",
      provider: fontProviders.fontsource(),
    },
    {
      name: "Peaberry",
      cssVariable: "--font-peaberry",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: ["./content/fonts/Peaberry.woff2"],
          },
        ],
      },
    },
  ],
});
