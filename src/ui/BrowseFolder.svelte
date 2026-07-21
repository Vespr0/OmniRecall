<script lang="ts">
  import BrowseFolder from "./browse/BrowseFolder.svelte";
  const _components = { BrowseFolder };
  let props = $props();
</script>

<BrowseFolder {...props} />
