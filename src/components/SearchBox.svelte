<script lang="ts">
  import SearchIcon from "@lucide/svelte/icons/search";

  interface Props {
    filter(kw: Set<string>, kv: Map<string, string>): void;
    placeholder: string;
    value: string;
  }

  let { filter, placeholder, value = $bindable() }: Props = $props();

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    value = params.get("q") ?? "";
  });

  $effect(() => {
    const values = value?.trim().toLowerCase().split(" ") ?? [];

    const { kw, kv } = values.reduce(
      (acc, val) => {
        const [first, ...rest] = val.split(":");

        if (rest.length === 0) {
          if (first) acc.kw.add(first);
        } else {
          acc.kv.set(first, rest.join(":"));
        }

        return acc;
      },
      {
        kw: new Set<string>(),
        kv: new Map<string, string>(),
      },
    );

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
