import { ItemView, WorkspaceLeaf, EventRef, setIcon } from 'obsidian';
import { CacheManager } from '../cache/cacheManager';
import { FSRSEngine } from '../fsrs/engine';
import { MenuView } from './MenuView';
import { ReviewView } from './ReviewView';
import { BrowseView } from './BrowseView';
import { DrillBrowseView, DrillSessionView } from './DrillViews';
import type SpacedRepetitionPlugin from '../main';

export const VIEW_TYPE_SPACED_REPETITION = 'spaced-repetition-main-view';

export type ActiveTab = 'flashcards' | 'drills';
export type FlashcardViewMode = 'menu' | 'review' | 'browse';

export class SpacedRepetitionMainView extends ItemView {
  private cacheManager: CacheManager;
  private fsrsEngine: FSRSEngine;
  private plugin: SpacedRepetitionPlugin;

  private activeTab: ActiveTab = 'flashcards';
  private flashcardMode: FlashcardViewMode = 'menu';
  private currentReviewPrefix: string | null = null;
  private currentDrillFolder: string = '';
  private isDrillSessionActive: boolean = false;

  private activeSubView: { destroy?: () => void } | null = null;
  private breakEventRef: EventRef | null = null;

  constructor(leaf: WorkspaceLeaf, cacheManager: CacheManager, plugin: SpacedRepetitionPlugin) {
    super(leaf);
    this.cacheManager = cacheManager;
    this.plugin = plugin;
    this.fsrsEngine = new FSRSEngine(this.plugin.settings.requestRetention);
  }

  public getViewType(): string {
    return VIEW_TYPE_SPACED_REPETITION;
  }

  public getDisplayText(): string {
    return 'Testing';
  }

  public getIcon(): string {
    return 'brain-circuit';
  }

  public async onOpen(): Promise<void> {
    this.breakEventRef = (this.app.workspace as any).on('focus-calendar:break-start', () => {
      if (this.flashcardMode === 'review' || this.isDrillSessionActive) {
        this.goMenu();
      }
    });

    this.renderView();
  }

  public async onClose(): Promise<void> {
    if (this.activeSubView?.destroy) {
      this.activeSubView.destroy();
      this.activeSubView = null;
    }
    if (this.breakEventRef) {
      (this.app.workspace as any).offref(this.breakEventRef);
      this.breakEventRef = null;
    }
  }

  public goMenu() {
    this.flashcardMode = 'menu';
    this.currentReviewPrefix = null;
    this.currentDrillFolder = '';
    this.isDrillSessionActive = false;
    this.renderView();
  }

  public goReview(prefix: string | null = null) {
    this.currentReviewPrefix = prefix;
    this.flashcardMode = 'review';
    this.renderView();
  }

  public goBrowse() {
    this.flashcardMode = 'browse';
    this.renderView();
  }

  public startDrill(folderPath: string) {
    this.currentDrillFolder = folderPath;
    this.isDrillSessionActive = true;
    this.renderView();
  }

  public renderView(): void {
    if (this.activeSubView?.destroy) {
      this.activeSubView.destroy();
      this.activeSubView = null;
    }

    const container = this.contentEl;
    container.empty();
    container.addClass('srf-main-container');

    // 1. Navigation Bar / Mode Switch (Consistent with Focus Calendar)
    const navBar = container.createDiv('srf-nav-bar');
    const modeSwitch = navBar.createDiv('srf-mode-switch');

    const flashcardsBtn = modeSwitch.createEl('button', {
      cls: `srf-switch-btn ${this.activeTab === 'flashcards' ? 'active' : ''}`,
    });
    const flashIcon = flashcardsBtn.createSpan('srf-btn-icon');
    setIcon(flashIcon, 'zap');
    flashcardsBtn.createSpan({ text: 'Flashcards' });
    flashcardsBtn.onclick = () => {
      if (this.activeTab !== 'flashcards') {
        this.activeTab = 'flashcards';
        this.goMenu();
      }
    };

    const drillsBtn = modeSwitch.createEl('button', {
      cls: `srf-switch-btn ${this.activeTab === 'drills' ? 'active' : ''}`,
    });
    const drillIcon = drillsBtn.createSpan('srf-btn-icon');
    setIcon(drillIcon, 'target');
    drillsBtn.createSpan({ text: 'Drills' });
    drillsBtn.onclick = () => {
      if (this.activeTab !== 'drills') {
        this.activeTab = 'drills';
        this.isDrillSessionActive = false;
        this.currentDrillFolder = '';
        this.renderView();
      }
    };

    // 2. View Content Area
    const contentSlot = container.createDiv('srf-view-content-slot');

    if (this.activeTab === 'flashcards') {
      if (this.flashcardMode === 'menu') {
        this.activeSubView = new MenuView(
          contentSlot,
          this.cacheManager,
          this.plugin,
          () => this.goReview(null),
          () => this.goBrowse()
        );
      } else if (this.flashcardMode === 'review') {
        this.activeSubView = new ReviewView(
          contentSlot,
          this.app,
          this.cacheManager,
          this.fsrsEngine,
          this.plugin,
          this,
          this.currentReviewPrefix,
          () => this.goMenu()
        );
      } else if (this.flashcardMode === 'browse') {
        this.activeSubView = new BrowseView(
          contentSlot,
          this.cacheManager,
          this.plugin.settings.expandedFlashcardFolders || {},
          async (expanded) => {
            this.plugin.settings.expandedFlashcardFolders = expanded;
            await this.plugin.saveSettings();
          },
          () => this.goMenu(),
          (path) => this.goReview(path)
        );
      }
    } else if (this.activeTab === 'drills') {
      if (this.isDrillSessionActive) {
        this.activeSubView = new DrillSessionView(
          contentSlot,
          this.app,
          this.cacheManager,
          this.plugin,
          this,
          this.currentDrillFolder,
          () => {
            this.isDrillSessionActive = false;
            this.currentDrillFolder = '';
            this.renderView();
          }
        );
      } else {
        this.activeSubView = new DrillBrowseView(
          contentSlot,
          this.cacheManager,
          this.plugin.settings.expandedDrillFolders || {},
          async (expanded) => {
            this.plugin.settings.expandedDrillFolders = expanded;
            await this.plugin.saveSettings();
          },
          (folderPath) => this.startDrill(folderPath)
        );
      }
    }
  }
}
