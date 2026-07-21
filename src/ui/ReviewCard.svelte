<script lang="ts">
  import ReviewCard from "./review/ReviewCard.svelte";
  const _components = { ReviewCard };
  let props = $props();
</script>

<ReviewCard {...props} />
