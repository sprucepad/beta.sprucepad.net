import type { ThemeDetail } from "./types";
import { getImage } from "astro:assets";
import {
  getCollection,
  getEntry,
  type ReferenceDataEntry,
} from "astro:content";
import { icons, type IconNode } from "lucide";

interface RenderedImage {
  src: string;
  alt?: string;
  width: number;
  height: number;
}

async function processImage(
  src?: ImageMetadata,
  opts?: { format?: string; width?: number; height?: number; alt?: string },
): Promise<RenderedImage | undefined> {
  if (!src) return;

  const img = await getImage({ src, ...opts });
  return {
    src: img.src,
    width: img.options.width ?? src.width,
    height: img.options.height ?? src.height,
    alt: opts?.alt,
  };
}

export interface Card {
  id: string;
  title: string;
  desc: string;
  topics: Topic[];
  cover?: RenderedImage;
}

export async function getCards(
  locale: string,
  collection: "posts" | "projects",
): Promise<Card[]> {
  const cards = await getCollection(collection);
  return (
    await Promise.all(
      cards.map(async (card): Promise<Card | undefined> => {
        const [appliedLocale, ...rest] = card.id.split("/");
        if (appliedLocale !== locale) return;

        return {
          id: rest.join("/"),
          title: card.data.title,
          desc: card.data.desc,
          topics: await Promise.all(
            card.data.topics.map((ref) => processTopic(locale, ref)),
          ),
          cover: await processImage(card.data.cover),
        };
      }),
    )
  ).filter(Boolean) as Card[];
}

interface Topic {
  id: string;
  name: string;
  icon: IconNode;
}

async function processTopic(
  locale: string,
  ref: ReferenceDataEntry<"topics">,
): Promise<Topic> {
  const entry = await getEntry(ref);

  return {
    id: entry.id,
    name: entry.data.name[locale],
    icon: (icons as Record<string, IconNode>)[entry.data.icon],
  };
}

export async function processTheme(
  ref: ReferenceDataEntry<"themes">,
): Promise<ThemeDetail> {
  const theme = await getEntry(ref);
  return {
    id: theme?.id,
    colors: theme?.data.colors,
    scheme: theme?.data.scheme,
  };
}
