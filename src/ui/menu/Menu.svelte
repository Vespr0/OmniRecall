<script lang="ts">
  import type { CacheManager } from "../../cache/cacheManager";
  import { onMount, onDestroy } from "svelte";
  import type { EventRef } from "obsidian";
  import type OmniRecallPlugin from "../../main";
  import MenuStats from "./MenuStats.svelte";
  import MenuActions from "./MenuActions.svelte";

  const _components = { MenuStats, MenuActions };

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

  let estimatedMinutes = $derived(
    Math.ceil((dueCount * (plugin.settings.avgReviewTime || 5000)) / 60000),
  );
  let estimatedText = $derived(
    estimatedMinutes <= 1 ? "< 1 minute" : `~${estimatedMinutes} mins`,
  );

  function refreshCount() {
    dueCount = cacheManager.getReviewQueue().length;
  }

  onMount(() => {
    refreshCount();
    eventRef = cacheManager.on("update", refreshCount) as EventRef;
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
</script>

<div class="menu-container">
  <h2>OmniRecall Statistics</h2>

  <MenuStats {plugin} />

  <MenuActions
    {dueCount}
    {estimatedText}
    {onReview}
    {onBrowse}
  />
</div>

<style>
  .menu-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px;
  }
</style>
