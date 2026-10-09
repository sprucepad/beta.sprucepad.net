<script lang="ts">
  import Icon from "@re-exports/lucide-svelte-icon";
  import SearchBox from "./SearchBox.svelte";
  import type { Card } from "@/lib/collections";

  interface Props {
    cards: Card[];
    href: string;
    placeholder: string;
    empty: string;
  }

  let { cards: initCards, href, placeholder, empty }: Props = $props();
  let value = $state("");

  const topics = $derived(initCards.flatMap((card) => card.topics));

  let cards = $state((() => initCards)());

  function topicsMatch(t: typeof topics, value: string) {
    return t.some(
      (topic) =>
        stringMatches(topic.id, value) || stringMatches(topic.name, value),
    );
  }

  function stringMatches(s: string, value: string) {
    return s.toLowerCase().includes(value);
  }
</script>

<div class="space-y-4">
  <SearchBox
    {placeholder}
    bind:value
    filter={(kw, kv) => {
      if (!kv.size && !kw.size) return (cards = initCards);
      cards = initCards.filter((card) => {
        for (const [key, value] of kv) {
          switch (key) {
            case "topic":
              if (topicsMatch(card.topics, value)) return true;
            case "title":
              if (stringMatches(card.title, value)) return true;
            case "id":
              if (stringMatches(card.id, value)) return true;
            case "desc":
            case "description":
              if (stringMatches(card.desc, value)) return true;
            case "img":
            case "alt":
              if (card.cover?.alt && stringMatches(card.cover.alt, value))
                return true;
          }
        }

        for (const keyword of kw) {
          if (
            stringMatches(card.id, keyword) ||
            stringMatches(card.title, keyword) ||
            stringMatches(card.desc, keyword)
          ) {
            return true;
          }
        }
      });
    }}
  />

  <div>
    {#each topics as topic (topic.id)}
      {@const regex = new RegExp(`\\btopic:${topic.id}\\b`, "i")}
      <button
        class="flex cursor-pointer items-center gap-1 rounded-full bg-accent p-1 px-2 text-sm text-accent-foreground transition-colors data-selected:bg-secondary data-selected:text-secondary-foreground"
        data-selected={regex.test(value) ? true : undefined}
        onclick={() => {
          const string = `topic:${topic.id}`;
          if (value.includes(string))
            value = value
              .replace(regex, "")
              .replace(/\s{2,}/, " ")
              .trim();
          else value = (value + ` ${string}`).replace(/\s{2,}/, " ").trim();
        }}
      >
        <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -- this might be a bug in Lucide, as the icon renders just fine -->
        <Icon iconNode={topic.icon as any} width={16} height={16} />
        {topic.name}
      </button>
    {/each}
  </div>

  <div class="flex flex-wrap gap-4">
    {#each cards as card (card.id)}
      <div class="max-w-2xs">
        <a href={`${href}${card.id}`}>
          {#if card.cover}
            <img
              src={card.cover.src}
              alt=""
              class="max-w-full rounded-lg"
              style:view-transition-name={`card-image-${card.id}`}
            />
          {/if}
          <h1
            class="font-pixel text-4xl font-black"
            style:view-transition-name={`card-title-${card.id}`}
          >
            {card.title}
          </h1>
        </a>

        <p style:view-transition-name={`card-desc-${card.id}`}>{card.desc}</p>
        {#if card.topics.length}
          <ul
            style:view-transition-name={`card-topics-${card.id}`}
            class="mt-4 flex flex-wrap gap-2"
          >
            {#each card.topics as topic (topic.id)}
              <li>
                <button
                  class="flex items-center gap-1 rounded-lg bg-accent p-1 px-2 text-accent-foreground"
                >
                  <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -- this might be a bug in Lucide, as the icon renders just fine -->
                  <Icon iconNode={topic.icon as any} />
                  {topic.name}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {:else}
      <p>{empty}</p>
    {/each}
  </div>
</div>
