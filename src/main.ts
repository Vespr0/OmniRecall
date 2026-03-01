import { Plugin, Notice, TFile, WorkspaceLeaf } from 'obsidian';
import { CacheManager, CacheData } from './cache/cacheManager';
import { FSRSMainView, VIEW_TYPE_FSRS_MAIN } from './ui/mainView';
import { createFSRSDecoration, createBadgeDOM } from './ui/decorations/fsrsDecoration';

interface FSRSPluginSettings {
	cache: CacheData;
	// Add weighting parameters here later
}

const DEFAULT_SETTINGS: FSRSPluginSettings = {
	cache: {}
}

export default class FSRSPlugin extends Plugin {
	settings!: FSRSPluginSettings;
	cacheManager!: CacheManager;

	async onload() {
		console.log('Loading FSRS Flashcards plugin');
		
		await this.loadSettings();

		this.cacheManager = new CacheManager(this.app, this.settings.cache, async (data) => {
			this.settings.cache = data;
			await this.saveSettings();
		});

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

		this.registerView(
			VIEW_TYPE_FSRS_MAIN,
			(leaf) => new FSRSMainView(leaf, this.cacheManager)
		);

		this.addRibbonIcon('brain-circuit', 'FSRS Flashcards', (evt: MouseEvent) => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-fsrs-review',
			name: 'Open FSRS Review',
			callback: () => {
				this.activateView();
			}
		});

		// Hide FSRS comments in Reading View
		this.registerMarkdownPostProcessor((element, context) => {
			const walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null);
			let node: Comment | null = null;
			const toRemove: Comment[] = [];
			
			// Extract all matching comments first to avoid tree mutation issues
			while (true) {
				const nextNode = walker.nextNode();
				if (!nextNode) break;
				
				const n = nextNode as Comment;
				if (n.nodeValue && n.nodeValue.startsWith('FSRS:')) {
					toRemove.push(n);
				}
			}
			
			toRemove.forEach(n => {
				const parent = n.parentNode;
				if (parent && n.nodeValue) {
					// Reconstruct the full string since nodeValue removes the comment tags
					const fullString = `<!--${n.nodeValue}-->`;
					const badge = createBadgeDOM(fullString);
					parent.replaceChild(badge, n);
				}
			});
		});

		// Hide FSRS comments in Live Preview + trigger Spatial Blur logic
		this.registerEditorExtension(createFSRSDecoration(this.app, this.cacheManager));

		// Basic setup done.
	}

	async activateView() {
		const { workspace } = this.app;

		// Trigger B: State Request (Review Initialization)
		// Ensure any unborn cards in memory are safely written to disk before launching review
		await this.cacheManager.flushAll();

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_FSRS_MAIN);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({ type: VIEW_TYPE_FSRS_MAIN, active: true });
		}

		workspace.revealLeaf(leaf);
	}

	onunload() {
		console.log('Unloading FSRS Flashcards plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
