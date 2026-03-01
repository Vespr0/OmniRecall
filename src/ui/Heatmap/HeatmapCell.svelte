<script lang="ts">
  let {
    day,
  }: {
    day: { date: string; count: number };
  } = $props();

  // Calculate opacity based on count. Let's say max 50 for max opacity
  function getOpacity(count: number) {
    if (count === 0) return 0.1;
    return Math.min(1, 0.2 + (count / 50) * 0.8);
  }
</script>

<div
  class="heatmap-cell"
  title="{day.date}: {day.count} reviews"
  style="background-color: var(--interactive-accent); opacity: {getOpacity(
    day.count,
  )};"
></div>

<style>
  .heatmap-cell {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.1s ease;
    box-sizing: border-box;
  }

  .heatmap-cell:hover {
    transform: scale(1.05);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
  }
</style>
