<script lang="ts">
  import { onMount } from "svelte";
  import type { App as ObsidianApp } from "obsidian";
  import type { CacheManager } from "../../cache/cacheManager";
  import type { FSRSEngine } from "../../fsrs/engine";
  import type { FSRSMainView } from "../common/mainView";
  import type { Flashcard } from "../../parser/parser";
  import { Rating } from "ts-fsrs";
  import { serializeFSRSCard } from "../../fsrs/dataMap";
  import type OmniRecallPlugin from "../../main";

  import ReviewProgress from "./ReviewProgress.svelte";
  import ReviewCard from "./ReviewCard.svelte";
  import ReviewButtons from "./ReviewButtons.svelte";
  import { playSuccessSound, playFailSound, playFlipSound } from "../common/audio";

  const _components = { ReviewProgress, ReviewCard, ReviewButtons };

  let {
    app,
    cacheManager,
    fsrsEngine,
    parentView,
    plugin,
    reviewPrefix = null,
    onBack,
  }: {
    app: ObsidianApp;
    cacheManager: CacheManager;
    fsrsEngine: FSRSEngine;
    parentView: FSRSMainView;
    plugin: OmniRecallPlugin;
    reviewPrefix?: string | null;
    onBack: () => void;
  } = $props();

  let reviewQueue: { file: string; card: Flashcard }[] = $state([]);
  let currentCardIndex = $state(0);
  let isShowingAnswer = $state(false);
  let cardStartTime = $state(0);
  let combo = $state(0);
  let isShaking = $state(false);

  let currentItem = $derived(reviewQueue[currentCardIndex]);
  let isCompleted = $derived(
    reviewQueue.length === 0 || currentCardIndex >= reviewQueue.length,
  );

  onMount(() => {
    reviewQueue = cacheManager.getReviewQueue(reviewPrefix);
    currentCardIndex = 0;
    cardStartTime = Date.now();
  });

  function toggleAnswer() {
    if (currentItem) {
      isShowingAnswer = !isShowingAnswer;
      if (plugin.settings.enableAudio) {
        playFlipSound();
      }
    }
  }

  async function processReview(rating: Rating) {
    if (!currentItem) return;

    const timeTaken = Date.now() - cardStartTime;
    // Only count reasonable review times (between 0.5s and 60s)
    if (timeTaken > 500 && timeTaken < 60000) {
      const currentAvg = plugin.settings.avgReviewTime || 5000;
      plugin.settings.avgReviewTime = currentAvg * 0.9 + timeTaken * 0.1;
    }

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
      // Gamification updates
      if (
        rating === Rating.Hard ||
        rating === Rating.Good ||
        rating === Rating.Easy
      ) {
        combo++;
        if (combo > plugin.settings.highestCombo) {
          plugin.settings.highestCombo = combo;
        }
        if (plugin.settings.enableAudio) playSuccessSound();
      } else {
        combo = 0;
        if (rating === Rating.Again) {
          isShaking = true;
          setTimeout(() => { isShaking = false; }, 400); // Remove shake class after animation
        }
        if (plugin.settings.enableAudio) playFailSound();
      }

      await plugin.saveSettings();

      isShowingAnswer = false;
      currentCardIndex++;
      cardStartTime = Date.now();

      if (currentCardIndex >= reviewQueue.length) {
        reviewQueue = cacheManager.getReviewQueue(reviewPrefix);
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
    <ReviewProgress
      currentIndex={currentCardIndex}
      totalCards={reviewQueue.length}
      {combo}
    />

    <ReviewCard
      {app}
      {parentView}
      {currentItem}
      {isShowingAnswer}
      enableAnimations={plugin.settings.enableAnimations}
      isShaking={isShaking}
      onToggleAnswer={toggleAnswer}
    >
      <ReviewButtons
        {fsrsEngine}
        {currentItem}
        onGrade={processReview}
        showIntervalPredictions={plugin.settings.showIntervalPredictions}
      />
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
</style>
