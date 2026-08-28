import { App, PluginSettingTab, Setting } from 'obsidian';
import type SpacedRepetitionPlugin from './main';

export class SpacedRepetitionSettingTab extends PluginSettingTab {
  plugin: SpacedRepetitionPlugin;

  constructor(app: App, plugin: SpacedRepetitionPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Spaced Repetition (FSRS) Settings' });

    // --- Flashcard Tag ---
    new Setting(containerEl)
      .setName('Require Flashcard Tag')
      .setDesc('Only scan files for flashcards if they contain a specific tag (e.g. #flashcard). Great for performance and keeping normal notes clean.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.requireFlashcardTag)
          .onChange(async (value) => {
            this.plugin.settings.requireFlashcardTag = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Flashcard Tag')
      .setDesc('The tag required in the file to enable flashcard scanning (if the constraint above is enabled).')
      .addText((text) =>
        text
          .setPlaceholder('#flashcard')
          .setValue(this.plugin.settings.flashcardTag)
          .onChange(async (value) => {
            this.plugin.settings.flashcardTag = value;
            await this.plugin.saveSettings();
          })
      );

    // --- Delimiters ---
    containerEl.createEl('h3', { text: 'Parser Delimiters' });

    new Setting(containerEl)
      .setName('Inline Delimiter')
      .setDesc('Characters that separate the front and back of an inline flashcard.')
      .addText((text) =>
        text
          .setPlaceholder('::')
          .setValue(this.plugin.settings.inlineDelimiter)
          .onChange(async (value) => {
            this.plugin.settings.inlineDelimiter = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Multiline Delimiter')
      .setDesc('Characters that separate the front and back of a multiline flashcard (must be on its own line).')
      .addText((text) =>
        text
          .setPlaceholder('?')
          .setValue(this.plugin.settings.multilineDelimiter)
          .onChange(async (value) => {
            this.plugin.settings.multilineDelimiter = value;
            await this.plugin.saveSettings();
          })
      );

    // --- Review Behaviour ---
    containerEl.createEl('h3', { text: 'Review Behaviour' });

    new Setting(containerEl)
      .setName('Show Interval Predictions')
      .setDesc("Display the scheduled interval (e.g. '4d', '1.5mo') on each grading button. Off by default — grading based on schedules rather than memory undermines FSRS.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showIntervalPredictions)
          .onChange(async (value) => {
            this.plugin.settings.showIntervalPredictions = value;
            await this.plugin.saveSettings();
          })
      );

    // --- Gamification & UX ---
    containerEl.createEl('h3', { text: 'Gamification & UX' });

    new Setting(containerEl)
      .setName('Enable Audio')
      .setDesc('Play synthesized sound effects during flashcard review.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAudio)
          .onChange(async (value) => {
            this.plugin.settings.enableAudio = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable Animations')
      .setDesc('Show 3D card flips and UI animations during review.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAnimations)
          .onChange(async (value) => {
            this.plugin.settings.enableAnimations = value;
            await this.plugin.saveSettings();
          })
      );

    // --- Advanced Scheduler Settings ---
    containerEl.createEl('h3', { text: 'Advanced Scheduler Settings' });

    const retentionDesc = document.createDocumentFragment();
    retentionDesc.append(
      'Controls how aggressively FSRS schedules your reviews. Higher = shorter intervals, more reviews. Lower = longer intervals, fewer reviews.',
      retentionDesc.createEl('br'),
      retentionDesc.createEl('br'),
      retentionDesc.createEl('strong', {
        text: '⚠️ Default is 0.90. Do not change unless you understand FSRS.',
        attr: { style: 'color: var(--color-orange, #f97316);' },
      })
    );

    new Setting(containerEl)
      .setName('Desired Retention')
      .setDesc(retentionDesc)
      .addSlider((slider) =>
        slider
          .setLimits(0.7, 0.99, 0.01)
          .setValue(this.plugin.settings.requestRetention)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.requestRetention = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
