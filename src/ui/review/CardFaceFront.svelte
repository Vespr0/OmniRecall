<script lang="ts">
  import { MarkdownRenderer, type App as ObsidianApp } from "obsidian";
  import type { FSRSMainView } from "../common/mainView";
  import type { Flashcard } from "../../parser/parser";

  let {
    app,
    parentView,
    currentItem,
    breadcrumbs,
  }: {
    app: ObsidianApp;
    parentView: FSRSMainView;
    currentItem: { file: string; card: Flashcard } | undefined;
    breadcrumbs: string;
  } = $props();

  let frontEl: HTMLElement = $state({} as HTMLElement);

  $effect(() => {
    if (currentItem && frontEl && frontEl.empty) {
      frontEl.empty();
      MarkdownRenderer.render(
        app,
        currentItem.card.front,
        frontEl,
        currentItem.file,
        parentView,
      );
    }
  });
</script>

<div class="card-face card-front">
  {#if currentItem}
    <div class="card-context">{breadcrumbs}</div>
  {/if}

  <div
    class="fsrs-content"
    bind:this={frontEl}
    style="font-size: 1.5em; text-align: center; margin-top: 20px;"
  ></div>
</div>

<style>
  .card-face {
    grid-area: card;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 16px;
    padding: 35px 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
  }

  .card-context {
    font-size: 0.85em;
    color: var(--text-muted);
    margin-bottom: 25px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 12px;
  }

  .fsrs-content {
    color: var(--text-normal);
    line-height: 1.6;
  }
</style>
