<script lang="ts">
  import SettingsApp from "./settings/SettingsApp.svelte";
  const _components = { SettingsApp };
  let props = $props();
</script>

<SettingsApp {...props} />
