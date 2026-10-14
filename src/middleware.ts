import { defineMiddleware } from "astro:middleware";
import { paraglideMiddleware } from "./paraglide/server";
import { assertIsLocale, baseLocale, setLocale } from "./paraglide/runtime";

export const onRequest = defineMiddleware((ctx, next) => {
  if (ctx.isPrerendered) {
    setLocale(assertIsLocale(ctx.currentLocale ?? baseLocale));
    return next();
  }

  return paraglideMiddleware(ctx.request, ({ request }) => next(request));
});
