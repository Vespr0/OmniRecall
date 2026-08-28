<script lang="ts">
  import type { CacheManager } from '../../cache/cacheManager';
  import type OmniRecallPlugin from '../../main';
  import type { DrillCard } from '../../cache/drillTypes';
  import DrillBrowseFolder from './DrillBrowseFolder.svelte';

  const _components = { DrillBrowseFolder };

  let {
    cacheManager,
    plugin,
    onStartDrill
  }: {
    cacheManager: CacheManager;
    plugin: OmniRecallPlugin;
    onStartDrill: (path: string) => void;
  } = $props();

  let tree = $derived.by(() => {
    const t: Record<string, any> = {};
    const drillsMap = cacheManager.getDrillsData();

    for (const filePath in drillsMap) {
      const drills = drillsMap[filePath];
      if (drills.length === 0) continue;

      const parts = filePath.split('/');
      let current = t;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {
            totalCount: 0,
            completedCount: 0
          };
        }

        const completedCount = drills.filter(d => plugin.settings.drillTelemetry[d.id]?.completed).length;

        current[part].totalCount += drills.length;
        current[part].completedCount += completedCount;

        if (i === parts.length - 1) {
          current[part]._file = true;
          current[part].path = filePath;
          current[part].drills = drills;
        }

        current = current[part];
      }
    }
    return t;
  });
</script>

<div class="drill-browse-container">
  <h2>🎯 Vault Drills Browser</h2>

  {#if Object.keys(tree).length === 0}
    <div class="empty-state">
      <p>No drills found in vault.</p>
      <p class="hint">Tag any markdown file with <code>#drills</code> and add questions separated by <code>?</code>.</p>
    </div>
  {:else}
    <div class="tree-container">
      <DrillBrowseFolder node={tree} depth={0} pathPrefix="" {plugin} {onStartDrill} />
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
