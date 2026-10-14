import type { GetStaticPaths, GetStaticPathsOptions } from "astro";
import { locales } from "@/paraglide/runtime";

type GSPResultWithLocale<T extends GetStaticPaths> = ([
  Awaited<ReturnType<T>>[number],
] extends [never]
  ? { params: { locale: string } }
  : Awaited<ReturnType<T>>[number] & {
      params: { locale: string };
    })[];

export function localizeGetStaticPaths<T extends GetStaticPaths = () => []>(
  fn?: T,
): (ctx: GetStaticPathsOptions) => Promise<GSPResultWithLocale<T>> {
  return async (ctx) => {
    if (!fn) return locales.map((locale) => ({ params: { locale } }));
    else {
      const result = await fn(ctx);
      return result.flatMap((item) =>
        locales.map((locale) => ({
          ...item,
          params: { locale, ...item.params },
        })),
      );
    }
  };
}
