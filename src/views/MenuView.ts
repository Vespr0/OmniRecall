import { setIcon, EventRef } from 'obsidian';
import { CacheManager } from '../cache/cacheManager';
import type SpacedRepetitionPlugin from '../main';

export class MenuView {
  private containerEl: HTMLElement;
  private cacheManager: CacheManager;
  private plugin: SpacedRepetitionPlugin;
  private onReview: () => void;
  private onBrowse: () => void;

  private eventRef: EventRef | null = null;
  private timer: number | null = null;

  constructor(
    containerEl: HTMLElement,
    cacheManager: CacheManager,
    plugin: SpacedRepetitionPlugin,
    onReview: () => void,
    onBrowse: () => void
  ) {
    this.containerEl = containerEl;
    this.cacheManager = cacheManager;
    this.plugin = plugin;
    this.onReview = onReview;
    this.onBrowse = onBrowse;

    this.render();

    this.eventRef = this.cacheManager.on('update', () => this.render()) as EventRef;
    this.timer = window.setInterval(() => this.render(), 60000);
  }

  public destroy() {
    if (this.eventRef) {
      this.cacheManager.offref(this.eventRef);
      this.eventRef = null;
    }
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  public render() {
    this.containerEl.empty();
    const menu = this.containerEl.createDiv('srf-menu-container');

    // 1. Stats Panel (Highest Combo)
    if (this.plugin.settings.highestCombo > 0) {
      const statsPanel = menu.createDiv('srf-stats-panel');
      const statBox = statsPanel.createDiv('srf-stat-box srf-combo-stat');

      statBox.createSpan({ cls: 'srf-stat-icon', text: '🔥' });
      const statInfo = statBox.createDiv('srf-stat-info');
      statInfo.createSpan({ cls: 'srf-stat-value', text: String(this.plugin.settings.highestCombo) });
      statInfo.createSpan({ cls: 'srf-stat-label', text: 'Highest Combo' });
    }

    // 2. Action Buttons
    const dueCount = this.cacheManager.getReviewQueue().length;
    const avgTime = this.plugin.settings.avgReviewTime || 5000;
    const estimatedMinutes = Math.ceil((dueCount * avgTime) / 60000);
    const estimatedText = estimatedMinutes <= 1 ? '< 1 minute' : `~${estimatedMinutes} mins`;

    const actionsGroup = menu.createDiv('srf-actions-group');

    // Review Button + Estimated time container
    const reviewContainer = actionsGroup.createDiv('srf-review-btn-container');
    const reviewBtn = reviewContainer.createEl('button', { cls: 'srf-action-btn srf-review-btn' });
    
    const playIconSpan = reviewBtn.createSpan('srf-btn-icon');
    setIcon(playIconSpan, 'play');
    reviewBtn.createSpan({ text: `Review (${dueCount} Due)` });
    reviewBtn.onclick = () => this.onReview();

    if (dueCount > 0) {
      const estDiv = reviewContainer.createDiv('srf-estimation-container');
      const estLabel = estDiv.createSpan({ cls: 'srf-estimation-label', text: 'Estimated Review Time: ' });
      estLabel.createEl('b', { cls: 'srf-estimation-text', text: estimatedText });
    }

    // Browse Button
    const browseBtn = actionsGroup.createEl('button', { cls: 'srf-action-btn srf-browse-btn' });
    const folderIconSpan = browseBtn.createSpan('srf-btn-icon');
    setIcon(folderIconSpan, 'folder-open');
    browseBtn.createSpan({ text: 'Browse Flashcards' });
    browseBtn.onclick = () => this.onBrowse();
  }
}
