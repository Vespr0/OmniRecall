import { App, PluginSettingTab } from 'obsidian';
import OmniRecallPlugin from './main';
import { mount, unmount } from 'svelte';
import SettingsApp from './ui/SettingsApp.svelte';

export class OmniRecallSettingTab extends PluginSettingTab {
    plugin: OmniRecallPlugin;
    private component: SettingsApp | null = null;

    constructor(app: App, plugin: OmniRecallPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        
        this.component = mount(SettingsApp, {
            target: containerEl,
            props: {
                plugin: this.plugin
            }
        });
    }
    
    hide(): void {
        if (this.component) {
            unmount(this.component);
            this.component = null;
        }
    }
}
