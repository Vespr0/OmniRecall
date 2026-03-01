<script lang="ts">
  // Prevent TypeScript from stripping component imports because they are strictly used in the template
  import BrowseFolder from "./BrowseFolder.svelte";
  const _components = { BrowseFolder };

  let {
    node,
    depth,
  }: {
    node: any;
    depth: number;
  } = $props();

  let keys = Object.keys(node).filter(
    (k) => k !== "_file" && k !== "path" && k !== "count",
  );

  // Manage expanded states for folders
  let expanded: Record<string, boolean> = $state({});

  function toggle(key: string) {
    expanded[key] = !expanded[key];
  }
</script>

{#each keys as key}
  <div class="item" style="margin-left: {depth * 20}px;">
    {#if node[key]._file}
      <div class="file">📄 {key} ({node[key].count} cards)</div>
    {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div
        class="folder-header"
        onclick={() => toggle(key)}
        role="button"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === "Enter") toggle(key);
        }}
      >
        <span class="icon">{expanded[key] ? "📂" : "📁"}</span>
        <span class="name">{key}</span>
      </div>
      {#if expanded[key]}
        <BrowseFolder node={node[key]} depth={depth + 1} />
      {/if}
    {/if}
  </div>
{/each}

<style>
  .item {
    padding: 5px 0;
  }
  .file {
    color: var(--text-normal);
  }
  .folder-header {
    cursor: pointer;
    font-weight: bold;
  }
</style>
