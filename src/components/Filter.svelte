<script lang="ts" module>
  import SearchIcon from "@lucide/svelte/icons/search";
  import ArrowDownWideNarrowIcon from "@lucide/svelte/icons/arrow-down-wide-narrow";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";

  export interface PossibleMatch {
    value: string;
    exact: boolean;
  }

  export interface ParseResult {
    kw: Set<PossibleMatch>;
    kv: Map<string, PossibleMatch>;

    sortBy?: string;
    sortOrder: "asc" | "desc";
  }

  interface Props {
    filter({ kw, kv, sortBy, sortOrder }: ParseResult): void;
    placeholder: string;
    value: string;
    sortableItems: [string, string][];
  }

  export function normalize(val: string, regex?: RegExp) {
    const multipleSpaces = /\s{2,}/g;
    return regex
      ? val.replace(regex, "").trim().replace(multipleSpaces, " ")
      : val.trim().replace(multipleSpaces, " ");
  }
</script>

<script lang="ts">
  const orderAscendRegex = /\border:asc\b/i;

  let {
    filter,
    placeholder,
    sortableItems,
    value = $bindable(),
  }: Props = $props();
  let isAdvancedFilterOpen = $state(false);

  function parse(val: string): ParseResult {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- this is a local function, reactivity is not needed
    const kw = new Set<PossibleMatch>();
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- this is a local function, reactivity is not needed
    const kv = new Map<string, PossibleMatch>();
    let sortOrder: "asc" | "desc" = "desc";
    let sortBy: string | undefined;

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

        if (key === "order") {
          sortOrder = value === "asc" ? "asc" : "desc";
          continue;
        } else if (key === "by") {
          sortBy = value;
          continue;
        }

        if (key && value) {
          kv.set(key, { value, exact });
        } else if (value) {
          kw.add({ value, exact });
        }
      } else if (text) {
        kw.add({ value: text, exact });
      }
    }

    return { kw, kv, sortOrder, sortBy };
  }

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    value = params.get("q") ?? "";
  });

  $effect(() => {
    const result = parse(value.trim().toLowerCase() ?? "");
    filter(result);
  });
</script>

<div class="relative">
  <label class="relative flex gap-2">
    <SearchIcon class="absolute top-1/2 left-2 -translate-y-1/2 transform" />
    <input
      class="w-full rounded-lg border border-border p-2 pl-10 outline-accent focus:outline-2"
      type="search"
      {placeholder}
      bind:value
    />

    <button
      class="cursor-pointer rounded-full p-2 transition-colors data-open:bg-accent data-open:text-accent-foreground"
      onclick={() => (isAdvancedFilterOpen = !isAdvancedFilterOpen)}
      aria-label="Toggle advanced filters"
      data-open={isAdvancedFilterOpen ? true : undefined}
    >
      <ArrowDownWideNarrowIcon />
    </button>
  </label>

  <dialog
    class="peer absolute top-12 right-0 left-auto z-50 rounded-lg border border-border bg-background text-foreground"
    open={isAdvancedFilterOpen}
  >
    <div class="flex flex-col p-2">
      {#each sortableItems as item (item[1])}
        {@const [title, val] = item}
        {@const selected = new RegExp(`\\bby:${val}\\b`, "i").test(value)}
        {@const ascending = orderAscendRegex.test(value)}

        <button
          class="group flex cursor-pointer items-center gap-2 rounded-full pl-2 data-selected:bg-accent data-selected:text-accent-foreground"
          data-selected={selected ? true : undefined}
          onclick={(e) => {
            if (!selected)
              value = normalize(value.replace(/\bby:.*\b/i, "") + ` by:${val}`);
            if (!(e.target instanceof HTMLSpanElement)) {
              if (ascending)
                value = normalize(value.replace(orderAscendRegex, ""));
              else value = normalize(value + " order:asc");
            }
          }}
        >
          <span class="flex-1 text-start">{title}</span>
          <div
            class="rounded-r-full bg-secondary p-1 text-secondary-foreground opacity-0 group-data-selected:opacity-100"
            aria-label="Toggle order"
            data-toggle
          >
            {#if ascending}
              <ArrowUpIcon />
            {:else}
              <ArrowDownIcon />
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </dialog>
</div>
