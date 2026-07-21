<script lang="ts">
  import Menu from "./menu/Menu.svelte";
  const _components = { Menu };
  let props = $props();
</script>

<Menu {...props} />
