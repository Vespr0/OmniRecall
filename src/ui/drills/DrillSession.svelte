<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { App as ObsidianApp, MarkdownRenderer } from 'obsidian';
  import type { CacheManager } from '../../cache/cacheManager';
  import type OmniRecallPlugin from '../../main';
  import type { DrillCard, MultipleChoiceOption } from '../../cache/drillTypes';

  let {
    app,
    cacheManager,
    plugin,
    folderPath,
    onBack
  }: {
    app: ObsidianApp;
    cacheManager: CacheManager;
    plugin: OmniRecallPlugin;
    folderPath: string;
    onBack: () => void;
  } = $props();

  let drills: DrillCard[] = $state([]);
  let currentIndex: number = $state(0);
  let showAnswer: boolean = $state(false);
  let selectedOptionIndices: Set<number> = $state(new Set());
  let feedbackMessage: string | null = $state(null);
  let isFinished: boolean = $state(false);

  // Live Timer
  let startTime: number = $state(Date.now());
  let elapsedTimeMs: number = $state(0);
  let timerInterval: any = null;

  let currentDrill = $derived(drills[currentIndex] || null);

  let wasAutoStarted: boolean = $state(false);
  let questionEl: HTMLElement | null = $state(null);
  let answerEl: HTMLElement | null = $state(null);

  onMount(() => {
    loadDrills();
    startTimer();
    checkAutoStartPomodoro();
  });

  onDestroy(() => {
    stopTimer();
    checkEndAutoPomodoro();
  });

  function getTaskTitle(): string {
    if (!folderPath) return "Drills";
    let p = folderPath;
    if (p.endsWith('.md')) {
      const idx = p.lastIndexOf('/');
      p = idx !== -1 ? p.substring(0, idx) : p;
    }
    return p;
  }

  function checkAutoStartPomodoro() {
    try {
      const fcPlugin = (app as any).plugins?.plugins?.['focus-calendar-pomodoro'];
      if (fcPlugin && typeof fcPlugin.startAutoStudySession === 'function') {
        const title = getTaskTitle();
        wasAutoStarted = fcPlugin.startAutoStudySession(title);
      }
    } catch (e) {
      console.error('Failed to trigger Focus Calendar interlock', e);
    }
  }

  function checkEndAutoPomodoro() {
    const elapsedSec = Math.round(elapsedTimeMs / 1000);
    try {
      (app.workspace as any).trigger('omnirecall:drill-complete', {
        title: getTaskTitle(),
        timeSec: elapsedSec
      });

      const fcPlugin = (app as any).plugins?.plugins?.['focus-calendar-pomodoro'];
      if (fcPlugin && wasAutoStarted && typeof fcPlugin.endAutoStudySession === 'function') {
        fcPlugin.endAutoStudySession();
      }
    } catch (e) {
      console.error('Failed to end Focus Calendar interlock', e);
    }
  }

  function loadDrills() {
    const allDrillsMap = cacheManager.getDrillsData();
    const list: DrillCard[] = [];

    for (const filePath in allDrillsMap) {
      if (filePath === folderPath || filePath.startsWith(folderPath + '/')) {
        list.push(...allDrillsMap[filePath]);
      }
    }

    drills = list;
    currentIndex = 0;
    showAnswer = false;
    selectedOptionIndices = new Set();
    feedbackMessage = null;
    isFinished = drills.length === 0;
  }

  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      elapsedTimeMs = Date.now() - startTime;
    }, 100);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  $effect(() => {
    if (currentDrill && questionEl) {
      questionEl.innerHTML = '';
      MarkdownRenderer.render(app, currentDrill.question, questionEl, currentDrill.filePath, plugin);
    }
  });

  $effect(() => {
    if (currentDrill && showAnswer && answerEl) {
      answerEl.innerHTML = '';
      MarkdownRenderer.render(app, currentDrill.answer, answerEl, currentDrill.filePath, plugin);
    }
  });

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function toggleOption(idx: number) {
    if (showAnswer) return;
    const next = new Set(selectedOptionIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    selectedOptionIndices = next;
  }

  async function submitMultipleChoice() {
    if (!currentDrill || currentDrill.type !== 'multiple-choice') return;
    showAnswer = true;

    const correctIndices = currentDrill.options
      .map((opt, idx) => (opt.isCorrect ? idx : -1))
      .filter(idx => idx !== -1);

    const isAllCorrect =
      correctIndices.length === selectedOptionIndices.size &&
      correctIndices.every(idx => selectedOptionIndices.has(idx));

    if (isAllCorrect) {
      feedbackMessage = '✅ Correct!';
      await recordResult(true);
    } else {
      feedbackMessage = '❌ Incorrect. Review the correct option(s) below.';
      await recordResult(false);
    }
  }

  async function recordResult(passed: boolean) {
    if (!currentDrill) return;

    const timeSec = Math.round((Date.now() - startTime) / 1000);
    const existing = plugin.settings.drillTelemetry[currentDrill.id] || {
      completed: false,
      attempts: 0,
      lastTimeSeconds: 0,
      lastCompletedAt: 0
    };

    plugin.settings.drillTelemetry[currentDrill.id] = {
      completed: passed || existing.completed,
      attempts: existing.attempts + 1,
      lastTimeSeconds: timeSec,
      lastCompletedAt: Date.now()
    };

    await plugin.saveSettings();
  }

  async function handlePass() {
    await recordResult(true);
    nextCard();
  }

  async function handleFail() {
    await recordResult(false);
    nextCard();
  }

  function nextCard() {
    showAnswer = false;
    selectedOptionIndices = new Set();
    feedbackMessage = null;
    startTime = Date.now();

    if (currentIndex < drills.length - 1) {
      currentIndex++;
    } else {
      isFinished = true;
      stopTimer();
    }
  }
  function renderOptionMarkdown(node: HTMLElement, text: string) {
    node.innerHTML = '';
    if (currentDrill) {
      MarkdownRenderer.render(app, text, node, currentDrill.filePath, plugin);
    } else {
      node.textContent = text;
    }
  }
</script>

<div class="drill-session-wrapper">
  <div class="drill-session-header">
    <button class="back-btn" onclick={onBack}>← Back to Folders</button>
    <div class="timer-badge">⏱️ {formatTime(elapsedTimeMs)}</div>
  </div>

  {#if isFinished}
    <div class="finish-screen">
      <h2>🎉 Drill Completed!</h2>
      <p>Total time spent: <strong>{formatTime(elapsedTimeMs)}</strong></p>
      <button class="action-btn" onclick={onBack}>Return to Folder Browser</button>
    </div>
  {:else if currentDrill}
    <div class="drill-card">
      <div class="drill-card-meta">
        <span>Question {currentIndex + 1} of {drills.length}</span>
        <span class="type-tag">{currentDrill.type === 'multiple-choice' ? 'Multiple Choice' : 'Q&A'}</span>
      </div>

      <div class="drill-question" bind:this={questionEl}></div>

      {#if currentDrill.type === 'multiple-choice'}
        <div class="options-grid">
          {#each currentDrill.options as option, idx}
            {@const isSelected = selectedOptionIndices.has(idx)}
            {@const isCorrect = option.isCorrect}
            <button
              class="option-btn {isSelected ? 'selected' : ''} {showAnswer ? (isCorrect ? 'correct' : (isSelected ? 'wrong' : '')) : ''}"
              onclick={() => toggleOption(idx)}
              disabled={showAnswer}
            >
              <span class="checkbox-indicator">{isSelected ? '☑' : '☐'}</span>
              <span use:renderOptionMarkdown={option.text}></span>
            </button>
          {/each}
        </div>

        {#if !showAnswer}
          <button class="submit-btn" onclick={submitMultipleChoice} disabled={selectedOptionIndices.size === 0}>
            Submit Answer
          </button>
        {/if}
      {:else}
        {#if !showAnswer}
          <button class="submit-btn" onclick={() => (showAnswer = true)}>
            Show Answer
          </button>
        {/if}
      {/if}

      {#if showAnswer}
        <div class="drill-answer-section">
          {#if currentDrill.type === 'multiple-choice'}
            {#if feedbackMessage}
              <div class="feedback-banner">{feedbackMessage}</div>
            {/if}
            <div class="eval-buttons">
              <button class="eval-btn pass" onclick={nextCard}>Next Question →</button>
            </div>
          {:else}
            <h3>Answer</h3>
            <div class="drill-answer" bind:this={answerEl}></div>

            <div class="eval-buttons">
              <button class="eval-btn fail" onclick={handleFail}>❌ Fail / Retry</button>
              <button class="eval-btn pass" onclick={handlePass}>✅ Pass</button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .drill-session-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    max-width: 700px;
    margin: 0 auto;
    width: 100%;
  }
  .drill-session-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .back-btn {
    background: transparent;
    border: 1px solid var(--background-modifier-border);
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .timer-badge {
    font-family: monospace;
    font-size: 16px;
    font-weight: bold;
    background: var(--background-secondary);
    padding: 6px 12px;
    border-radius: 6px;
    color: var(--interactive-accent);
  }
  .drill-card {
    background: var(--background-primary-alt);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .drill-card-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-muted);
  }
  .type-tag {
    background: var(--background-secondary);
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .drill-question {
    font-size: 16px;
    line-height: 1.5;
  }
  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .option-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
  }
  .option-btn.selected {
    border-color: var(--interactive-accent);
    background: var(--background-modifier-hover);
  }
  .option-btn.correct {
    background: rgba(46, 204, 113, 0.2);
    border-color: #2ecc71;
  }
  .option-btn.wrong {
    background: rgba(231, 76, 60, 0.2);
    border-color: #e74c3c;
  }
  .submit-btn {
    align-self: flex-start;
    padding: 8px 16px;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  .drill-answer-section {
    border-top: 1px dashed var(--background-modifier-border);
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .feedback-banner {
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 600;
    background: var(--background-secondary);
  }
  .eval-buttons {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
  .eval-btn {
    flex: 1;
    padding: 10px;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
  }
  .eval-btn.pass {
    background: #2ecc71;
    color: white;
  }
  .eval-btn.fail {
    background: #e74c3c;
    color: white;
  }
  .finish-screen {
    text-align: center;
    padding: 40px 20px;
    background: var(--background-primary-alt);
    border-radius: 8px;
  }
</style>
