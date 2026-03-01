<script lang="ts">
  import type OmniRecallPlugin from "../main";

  let { plugin }: { plugin: OmniRecallPlugin } = $props();

  // We can bind to local variables and reactivity will update the UI
  let requireFlashcardTag = $state(plugin.settings.requireFlashcardTag);
  let flashcardTag = $state(plugin.settings.flashcardTag);
  let inlineDelimiter = $state(plugin.settings.inlineDelimiter);
  let multilineDelimiter = $state(plugin.settings.multilineDelimiter);

  let tagInclude = $state("");
  let tagExclude = $state("");
  let enableMultiline = $state(false);
  let enableFSRSHints = $state(false);

  // FSRS weights
  let fsrsWeights = $state<number[]>([]);

  async function saveSettings() {
    plugin.settings.requireFlashcardTag = requireFlashcardTag;
    plugin.settings.flashcardTag = flashcardTag;
    plugin.settings.inlineDelimiter = inlineDelimiter;
    plugin.settings.multilineDelimiter = multilineDelimiter;
    await plugin.saveSettings();
  }
</script>

<div class="settings-container">
  <h2>OmniRecall Settings</h2>

  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-name">Require Flashcard Tag</div>
      <div class="setting-desc">
        Only scan files for flashcards if they contain a specific tag (e.g.,
        #flashcard). Great for performance and keeping normal notes clean.
      </div>
    </div>
    <div class="setting-control">
      <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events a11y-missing-attribute -->
      <div
        class="checkbox-container {requireFlashcardTag ? 'is-enabled' : ''}"
        role="switch"
        aria-checked={requireFlashcardTag}
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            requireFlashcardTag = !requireFlashcardTag;
            saveSettings();
          }
        }}
        onclick={() => {
          requireFlashcardTag = !requireFlashcardTag;
          saveSettings();
        }}
      ></div>
    </div>
  </div>

  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-name">Flashcard Tag</div>
      <div class="setting-desc">
        The tag required in the file to enable flashcard scanning (if the
        constraint above is enabled).
      </div>
    </div>
    <div class="setting-control">
      <input
        type="text"
        bind:value={flashcardTag}
        onchange={saveSettings}
        placeholder="#flashcard"
      />
    </div>
  </div>

  <h3>Parser Delimiters</h3>

  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-name">Inline Delimiter</div>
      <div class="setting-desc">
        Characters that separate the front and back of an inline flashcard.
      </div>
    </div>
    <div class="setting-control">
      <input
        type="text"
        bind:value={inlineDelimiter}
        onchange={saveSettings}
        placeholder="::"
      />
    </div>
  </div>

  <div class="setting-item">
    <div class="setting-info">
      <div class="setting-name">Multiline Delimiter</div>
      <div class="setting-desc">
        Characters that separate the front and back of a multiline flashcard
        (must be on its own line).
      </div>
    </div>
    <div class="setting-control">
      <input
        type="text"
        bind:value={multilineDelimiter}
        onchange={saveSettings}
        placeholder="?"
      />
    </div>
  </div>
</div>

<style>
  /* Native-like obsidian settings styling */
  .settings-container {
    padding: 5px 0;
  }

  h3 {
    margin-top: 30px;
    margin-bottom: 20px;
    color: var(--text-normal);
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 0;
    border-top: 1px solid var(--background-modifier-border);
  }

  .setting-info {
    flex: 1 1 auto;
    margin-right: 18px;
  }

  .setting-name {
    color: var(--text-normal);
    font-size: var(--font-ui-medium);
    line-height: var(--line-height-tight);
  }

  .setting-desc {
    color: var(--text-muted);
    font-size: var(--font-ui-small);
    line-height: var(--line-height-tight);
    margin-top: 4px;
  }

  .setting-control {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  input[type="text"] {
    background: var(--background-modifier-form-field);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-normal);
    padding: 4px 8px;
    border-radius: 4px;
  }

  input[type="text"]:focus {
    border-color: var(--interactive-accent);
    box-shadow: 0 0 0 2px var(--background-modifier-border-focus);
  }

  /* Simple custom checkbox to match Obsidian style toggle */
  .checkbox-container {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background-color: var(--background-modifier-border);
    position: relative;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }

  .checkbox-container.is-enabled {
    background-color: var(--interactive-accent);
  }

  .checkbox-container::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--text-on-accent);
    transition: transform 0.15s ease-in-out;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .checkbox-container.is-enabled::after {
    transform: translateX(20px);
  }
</style>
