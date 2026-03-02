<script lang="ts">
  let {
    day,
  }: {
    day: { date: string; count: number };
  } = $props();

  function getAlpha(count: number): number {
    if (count === 0) return 0.08;
    return Math.min(1, 0.25 + (count / 30) * 0.75);
  }
</script>

<div
  class="heatmap-cell"
  title="{day.date}: {day.count} reviews"
  style="background-color: var(--interactive-accent); opacity: {getAlpha(
    day.count,
  )};"
>
  {#if day.count > 0}
    <span class="cell-count">{day.count}</span>
  {/if}
</div>

<style>
  .heatmap-cell {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell-count {
    font-size: 11px;
    font-weight: 700;
    /* Rendered at 1/opacity so it appears fully opaque visually */
    color: white;
    mix-blend-mode: overlay;
    pointer-events: none;
  }
</style>
