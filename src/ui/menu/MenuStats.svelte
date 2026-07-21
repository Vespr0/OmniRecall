<script lang="ts">
  import type OmniRecallPlugin from "../../main";

  let {
    plugin,
  }: {
    plugin: OmniRecallPlugin;
  } = $props();
</script>

<div class="stats-panel">
  {#if plugin.settings.highestCombo > 0}
    <div class="stat-box combo-stat">
      <span class="stat-icon">🔥</span>
      <div class="stat-info">
        <span class="stat-value">{plugin.settings.highestCombo}</span>
        <span class="stat-label">Highest Combo</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .stats-panel {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    width: 100%;
  }

  .stat-box {
    display: flex;
    align-items: center;
    gap: 15px;
    background-color: var(--background-secondary);
    padding: 15px 25px;
    border-radius: 10px;
    border: 1px solid var(--background-modifier-border);
  }

  .combo-stat {
    border-color: var(--color-orange);
    box-shadow: 0 0 10px rgba(255, 165, 0, 0.1);
  }

  .stat-icon {
    font-size: 2em;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5em;
    font-weight: bold;
    color: var(--text-normal);
  }

  .stat-label {
    font-size: 0.9em;
    color: var(--text-muted);
  }
</style>
