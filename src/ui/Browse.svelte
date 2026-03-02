<script lang="ts">
  import type { CacheManager } from "../cache/cacheManager";
  import BrowseFolder from "./BrowseFolder.svelte";

  // Prevent TypeScript from stripping component imports because they are strictly used in the template
  const _components = { BrowseFolder };

  let {
    cacheManager,
    onBack,
  }: {
    cacheManager: CacheManager;
    onBack: () => void;
  } = $props();

  let tree = $derived.by(() => {
    const t: Record<string, any> = {};
    const cache = cacheManager.getCacheData();
    for (const filePath in cache) {
      const cards = cache[filePath].cards.filter((c) => c.fsrsData !== null);
      if (cards.length === 0) continue;

      const parts = filePath.split("/");
      let current = t;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] =
            i === parts.length - 1
              ? { _file: true, path: filePath, count: cards.length }
              : {};
        }
        current = current[part];
      }
    }
    return t;
  });
</script>

<div class="browse-header">
  <button onclick={onBack}>&larr; Back</button>
  <h2>Vault Flashcards</h2>
</div>

<div class="tree-container">
  <BrowseFolder node={tree} depth={0} />
</div>

<style>
  .browse-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .browse-header h2 {
    margin-left: 20px;
    margin-top: 0;
    margin-bottom: 0;
  }
  .tree-container {
    overflow-y: auto;
    flex-grow: 1;
  }
</style>
