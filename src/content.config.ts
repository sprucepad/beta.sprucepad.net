import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const themes = defineCollection({
  loader: glob({
    pattern: "**/*.{toml,yaml,yml,json}",
    base: "content/themes",
  }),
  schema: z.object({
    scheme: z.union([z.literal("dark"), z.literal("light")]),
    colors: z.object({
      background: z.string().optional(),
      foreground: z.string().optional(),
      accent: z.string().optional(),
      accentForeground: z.string().optional(),
      secondary: z.string().optional(),
      secondaryForeground: z.string().optional(),
    }),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      desc: z.string(),
      cover: image().optional(),

      theme: reference("themes").optional(),

      createdAt: z.date(),
      updatedAt: z.date(),
    }),
});

export const collections = { themes, posts };
