<script lang="ts">
  import { onMount } from "svelte";
  import { Setting } from "obsidian";
  import type OmniRecallPlugin from "../main";

  let { plugin }: { plugin: OmniRecallPlugin } = $props();

  let container: HTMLElement;

  onMount(() => {
    // --- Flashcard Tag ---
    new Setting(container)
      .setName("Require Flashcard Tag")
      .setDesc(
        "Only scan files for flashcards if they contain a specific tag (e.g. #flashcard). Great for performance and keeping normal notes clean.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(plugin.settings.requireFlashcardTag)
          .onChange(async (value) => {
            plugin.settings.requireFlashcardTag = value;
            await plugin.saveSettings();
          }),
      );

    new Setting(container)
      .setName("Flashcard Tag")
      .setDesc(
        "The tag required in the file to enable flashcard scanning (if the constraint above is enabled).",
      )
      .addText((text) =>
        text
          .setPlaceholder("#flashcard")
          .setValue(plugin.settings.flashcardTag)
          .onChange(async (value) => {
            plugin.settings.flashcardTag = value;
            await plugin.saveSettings();
          }),
      );

    // --- Delimiters ---
    container.createEl("h3", { text: "Parser Delimiters" });

    new Setting(container)
      .setName("Inline Delimiter")
      .setDesc(
        "Characters that separate the front and back of an inline flashcard.",
      )
      .addText((text) =>
        text
          .setPlaceholder("::")
          .setValue(plugin.settings.inlineDelimiter)
          .onChange(async (value) => {
            plugin.settings.inlineDelimiter = value;
            await plugin.saveSettings();
          }),
      );

    new Setting(container)
      .setName("Multiline Delimiter")
      .setDesc(
        "Characters that separate the front and back of a multiline flashcard (must be on its own line).",
      )
      .addText((text) =>
        text
          .setPlaceholder("?")
          .setValue(plugin.settings.multilineDelimiter)
          .onChange(async (value) => {
            plugin.settings.multilineDelimiter = value;
            await plugin.saveSettings();
          }),
      );

    // --- Advanced FSRS ---
    container.createEl("h3", { text: "Review Behaviour" });

    new Setting(container)
      .setName("Show Interval Predictions")
      .setDesc(
        "Display the scheduled interval (e.g. '4d', '1.5mo') on each grading button. Off by default — grading based on schedules rather than memory undermines FSRS.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(plugin.settings.showIntervalPredictions)
          .onChange(async (value) => {
            plugin.settings.showIntervalPredictions = value;
            await plugin.saveSettings();
          }),
      );

    container.createEl("h3", { text: "Advanced Scheduler Settings" });

    const retentionDesc = document.createDocumentFragment();
    retentionDesc.append(
      "Controls how aggressively FSRS schedules your reviews. Higher = shorter intervals, more reviews. Lower = longer intervals, fewer reviews.",
      retentionDesc.createEl("br"),
      retentionDesc.createEl("br"),
      retentionDesc.createEl("strong", {
        text: "⚠️ Default is 0.90. Do not change unless you understand FSRS.",
        attr: { style: "color: var(--color-orange);" },
      }),
    );

    new Setting(container)
      .setName("Desired Retention")
      .setDesc(retentionDesc)
      .addSlider((slider) =>
        slider
          .setLimits(0.7, 0.99, 0.01)
          .setValue(plugin.settings.requestRetention)
          .setDynamicTooltip()
          .onChange(async (value) => {
            plugin.settings.requestRetention = value;
            await plugin.saveSettings();
          }),
      );
  });
</script>

<div bind:this={container}></div>
