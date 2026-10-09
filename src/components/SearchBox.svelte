<script lang="ts" module>
  import SearchIcon from "@lucide/svelte/icons/search";

  export interface PossibleMatch {
    value: string;
    exact: boolean;
  }

  interface Props {
    filter(kw: Set<PossibleMatch>, kv: Map<string, PossibleMatch>): void;
    placeholder: string;
    value: string;
  }
</script>

<script lang="ts">
  let { filter, placeholder, value = $bindable() }: Props = $props();

  function parse(val: string) {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- this is a local function, reactivity is not needed
    const kw = new Set<PossibleMatch>();
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- this is a local function, reactivity is not needed
    const kv = new Map<string, PossibleMatch>();
    const tokens: string[] = [];
    let token = "";
    let quoted = false;
    let escaped = false;

    for (const ch of val) {
      if (escaped) {
        token += ch;
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        quoted = !quoted;
      } else if (/\s/.test(ch) && !quoted) {
        if (token) tokens.push(token);
        token = "";
      } else {
        token += ch;
      }
    }

    if (escaped) token += "\\";
    if (token) tokens.push(token);

    for (const part of tokens) {
      const exact = part.startsWith("~");
      const text = exact ? part.slice(1) : part;
      const sep = text.indexOf(":");

      if (sep >= 0) {
        const key = text.slice(0, sep);
        const value = text.slice(sep + 1);

        if (key && value) {
          kv.set(key, { value, exact });
        } else if (value) {
          kw.add({ value, exact });
        }
      } else if (text) {
        kw.add({ value: text, exact });
      }
    }

    return { kw, kv };
  }

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    value = params.get("q") ?? "";
  });

  $effect(() => {
    const { kw, kv } = parse(value.trim().toLowerCase() ?? "");
    filter(kw, kv);
  });
</script>

<label class="relative block">
  <SearchIcon class="absolute top-1/2 left-2 -translate-y-1/2 transform" />
  <input
    class="w-full rounded-lg border border-border p-2 pl-10 outline-accent focus:outline-2"
    type="search"
    {placeholder}
    bind:value
  />
</label>
