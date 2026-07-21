<script lang="ts">
  import Browse from "./browse/Browse.svelte";
  const _components = { Browse };
  let props = $props();
</script>

<Browse {...props} />
