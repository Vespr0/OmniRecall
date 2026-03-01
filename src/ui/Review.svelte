<script lang="ts">
  import { onMount } from "svelte";
  import type { App as ObsidianApp } from "obsidian";
  import type { CacheManager } from "../cache/cacheManager";
  import type { FSRSEngine } from "../fsrs/engine";
  import type { FSRSMainView } from "./mainView";
  import type { Flashcard } from "../parser/parser";
  import { Rating } from "ts-fsrs";
  import { serializeFSRSCard } from "../fsrs/dataMap";
  import type OmniRecallPlugin from "../main";

  import ReviewCard from "./ReviewCard.svelte";
  import ReviewButtons from "./ReviewButtons.svelte";

  // Prevent TypeScript stripping
  const _components = { ReviewCard, ReviewButtons };

  let {
    app,
    cacheManager,
    fsrsEngine,
    parentView,
    plugin,
    onBack,
  }: {
    app: ObsidianApp;
    cacheManager: CacheManager;
    fsrsEngine: FSRSEngine;
    parentView: FSRSMainView;
    plugin: OmniRecallPlugin;
    onBack: () => void;
  } = $props();

  let reviewQueue: { file: string; card: Flashcard }[] = $state([]);
  let currentCardIndex = $state(0);
  let isShowingAnswer = $state(false);

  let currentItem = $derived(reviewQueue[currentCardIndex]);
  let isCompleted = $derived(
    reviewQueue.length === 0 || currentCardIndex >= reviewQueue.length,
  );

  onMount(() => {
    reviewQueue = cacheManager.getReviewQueue();
    currentCardIndex = 0;
  });

  function showAnswer() {
    if (!isShowingAnswer && currentItem) {
      isShowingAnswer = true;
    }
  }

  async function processReview(rating: Rating) {
    if (!currentItem) return;

    const now = new Date();
    const flashcard = currentItem.card;

    if (!flashcard.fsrsData) return;

    const schedulingInfo = fsrsEngine.reviewCard(
      flashcard.fsrsData.card,
      rating,
      now,
    );
    const nextCardState = schedulingInfo.card;

    try {
      const file = app.vault.getAbstractFileByPath(currentItem.file);
      if (!file) return;

      const currentId = flashcard.fsrsData.id;
      const newFsrsString = serializeFSRSCard(currentId, nextCardState);

      await app.vault.process(file as any, (data) => {
        const exactRegex = new RegExp(`<!--FSRS:${currentId}\\|[^>]+-->`, "g");
        return data.replace(exactRegex, newFsrsString);
      });

      // Optimistic Cache Update
      cacheManager.updateCardFsrsData(currentItem.file, currentId, {
        id: currentId,
        card: nextCardState,
        rawString: newFsrsString,
      });

      // Update daily review count
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      if (!plugin.settings.reviewHistory) {
        plugin.settings.reviewHistory = {};
      }
      if (!plugin.settings.reviewHistory[todayStr]) {
        plugin.settings.reviewHistory[todayStr] = 0;
      }
      plugin.settings.reviewHistory[todayStr]++;
      await plugin.saveSettings();

      isShowingAnswer = false;
      currentCardIndex++;

      if (currentCardIndex >= reviewQueue.length) {
        reviewQueue = cacheManager.getReviewQueue();
        currentCardIndex = 0;
      }
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="top-bar">
  <button onclick={onBack}>&larr; Menu</button>
</div>

<div class="review-container">
  {#if isCompleted}
    <h3 style="margin-top: 40px;">Congratulations!</h3>
    <p>You have reviewed all due flashcards.</p>
  {:else}
    <div class="fsrs-progress">
      Card {currentCardIndex + 1} of {reviewQueue.length}
    </div>

    <ReviewCard
      {app}
      {parentView}
      {currentItem}
      {isShowingAnswer}
      onShowAnswer={showAnswer}
    >
      <ReviewButtons {fsrsEngine} {currentItem} onGrade={processReview} />
    </ReviewCard>
  {/if}
</div>

<style>
  .top-bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .review-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .fsrs-progress {
    margin: 20px 0;
    color: var(--text-muted);
  }
</style>
