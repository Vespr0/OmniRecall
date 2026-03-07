<script lang="ts">
  import { MarkdownRenderer, type App as ObsidianApp } from "obsidian";
  import type { FSRSMainView } from "./mainView";
  import type { Flashcard } from "../parser/parser";
  import type { Snippet } from "svelte";

  let {
    app,
    parentView,
    currentItem,
    isShowingAnswer,
    onShowAnswer,
    children,
  }: {
    app: ObsidianApp;
    parentView: FSRSMainView;
    currentItem: { file: string; card: Flashcard } | undefined;
    isShowingAnswer: boolean;
    children: Snippet;
  } = $props();

  let breadcrumbs = $derived.by(() => {
    if (!currentItem) return "";
    let fileName = currentItem.file.split("/").pop();
    let parts = ["📄 " + fileName];
    if (currentItem.card.context && currentItem.card.context.length > 0) {
      parts.push(...currentItem.card.context);
    }
    return parts.join(" > ");
  });

  let frontEl: HTMLElement = $state({} as HTMLElement);
  let backEl: HTMLElement = $state({} as HTMLElement);

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

  $effect(() => {
    if (currentItem && isShowingAnswer && backEl && backEl.empty) {
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

<!-- svelte-ignore a11y_click_events_have_key_events a11y-no-static-element-interactions -->
<div
  class="fsrs-card"
  onclick={onShowAnswer}
  role="button"
  tabindex="0"
  onkeydown={(e) => {
    if (e.key === "Enter") onShowAnswer();
  }}
  style="cursor: {isShowingAnswer ? 'default' : 'pointer'}"
>
  {#if currentItem}
    <div class="card-context">{breadcrumbs}</div>
  {/if}

  <div
    class="fsrs-front"
    bind:this={frontEl}
    style="font-size: 1.5em; margin-bottom: {isShowingAnswer ? '20px' : '0'};"
  ></div>

  {#if !isShowingAnswer}
    <div class="hint">Click card to reveal answer</div>
  {:else}
    <hr style="margin: 20px 0;" />
    <div class="fsrs-back" bind:this={backEl} style="font-size: 1.2em;"></div>
    {@render children()}
  {/if}
</div>

<style>
  .fsrs-card {
    background: var(--background-secondary);
    padding: 30px;
    border-radius: 10px;
    width: 100%;
    max-width: 600px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .hint {
    margin-top: 20px;
    color: var(--text-muted);
  }

  .card-context {
    font-size: 0.85em;
    color: var(--text-muted);
    margin-bottom: 15px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 8px;
  }
</style>
