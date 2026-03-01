import { ItemView, WorkspaceLeaf } from 'obsidian';
import { CacheManager } from '../cache/cacheManager';
import { FSRSEngine } from '../fsrs/engine';
import { mount, unmount } from 'svelte';
import App from './App.svelte';
import type OmniRecallPlugin from '../main';

export const VIEW_TYPE_FSRS_MAIN = "omnirecall-main-view";

export class FSRSMainView extends ItemView {
    private cacheManager: CacheManager;
    private fsrsEngine: FSRSEngine;
    private plugin: OmniRecallPlugin;
    private component: App | null = null;

    constructor(leaf: WorkspaceLeaf, cacheManager: CacheManager, plugin: OmniRecallPlugin) {
        super(leaf);
        this.cacheManager = cacheManager;
        this.fsrsEngine = new FSRSEngine();
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_FSRS_MAIN;
    }

    getDisplayText(): string {
        return "OmniRecall";
    }

    async onOpen() {
        this.contentEl.empty();
        this.component = mount(App, {
            target: this.contentEl,
            props: {
                app: this.app,
                cacheManager: this.cacheManager,
                fsrsEngine: this.fsrsEngine,
                parentView: this,
                plugin: this.plugin
            }
        });
    }

    async onClose() {
        if (this.component) {
            unmount(this.component);
            this.component = null;
        }
    }
}
