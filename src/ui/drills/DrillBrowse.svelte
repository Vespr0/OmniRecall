<script lang="ts">
  import type { CacheManager } from '../../cache/cacheManager';
  import type OmniRecallPlugin from '../../main';
  import type { DrillCard } from '../../cache/drillTypes';

  let {
    cacheManager,
    plugin,
    onStartDrill
  }: {
    cacheManager: CacheManager;
    plugin: OmniRecallPlugin;
    onStartDrill: (folderPath: string) => void;
  } = $props();

  let drillsMap = $state(cacheManager.getDrillsData());

  interface FolderNode {
    name: string;
    path: string;
    drills: DrillCard[];
    children: Record<string, FolderNode>;
  }

  let folderTree = $derived(buildTree(drillsMap));

  function buildTree(map: Record<string, DrillCard[]>): FolderNode {
    const root: FolderNode = { name: 'Root', path: '', drills: [], children: {} };

    for (const filePath in map) {
      const cards = map[filePath];
      const parts = filePath.split('/');
      parts.pop(); // Remove filename

      let current = root;
      let currentPath = '';

      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            drills: [],
            children: {}
          };
        }
        current = current.children[part];
      }
      current.drills.push(...cards);
    }
    return root;
  }

  function getFolderStats(node: FolderNode): { total: number; completed: number } {
    let total = node.drills.length;
    let completed = node.drills.filter(d => plugin.settings.drillTelemetry[d.id]?.completed).length;

    for (const childKey in node.children) {
      const sub = getFolderStats(node.children[childKey]);
      total += sub.total;
      completed += sub.completed;
    }
    return { total, completed };
  }
</script>

<div class="drill-browse-container">
  <h2>🎯 Exercise Drills Browser</h2>

  {#if Object.keys(folderTree.children).length === 0}
    <div class="empty-state">
      <p>No drills found in vault.</p>
      <p class="hint">Tag any markdown file with <code>#drills</code> and add questions separated by <code>?</code>.</p>
    </div>
  {:else}
    <div class="folder-list">
      {#each Object.values(folderTree.children) as child}
        {@const stats = getFolderStats(child)}
        <div class="folder-card">
          <div class="folder-info">
            <span class="folder-icon">📁</span>
            <div>
              <div class="folder-name">{child.name}</div>
              <div class="folder-stats">{stats.completed} / {stats.total} Completed</div>
            </div>
          </div>
          <button class="start-btn" onclick={() => onStartDrill(child.path)}>
            ▶ Start Drill
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .drill-browse-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
  .folder-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .folder-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--background-primary-alt);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
  }
  .folder-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .folder-icon {
    font-size: 20px;
  }
  .folder-name {
    font-weight: 600;
    font-size: 15px;
  }
  .folder-stats {
    font-size: 12px;
    color: var(--text-muted);
  }
  .start-btn {
    padding: 6px 14px;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
</style>
