<script lang="ts">
  import type { CacheManager } from "../cache/cacheManager";
  import { onMount, onDestroy } from "svelte";
  import { setIcon, type EventRef } from "obsidian";
  import type OmniRecallPlugin from "../main";
  import Heatmap from "./Heatmap/Heatmap.svelte";

  // Prevent TypeScript from stripping the component import
  const _components = { Heatmap };

  let {
    cacheManager,
    plugin,
    onReview,
    onBrowse,
  }: {
    cacheManager: CacheManager;
    plugin: OmniRecallPlugin;
    onReview: () => void;
    onBrowse: () => void;
  } = $props();

  let dueCount = $state(0);
  let eventRef: EventRef;
  let timer: number;

  function refreshCount() {
    dueCount = cacheManager.getReviewQueue().length;
  }

  onMount(() => {
    refreshCount(); // initialize
    // 1. Listen to cache updates (like edits from the user)
    eventRef = cacheManager.on("update", refreshCount) as EventRef;

    // 2. Poll every minute because flashcards can become due while sitting on the menu
    timer = window.setInterval(refreshCount, 60000);
  });

  onDestroy(() => {
    if (eventRef) {
      cacheManager.offref(eventRef);
    }
    if (timer) {
      window.clearInterval(timer);
    }
  });

  function obsidianIcon(node: HTMLElement, iconName: string) {
    setIcon(node, iconName);
    return {
      update(newIconName: string) {
        node.empty();
        setIcon(node, newIconName);
      },
    };
  }
</script>

<div class="menu-container">
  <h2>OmniRecall Statistics</h2>

  <Heatmap {plugin} />

  <div class="button-group">
    <button class="action-btn review-btn" onclick={onReview}>
      <span class="icon" use:obsidianIcon={"play"}></span>
      <span>Review ({dueCount} Due)</span>
    </button>

    <button class="action-btn browse-btn" onclick={onBrowse}>
      <span class="icon" use:obsidianIcon={"folder-open"}></span>
      <span>Browse Flashcards</span>
    </button>
  </div>
</div>

<style>
  .menu-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px;
  }

  .button-group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    width: 100%;
    max-width: 800px;
    margin-bottom: 20px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px 30px;
    font-size: 1.4em;
    font-weight: bold;
    cursor: pointer;
    border-radius: 8px;
    flex: 1 1 calc(50% - 10px); /* Fill space but map to 50% max each */
    min-width: 250px;
    transition: filter 0.1s ease;
  }

  .action-btn:hover {
    filter: brightness(1.1);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon :global(svg) {
    width: 24px;
    height: 24px;
    display: block;
    margin-bottom: 2px;
  }

  .review-btn {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
  }

  .browse-btn {
    background-color: var(--background-secondary);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
  }
</style>
