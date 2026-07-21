<script lang="ts">
  import Review from "./review/Review.svelte";
  const _components = { Review };
  let props = $props();
</script>

<Review {...props} />
