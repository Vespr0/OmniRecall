<script lang="ts">
  import type { CacheManager } from "../../cache/cacheManager";
  import BrowseFolder from "../browse/BrowseFolder.svelte";

  const _components = { BrowseFolder };

  let {
    cacheManager,
    onStartDrill
  }: {
    cacheManager: CacheManager;
    onStartDrill: (path: string) => void;
  } = $props();

  let tree = $derived.by(() => {
    const t: Record<string, any> = {};
    const drillsMap = cacheManager.getDrillsData();

    for (const filePath in drillsMap) {
      const drills = drillsMap[filePath];
      if (drills.length === 0) continue;

      const parts = filePath.split("/");
      let current = t;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] =
            i === parts.length - 1
              ? { _file: true, path: filePath, count: drills.length }
              : {};
        }
        current = current[part];
      }
    }
    return t;
  });
</script>

<div class="drill-browse-container">
  {#if Object.keys(tree).length === 0}
    <div class="empty-state">
      <p>No drills found in vault.</p>
      <p class="hint">Tag any markdown file with <code>#drills</code> and add questions separated by <code>?</code>.</p>
    </div>
  {:else}
    <div class="tree-container">
      <BrowseFolder node={tree} depth={0} pathPrefix="" goReviewFiltered={onStartDrill} />
    </div>
  {/if}
</div>

<style>
  .drill-browse-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .empty-state {
    padding: 30px;
    text-align: center;
    background: var(--background-secondary);
    border-radius: 8px;
  }
  .hint {
    font-size: 12px;
    color: var(--text-muted);
  }
  .tree-container {
    overflow-y: auto;
    flex-grow: 1;
  }
</style>
