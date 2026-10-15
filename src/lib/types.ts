/// Shared types between Svelte and Astro.
/// `svelte-check` is very annoying.

export interface ThemeDetail {
  mode?: "off" | "uwu";
  scheme?: string;
  id?: string;

  colors?: {
    background?: string;
    foreground?: string;
    accent?: string;
    accentForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
    border?: string;
  };
}
