<script lang="ts">
  import { setIcon } from "obsidian";
  // Prevent TypeScript from stripping component imports because they are strictly used in the template
  import BrowseFolder from "./BrowseFolder.svelte";
  const _components = { BrowseFolder };

  let {
    node,
    depth,
    pathPrefix = "",
    goReviewFiltered,
  }: {
    node: any;
    depth: number;
    pathPrefix?: string;
    goReviewFiltered: (path: string) => void;
  } = $props();

  let keys = $derived(
    Object.keys(node).filter(
      (k) => k !== "_file" && k !== "path" && k !== "count",
    ),
  );

  // Manage expanded states for folders
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
      <div class="fsrs-browser-row">
        <div class="file">📄 {key} ({node[key].count} cards)</div>
        <button
          class="play-btn"
          onclick={() => goReviewFiltered(node[key].path)}
          title="Review {key}"
        >
          <span class="icon" use:obsidianIcon={"play"}></span>
        </button>
      </div>
    {:else}
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
        </div>
        <button
          class="play-btn"
          onclick={() => goReviewFiltered(newPrefix)}
          title="Review folder {key}"
        >
          <span class="icon" use:obsidianIcon={"play"}></span>
        </button>
      </div>
      {#if expanded[key]}
        <BrowseFolder
          node={node[key]}
          depth={depth + 1}
          pathPrefix={newPrefix}
          {goReviewFiltered}
        />
      {/if}
    {/if}
  </div>
{/each}

<style>
  .item {
    padding: 5px 0;
  }
  .fsrs-browser-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
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
  }
  .folder-header {
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
  }
  .tree-icon {
    margin-right: 6px;
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
