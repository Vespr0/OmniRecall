<script lang="ts">
  import { MarkdownRenderer, type App as ObsidianApp } from "obsidian";
  import type { FSRSMainView } from "../common/mainView";
  import type { Flashcard } from "../../parser/parser";
  import type { Snippet } from "svelte";

  let {
    app,
    parentView,
    currentItem,
    isShowingAnswer,
    breadcrumbs,
    children,
  }: {
    app: ObsidianApp;
    parentView: FSRSMainView;
    currentItem: { file: string; card: Flashcard } | undefined;
    isShowingAnswer: boolean;
    breadcrumbs: string;
    children: Snippet;
  } = $props();

  let backEl: HTMLElement = $state({} as HTMLElement);

  $effect(() => {
    if (
      currentItem &&
      isShowingAnswer &&
      backEl &&
      backEl.empty
    ) {
      backEl.empty();
      MarkdownRenderer.render(
        app,
        currentItem.card.back,
        backEl,
        currentItem.file,
        parentView,
      );
    }
  });
</script>

<div class="card-face card-back">
  {#if currentItem}
    <div class="card-context">{breadcrumbs}</div>
  {/if}

  <div
    class="fsrs-content"
    bind:this={backEl}
    style="font-size: 1.2em; margin-bottom: 30px;"
  ></div>

  {@render children()}
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

  .card-back {
    transform: rotateY(180deg);
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
