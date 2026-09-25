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
  let cards = $state((() => initCards)());
</script>

<div class="space-y-4">
  <SearchBox {placeholder} filter={() => {}} />

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
                  <Icon iconNode={topic.icon} />
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
