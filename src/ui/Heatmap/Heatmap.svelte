<script lang="ts">
  import type OmniRecallPlugin from "../../main";
  import HeatmapCell from "./HeatmapCell.svelte";

  // Prevent TypeScript from stripping the component import
  const _components = { HeatmapCell };

  let { plugin }: { plugin: OmniRecallPlugin } = $props();

  let reviewHistory = $derived(plugin.settings.reviewHistory);

  // Create an array of 5 weeks (35 days) or exactly what's needed for the 7xN grid
  let calendarGrid = $state<({ date: string; count: number } | null)[][]>([]);
  let monthName = $state("");

  const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function formatLocalYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function generateGrid() {
    const now = new Date();
    monthName =
      now.toLocaleString("default", { month: "long" }) +
      " " +
      now.getFullYear();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of the week the month starts on (0 = Sunday, 1 = Monday...)
    const startOffset = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const weeks: ({ date: string; count: number } | null)[][] = [];
    let currentWeek: ({ date: string; count: number } | null)[] = [];

    // Pad the start of the first week with nulls
    for (let i = 0; i < startOffset; i++) {
      currentWeek.push(null);
    }

    const dateItr = new Date(year, month, 1);
    while (dateItr.getMonth() === month) {
      const dateString = formatLocalYYYYMMDD(dateItr);
      currentWeek.push({
        date: dateString,
        count: reviewHistory[dateString] || 0,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      dateItr.setDate(dateItr.getDate() + 1);
    }

    // Pad the end of the last week with nulls
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    calendarGrid = weeks;
  }

  $effect(() => {
    reviewHistory;
    generateGrid();
  });
</script>

<div class="heatmap-container">
  <h3>{monthName} Reviews</h3>

  <div class="heatmap-wrapper">
    <div class="heatmap-grid">
      <!-- Header row for days of the week -->
      {#each DAYS_OF_WEEK as dayName}
        <div class="day-label">{dayName}</div>
      {/each}

      <!-- Grid cells -->
      {#each calendarGrid as week}
        {#each week as day}
          {#if day}
            <HeatmapCell {day} />
          {:else}
            <!-- Empty placeholder cell for padding -->
            <div class="heatmap-cell empty"></div>
          {/if}
        {/each}
      {/each}
    </div>
  </div>
</div>

<style>
  .heatmap-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 400px;
    margin-bottom: 40px;
  }

  h3 {
    margin-bottom: 20px;
    font-size: 1.2em;
    color: var(--text-normal);
  }

  .heatmap-wrapper {
    background: var(--background-secondary);
    padding: 16px;
    border-radius: 10px;
    border: 1px solid var(--background-modifier-border);
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .heatmap-grid {
    display: grid;
    /* 7 columns for 7 days of the week */
    grid-template-columns: repeat(7, 1fr);
    gap: clamp(4px, 2%, 10px);
    width: 100%;
    box-sizing: border-box;
  }

  .day-label {
    font-size: 0.9em;
    font-weight: bold;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 6px;
  }

  /* Just for the empty slots padding the start/end of the month */
  .heatmap-cell.empty {
    width: 100%;
    aspect-ratio: 1;
    background: transparent;
  }
</style>
