<script lang="ts">
  import type { FSRSEngine } from "../fsrs/engine";
  import type { Flashcard } from "../parser/parser";
  import { Rating } from "ts-fsrs";

  let {
    fsrsEngine,
    currentItem,
    onGrade,
  }: {
    fsrsEngine: FSRSEngine;
    currentItem: { file: string; card: Flashcard } | undefined;
    onGrade: (rating: Rating) => void;
  } = $props();

  const ratings = [
    { rating: Rating.Again, text: "Again", color: "var(--color-red)" },
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
    {#each ratings as r}
      <button
        class="rating-btn"
        style="background-color: {r.color}; border-color: {r.color};"
        onclick={(e) => {
          e.stopPropagation();
          onGrade(r.rating);
        }}
      >
        <span>{r.text}</span>
        {#if getNextDueInfo(currentItem.card, r.rating)}
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
    padding: 10px 20px;
    border: 1px solid;
    color: white;
    font-weight: bold;
    cursor: pointer;
    border-radius: 5px;
    min-width: 80px;
  }

  .due-text {
    font-size: 0.8em;
    color: rgba(255, 255, 255, 0.85);
    font-weight: normal;
  }
</style>
