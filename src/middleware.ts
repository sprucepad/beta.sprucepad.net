import { defineMiddleware } from "astro:middleware";
import {
  extractLocaleFromRequest,
  extractLocaleFromUrl,
  setLocale,
} from "./paraglide/runtime";

export const onRequest = defineMiddleware((ctx, next) => {
  const locale =
    extractLocaleFromUrl(ctx.url) ?? extractLocaleFromRequest(ctx.request);
  setLocale(locale);

  return next();
});
