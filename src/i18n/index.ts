import pt from "./pt/index.json";
import en from "./en/index.json";

const locales = { pt, en } as const;
export type Locale = keyof typeof locales;

type Path<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends unknown[]
        ? `${K}` // Stop recursion at arrays or treat specifically if needed
        : T[K] extends object
          ? `${K}` | `${K}.${Path<T[K]>}`
          : `${K}`;
    }[keyof T & (string | number)]
  : never;

export function i18n<
  L extends string = "en",
  Table extends Record<string, unknown> = (typeof locales)[Locale],
>(lang: L | undefined, table?: Table) {
  const locale: Locale = (lang as Locale | undefined) ?? "en";
  const record = (table ?? locales)[locale];
  return {
    locale,
    t: <P extends Path<Table>>(
      path: P,
      variables?: Record<string, unknown>,
    ) => {
      let translation = path.split(".").reduce((acc, key) => {
        return (acc as Record<string, Table>)?.[key];
      }, record) as unknown as string;

      if (!translation || typeof translation !== "string") {
        return path; // fallback to key if string not found
      }

      // interpolate variables if they exist (replaces {name} with value)
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          translation = translation.replace(
            new RegExp(`{${key}}`, "g"),
            String(value),
          );
        });
      }

      return translation;
    },
  };
}
