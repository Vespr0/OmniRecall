import { App, MarkdownRenderer, Component } from 'obsidian';
import { Rating } from 'ts-fsrs';
import { CacheManager } from '../cache/cacheManager';
import { FSRSEngine } from '../fsrs/engine';
import { Flashcard } from '../parser/parser';
import { serializeFSRSCard } from '../fsrs/dataMap';
import { playSuccessSound, playFailSound, playFlipSound } from '../audio';
import type SpacedRepetitionPlugin from '../main';

export class ReviewView {
  private containerEl: HTMLElement;
  private app: App;
  private cacheManager: CacheManager;
  private fsrsEngine: FSRSEngine;
  private plugin: SpacedRepetitionPlugin;
  private parentComponent: Component;
  private reviewPrefix: string | null;
  private onBack: () => void;

  private reviewQueue: { file: string; card: Flashcard }[] = [];
  private currentCardIndex = 0;
  private isShowingAnswer = false;
  private cardStartTime = 0;
  private sessionStartTime = 0;
  private combo = 0;
  private wasAutoStarted = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(
    containerEl: HTMLElement,
    app: App,
    cacheManager: CacheManager,
    fsrsEngine: FSRSEngine,
    plugin: SpacedRepetitionPlugin,
    parentComponent: Component,
    reviewPrefix: string | null,
    onBack: () => void
  ) {
    this.containerEl = containerEl;
    this.app = app;
    this.cacheManager = cacheManager;
    this.fsrsEngine = fsrsEngine;
    this.plugin = plugin;
    this.parentComponent = parentComponent;
    this.reviewPrefix = reviewPrefix;
    this.onBack = onBack;

    this.reviewQueue = this.cacheManager.getReviewQueue(this.reviewPrefix);
    this.currentCardIndex = 0;
    this.cardStartTime = Date.now();
    this.sessionStartTime = Date.now();

    this.checkAutoStartPomodoro();
    this.attachKeyboardListener();
    this.render();
  }

  public destroy() {
    this.detachKeyboardListener();
    this.checkEndAutoPomodoro();
  }

  private attachKeyboardListener() {
    this.keydownHandler = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in an input
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (this.currentCardIndex >= this.reviewQueue.length) return;

      if (!this.isShowingAnswer) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.toggleAnswer();
        }
      } else {
        if (e.key === '1') {
          e.preventDefault();
          this.processReview(Rating.Again);
        } else if (e.key === '2') {
          e.preventDefault();
          this.processReview(Rating.Hard);
        } else if (e.key === '3') {
          e.preventDefault();
          this.processReview(Rating.Good);
        } else if (e.key === '4') {
          e.preventDefault();
          this.processReview(Rating.Easy);
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.processReview(Rating.Good);
        }
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
  }

  private detachKeyboardListener() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  private getTaskTitle(): string {
    return 'Flashcards';
  }

  private checkAutoStartPomodoro() {
    try {
      const fcPlugin = (this.app as any).plugins?.plugins?.['focus-calendar-pomodoro'];
      if (fcPlugin) {
        if (typeof fcPlugin.startAutoFlashcardSession === 'function') {
          this.wasAutoStarted = fcPlugin.startAutoFlashcardSession();
        } else if (typeof fcPlugin.startAutoStudySession === 'function') {
          this.wasAutoStarted = fcPlugin.startAutoStudySession('Flashcards');
        }
      }
    } catch (e) {
      console.error('Failed to trigger Focus Calendar interlock', e);
    }
  }

  private checkEndAutoPomodoro() {
    const elapsedSec = Math.round((Date.now() - this.sessionStartTime) / 1000);
    try {
      (this.app.workspace as any).trigger('spaced-repetition:review-complete', {
        title: 'Flashcards',
        timeSec: elapsedSec,
      });

      const fcPlugin = (this.app as any).plugins?.plugins?.['focus-calendar-pomodoro'];
      if (fcPlugin && this.wasAutoStarted && typeof fcPlugin.endAutoStudySession === 'function') {
        fcPlugin.endAutoStudySession();
      }
    } catch (e) {
      console.error('Failed to end Focus Calendar interlock', e);
    }
  }

  public toggleAnswer() {
    const currentItem = this.reviewQueue[this.currentCardIndex];
    if (currentItem) {
      this.isShowingAnswer = !this.isShowingAnswer;
      if (this.plugin.settings.enableAudio) {
        playFlipSound();
      }
      this.render();
    }
  }

  public async processReview(rating: Rating) {
    const currentItem = this.reviewQueue[this.currentCardIndex];
    if (!currentItem || !currentItem.card.fsrsData) return;

    const timeTaken = Date.now() - this.cardStartTime;
    if (timeTaken > 500 && timeTaken < 60000) {
      const currentAvg = this.plugin.settings.avgReviewTime || 5000;
      this.plugin.settings.avgReviewTime = currentAvg * 0.9 + timeTaken * 0.1;
    }

    const now = new Date();
    const flashcard = currentItem.card;
    const schedulingInfo = this.fsrsEngine.reviewCard(flashcard.fsrsData.card, rating, now);
    const nextCardState = schedulingInfo.card;

    try {
      const file = this.app.vault.getAbstractFileByPath(currentItem.file);
      if (!file) return;

      const currentId = flashcard.fsrsData.id;
      const newFsrsString = serializeFSRSCard(currentId, nextCardState);

      await this.app.vault.process(file as any, (data) => {
        const exactRegex = new RegExp(`<!--FSRS:${currentId}\\|[^>]+-->`, 'g');
        return data.replace(exactRegex, newFsrsString);
      });

      // Optimistic cache update
      this.cacheManager.updateCardFsrsData(currentItem.file, currentId, {
        id: currentId,
        card: nextCardState,
        rawString: newFsrsString,
      });

      // Daily history
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      if (!this.plugin.settings.reviewHistory) {
        this.plugin.settings.reviewHistory = {};
      }
      this.plugin.settings.reviewHistory[todayStr] = (this.plugin.settings.reviewHistory[todayStr] || 0) + 1;

      // Gamification
      if (rating === Rating.Hard || rating === Rating.Good || rating === Rating.Easy) {
        this.combo++;
        if (this.combo > this.plugin.settings.highestCombo) {
          this.plugin.settings.highestCombo = this.combo;
        }
        if (this.plugin.settings.enableAudio) playSuccessSound();
      } else {
        this.combo = 0;
        if (this.plugin.settings.enableAudio) playFailSound();
      }

      await this.plugin.saveSettings();

      this.isShowingAnswer = false;
      this.currentCardIndex++;
      this.cardStartTime = Date.now();

      if (this.currentCardIndex >= this.reviewQueue.length) {
        this.reviewQueue = this.cacheManager.getReviewQueue(this.reviewPrefix);
        this.currentCardIndex = 0;
      }

      this.render();

      if (rating === Rating.Again && this.plugin.settings.enableAnimations) {
        const sceneEl = this.containerEl.querySelector('.srf-card-scene');
        if (sceneEl) {
          sceneEl.addClass('shake');
          setTimeout(() => sceneEl.removeClass('shake'), 400);
        }
      }
    } catch (err) {
      console.error('Error saving flashcard review:', err);
    }
  }

  public render() {
    this.containerEl.empty();
    const reviewWrapper = this.containerEl.createDiv('srf-review-container');

    // Top Bar
    const topBar = reviewWrapper.createDiv('srf-top-bar');
    const backBtn = topBar.createEl('button', { cls: 'srf-back-btn', text: '← Menu' });
    backBtn.onclick = () => this.onBack();

    const isCompleted = this.reviewQueue.length === 0 || this.currentCardIndex >= this.reviewQueue.length;

    if (isCompleted) {
      const compDiv = reviewWrapper.createDiv('srf-complete-container');
      compDiv.createEl('h2', { cls: 'srf-complete-title', text: '🎉 Congratulations!' });
      compDiv.createEl('p', { cls: 'srf-complete-sub', text: 'You have reviewed all due flashcards.' });
      const returnBtn = compDiv.createEl('button', { cls: 'srf-action-btn srf-review-btn', text: 'Return to Menu' });
      returnBtn.onclick = () => this.onBack();
      return;
    }

    const currentItem = this.reviewQueue[this.currentCardIndex];

    // Progress bar & combo
    const progressContainer = reviewWrapper.createDiv('srf-progress-container');
    progressContainer.createDiv({
      cls: 'srf-progress-info',
      text: `Card ${this.currentCardIndex + 1} of ${this.reviewQueue.length}`,
    });

    const comboTracker = progressContainer.createDiv({
      cls: `srf-combo-tracker ${this.combo > 0 ? 'visible' : ''}`,
      text: `🔥 Combo x${this.combo}!`,
    });
    if (this.combo > 0) {
      comboTracker.style.transform = `scale(${1 + Math.min(this.combo * 0.05, 0.3)})`;
    }

    // 3D Card Scene
    const cardScene = reviewWrapper.createDiv('srf-card-scene');
    const flipper = cardScene.createDiv({
      cls: `srf-card-flipper ${this.isShowingAnswer && this.plugin.settings.enableAnimations ? 'is-flipped' : ''}`,
    });

    // Breadcrumbs
    let fileName = currentItem.file.split('/').pop() || '';
    let parts = ['📄 ' + fileName];
    if (currentItem.card.context && currentItem.card.context.length > 0) {
      parts.push(...currentItem.card.context);
    }
    const breadcrumbsText = parts.join(' > ');

    // Front Face
    const frontFace = flipper.createDiv('srf-card-face srf-card-front');
    frontFace.onclick = () => {
      if (!this.isShowingAnswer) this.toggleAnswer();
    };

    const frontContext = frontFace.createDiv('srf-card-context');
    frontContext.textContent = breadcrumbsText;

    const frontContent = frontFace.createDiv('srf-card-content');
    MarkdownRenderer.render(
      this.app,
      currentItem.card.front,
      frontContent,
      currentItem.file,
      this.parentComponent
    );

    // Back Face
    const backFace = flipper.createDiv('srf-card-face srf-card-back');
    const backContext = backFace.createDiv('srf-card-context');
    backContext.textContent = breadcrumbsText;

    const backContent = backFace.createDiv('srf-card-content');
    MarkdownRenderer.render(
      this.app,
      currentItem.card.back,
      backContent,
      currentItem.file,
      this.parentComponent
    );

    // Grading Buttons on Back Face
    const buttonsGrid = backFace.createDiv('srf-buttons-grid');

    const againBtn = this.createGradeButton(buttonsGrid, 'Again', 'again', Rating.Again, currentItem.card);
    buttonsGrid.createDiv('srf-btn-separator');
    const hardBtn = this.createGradeButton(buttonsGrid, 'Hard', 'hard', Rating.Hard, currentItem.card);
    const goodBtn = this.createGradeButton(buttonsGrid, 'Good', 'good', Rating.Good, currentItem.card);
    const easyBtn = this.createGradeButton(buttonsGrid, 'Easy', 'easy', Rating.Easy, currentItem.card);
  }

  private createGradeButton(
    container: HTMLElement,
    label: string,
    cls: string,
    rating: Rating,
    card: Flashcard
  ): HTMLButtonElement {
    const btn = container.createEl('button', { cls: `srf-rating-btn ${cls}` });
    btn.createSpan({ text: label });

    if (this.plugin.settings.showIntervalPredictions && rating !== Rating.Again && card.fsrsData) {
      const now = new Date();
      const nextDue = this.fsrsEngine.reviewCard(card.fsrsData.card, rating, now).card.due;
      const dueText = this.getDaysString(now, nextDue);
      btn.createSpan({ cls: 'srf-due-text', text: dueText });
    }

    btn.onclick = (e) => {
      e.stopPropagation();
      this.processReview(rating);
    };

    return btn;
  }

  private getDaysString(now: Date, nextDue: Date): string {
    const diffMs = nextDue.getTime() - now.getTime();
    const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));
    const diffDays = diffHours / 24;

    if (diffDays < 1) {
      if (diffHours < 1) return '< 1h';
      return `${Math.round(diffHours)}h`;
    }
    if (diffDays < 30) return `${Math.round(diffDays)}d`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)}mo`;
    return `${(diffDays / 365).toFixed(1)}y`;
  }
}
