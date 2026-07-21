<script lang="ts">
  let {
    currentIndex,
    totalCards,
    combo = 0,
  }: {
    currentIndex: number;
    totalCards: number;
    combo?: number;
  } = $props();
  let showCombo = $state(false);
  let timeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (combo > 0) {
      showCombo = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        showCombo = false;
      }, 1500);
    } else {
      showCombo = false;
    }
  });
</script>

<div class="fsrs-progress">
  <div class="progress-info">Card {currentIndex + 1} of {totalCards}</div>
  <div
    class="combo-tracker {showCombo ? 'visible' : ''}"
    style="transform: scale({1 + Math.min(combo * 0.05, 0.3)})"
  >
    {#if combo > 0}
      🔥 Combo x{combo}!
    {/if}
  </div>
</div>

<style>
  .fsrs-progress {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .progress-info {
    color: var(--text-muted);
  }

  .combo-tracker {
    color: var(--color-orange);
    font-weight: bold;
    font-size: 1.1em;
    opacity: 0;
    pointer-events: none;
    height: 0;
    overflow: hidden;
    transition: opacity 0.3s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-shadow: 0 0 10px rgba(255, 165, 0, 0.3);
  }

  .combo-tracker.visible {
    opacity: 1;
    height: auto;
    overflow: visible;
  }
</style>
