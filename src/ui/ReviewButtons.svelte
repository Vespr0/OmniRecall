<script lang="ts">
  import type { FSRSEngine } from "../fsrs/engine";
  import type { Flashcard } from "../parser/parser";
  import { Rating } from "ts-fsrs";

  let {
    fsrsEngine,
    currentItem,
    onGrade,
    showIntervalPredictions = false,
  }: {
    fsrsEngine: FSRSEngine;
    currentItem: { file: string; card: Flashcard } | undefined;
    onGrade: (rating: Rating) => void;
    showIntervalPredictions?: boolean;
  } = $props();

  const fail = [
    { rating: Rating.Again, text: "Again", color: "var(--color-red)" },
  ];

  const pass = [
    { rating: Rating.Hard, text: "Hard", color: "var(--color-orange)" },
    { rating: Rating.Good, text: "Good", color: "var(--color-green)" },
    { rating: Rating.Easy, text: "Easy", color: "var(--color-blue)" },
  ];

  let now = $derived(new Date());

  function getDaysString(now: Date, nextDue: Date): string {
    const diffMs = nextDue.getTime() - now.getTime();
    const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));
    const diffDays = diffHours / 24;

    if (diffDays < 1) {
      if (diffHours < 1) return "< 1h";
      return `${Math.round(diffHours)}h`;
    }
    if (diffDays < 30) return `${Math.round(diffDays)}d`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)}mo`;
    return `${(diffDays / 365).toFixed(1)}y`;
  }

  function getNextDueInfo(flashcard: Flashcard, rating: Rating) {
    if (rating === Rating.Again) return ""; // Do not show next due for "Again"
    if (!flashcard.fsrsData) return "";
    const nextCard = fsrsEngine.reviewCard(
      flashcard.fsrsData.card,
      rating,
      now,
    ).card;
    return getDaysString(now, nextCard.due);
  }
</script>

<div class="fsrs-buttons">
  {#if currentItem}
    {#each fail as r}
      <button
        class="rating-btn"
        style="border-color: {r.color};"
        onclick={(e) => {
          e.stopPropagation();
          onGrade(r.rating);
        }}
      >
        <span>{r.text}</span>
        {#if showIntervalPredictions && getNextDueInfo(currentItem.card, r.rating)}
          <span class="due-text"
            >{getNextDueInfo(currentItem.card, r.rating)}</span
          >
        {/if}
      </button>
    {/each}

    <div
      class="separator"
      title="Recalled? Hard / Good / Easy. Failed? Again."
    ></div>

    {#each pass as r}
      <button
        class="rating-btn"
        style="border-color: {r.color};"
        onclick={(e) => {
          e.stopPropagation();
          onGrade(r.rating);
        }}
      >
        <span>{r.text}</span>
        {#if showIntervalPredictions && getNextDueInfo(currentItem.card, r.rating)}
          <span class="due-text"
            >{getNextDueInfo(currentItem.card, r.rating)}</span
          >
        {/if}
      </button>
    {/each}
  {/if}
</div>

<style>
  .fsrs-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 30px;
    width: 100%;
  }

  .rating-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 18px 16px;
    background-color: var(--interactive-normal);
    border: 2px solid var(--background-modifier-border);
    color: var(--text-normal);
    font-weight: bold;
    cursor: pointer;
    border-radius: 5px;
    flex: 1 1 0;
    min-width: 0;
    white-space: nowrap;
    transition: background-color 0.15s ease;
  }

  .rating-btn:hover {
    background-color: var(--interactive-hover);
  }

  .separator {
    width: 1px;
    align-self: stretch;
    background-color: var(--background-modifier-border);
    margin: 0 4px;
    flex-shrink: 0;
    cursor: default;
  }

  .due-text {
    font-size: 0.8em;
    color: var(--text-muted);
    font-weight: normal;
    margin-top: 2px;
  }
</style>
