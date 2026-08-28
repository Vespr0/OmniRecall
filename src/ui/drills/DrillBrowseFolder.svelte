<script lang="ts">
  import { setIcon } from "obsidian";
  import type OmniRecallPlugin from "../../main";
  import DrillBrowseFolder from "./DrillBrowseFolder.svelte";

  const _components = { DrillBrowseFolder };

  let {
    node,
    depth,
    pathPrefix = "",
    plugin,
    onStartDrill,
  }: {
    node: any;
    depth: number;
    pathPrefix?: string;
    plugin: OmniRecallPlugin;
    onStartDrill: (path: string) => void;
  } = $props();

  let keys = $derived(
    Object.keys(node).filter(
      (k) => k !== "_file" && k !== "path" && k !== "drills" && k !== "totalCount" && k !== "completedCount",
    ),
  );

  let expanded: Record<string, boolean> = $state({});

  function toggle(key: string) {
    expanded[key] = !expanded[key];
  }

  function obsidianIcon(htmlNode: HTMLElement, iconName: string) {
    setIcon(htmlNode, iconName);
    return {
      update(newIconName: string) {
        htmlNode.empty();
        setIcon(htmlNode, newIconName);
      },
    };
  }
</script>

{#each keys as key}
  <div class="item" style="margin-left: {depth * 20}px;">
    {#if node[key]._file}
      {@const fileNode = node[key]}
      <div class="fsrs-browser-row">
        <div class="file">
          📄 {key}
          <span class="count-badge">({fileNode.completedCount}/{fileNode.totalCount} completed)</span>
        </div>
        <button
          class="play-btn"
          onclick={() => onStartDrill(fileNode.path)}
          title="Start drills in {key}"
        >
          <span class="icon" use:obsidianIcon={"play"}></span>
        </button>
      </div>
    {:else}
      {@const folderNode = node[key]}
      {@const newPrefix = pathPrefix ? `${pathPrefix}/${key}` : key}
      <div class="fsrs-browser-row">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div
          class="folder-header"
          onclick={() => toggle(key)}
          role="button"
          tabindex="0"
          onkeydown={(e) => {
            if (e.key === "Enter") toggle(key);
          }}
        >
          <span class="tree-icon">{expanded[key] ? "📂" : "📁"}</span>
          <span class="name">{key}</span>
          <span class="count-badge">({folderNode.completedCount}/{folderNode.totalCount} completed)</span>
        </div>
        <button
          class="play-btn"
          onclick={() => onStartDrill(newPrefix)}
          title="Start drills in folder {key}"
        >
          <span class="icon" use:obsidianIcon={"play"}></span>
        </button>
      </div>
      {#if expanded[key]}
        <DrillBrowseFolder
          node={folderNode}
          depth={depth + 1}
          pathPrefix={newPrefix}
          {plugin}
          {onStartDrill}
        />
      {/if}
    {/if}
  </div>
{/each}

<style>
  .item {
    padding: 3px 0;
  }
  .fsrs-browser-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.1s ease;
    width: fit-content;
  }
  .fsrs-browser-row:hover {
    background-color: var(--background-modifier-hover);
  }
  .file {
    color: var(--text-normal);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .folder-header {
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .count-badge {
    font-weight: normal;
    font-size: 12px;
    color: var(--text-muted);
  }
  .tree-icon {
    margin-right: 4px;
  }
  .play-btn {
    background: transparent;
    border: none;
    box-shadow: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-muted);
  }
  .play-btn:hover {
    background-color: var(--background-modifier-active-hover);
    color: var(--interactive-accent);
  }
  .icon :global(svg) {
    width: 16px;
    height: 16px;
    display: block;
  }
</style>
