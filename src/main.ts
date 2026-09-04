import { Plugin, TFile, WorkspaceLeaf, Editor } from 'obsidian';
import { CacheManager, CacheData } from './cache/cacheManager';
import { SpacedRepetitionMainView, VIEW_TYPE_SPACED_REPETITION } from './views/MainView';
import { createFSRSDecoration, createBadgeDOM, createDrillBadgeDOM } from './decorations/fsrsDecoration';
import { SpacedRepetitionSettingTab } from './settings';
import { DrillTelemetryRecord } from './cache/drillTypes';

export interface FSRSPluginSettings {
  cache: CacheData;
  requireFlashcardTag: boolean;
  flashcardTag: string;
  inlineDelimiter: string;
  multilineDelimiter: string;
  reviewHistory: Record<string, number>;
  avgReviewTime: number;
  requestRetention: number;
  showIntervalPredictions: boolean;
  enableAudio: boolean;
  enableAnimations: boolean;
  highestCombo: number;
  drillTelemetry: DrillTelemetryRecord;
  expandedDrillFolders: Record<string, boolean>;
  expandedFlashcardFolders: Record<string, boolean>;
}

const DEFAULT_SETTINGS: FSRSPluginSettings = {
  cache: {},
  requireFlashcardTag: true,
  flashcardTag: '#flashcard',
  inlineDelimiter: '::',
  multilineDelimiter: '?',
  reviewHistory: {},
  avgReviewTime: 5000,
  requestRetention: 0.9,
  showIntervalPredictions: false,
  enableAudio: true,
  enableAnimations: true,
  highestCombo: 0,
  drillTelemetry: {},
  expandedDrillFolders: {},
  expandedFlashcardFolders: {},
};

export default class SpacedRepetitionPlugin extends Plugin {
  settings: FSRSPluginSettings = DEFAULT_SETTINGS;
  cacheManager!: CacheManager;

  async onload() {
    console.log('Loading Spaced Repetition (FSRS) plugin');

    await this.loadSettings();

    this.cacheManager = new CacheManager(
      this.app,
      this.settings.cache,
      async (data) => {
        this.settings.cache = data;
        await this.saveSettings();
      },
      this.settings
    );

    this.app.workspace.onLayoutReady(async () => {
      await this.cacheManager.scanVault();

      this.registerEvent(
        this.app.metadataCache.on('changed', async (file: TFile) => {
          if (file.extension === 'md') {
            await this.cacheManager.processFile(file);
          }
        })
      );

      this.registerEvent(
        this.app.workspace.on('active-leaf-change', async () => {
          await this.cacheManager.flushAll();
        })
      );

      this.registerEvent(
        this.app.workspace.on('quit', async () => {
          await this.cacheManager.flushAll();
        })
      );
    });

    // Register View
    this.registerView(
      VIEW_TYPE_SPACED_REPETITION,
      (leaf) => new SpacedRepetitionMainView(leaf, this.cacheManager, this)
    );

    // Backward-compatibility view alias for legacy workspace layouts
    this.registerView(
      'omnirecall-main-view',
      (leaf) => new SpacedRepetitionMainView(leaf, this.cacheManager, this)
    );

    this.addRibbonIcon('brain-circuit', 'Testing', () => {
      this.activateView();
    });

    this.addSettingTab(new SpacedRepetitionSettingTab(this.app, this));

    this.addCommand({
      id: 'open-fsrs-review',
      name: 'Open Testing View',
      callback: () => {
        this.activateView();
      },
    });

    this.addCommand({
      id: 'insert-single-choice-drill',
      name: 'Insert Single-Choice Drill Template',
      editorCallback: (editor: Editor) => {
        const template = `Question statement here\n?\n- ( ) Option A\n- (x) Correct Option B\n- ( ) Option C\n- ( ) Option D\n\n**Solution / Explanation:**\nExplanation of why B is correct.`;
        editor.replaceSelection(template);
      },
    });

    this.addCommand({
      id: 'insert-multiple-choice-drill',
      name: 'Insert Multiple-Choice Drill Template',
      editorCallback: (editor: Editor) => {
        const template = `Question statement here (Select all that apply)\n?\n- [x] Correct Option A\n- [ ] Distractor Option B\n- [x] Correct Option C\n- [ ] Distractor Option D\n\n**Solution / Explanation:**\nExplanation of why A and C are correct.`;
        editor.replaceSelection(template);
      },
    });

    // Hide FSRS & DRILL comments in Reading View
    this.registerMarkdownPostProcessor((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null);
      const toProcess: { node: Comment; type: 'fsrs' | 'drill' }[] = [];

      while (true) {
        const nextNode = walker.nextNode();
        if (!nextNode) break;

        const n = nextNode as Comment;
        if (n.nodeValue && n.nodeValue.startsWith('FSRS:')) {
          toProcess.push({ node: n, type: 'fsrs' });
        } else if (n.nodeValue && n.nodeValue.startsWith('DRILL:')) {
          toProcess.push({ node: n, type: 'drill' });
        }
      }

      toProcess.forEach(({ node, type }) => {
        const parent = node.parentNode;
        if (parent && node.nodeValue) {
          const fullString = `<!--${node.nodeValue}-->`;
          const badge = type === 'fsrs'
            ? createBadgeDOM(fullString, this.settings)
            : createDrillBadgeDOM(fullString);
          parent.replaceChild(badge, node);
        }
      });
    });

    // Hide FSRS comments in Live Preview + trigger Spatial Blur logic
    this.registerEditorExtension(createFSRSDecoration(this.app, this.cacheManager, this.settings));
  }

  async activateView() {
    const { workspace } = this.app;

    await this.cacheManager.flushAll();

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_SPACED_REPETITION);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf('tab');
      await leaf.setViewState({ type: VIEW_TYPE_SPACED_REPETITION, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  onunload() {
    console.log('Unloading Spaced Repetition (FSRS) plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
