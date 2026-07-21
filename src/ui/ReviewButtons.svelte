<script lang="ts">
  import ReviewButtons from "./review/ReviewButtons.svelte";
  const _components = { ReviewButtons };
  let props = $props();
</script>

<ReviewButtons {...props} />
