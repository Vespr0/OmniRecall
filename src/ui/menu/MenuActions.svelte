<script lang="ts">
  import { setIcon } from "obsidian";

  let {
    dueCount,
    estimatedText,
    onReview,
    onBrowse,
  }: {
    dueCount: number;
    estimatedText: string;
    onReview: () => void;
    onBrowse: () => void;
  } = $props();

  function obsidianIcon(node: HTMLElement, iconName: string) {
    setIcon(node, iconName);
    return {
      update(newIconName: string) {
        node.empty();
        setIcon(node, newIconName);
      },
    };
  }
</script>

<div class="button-group">
  <div class="review-button-container">
    <button class="action-btn review-btn" onclick={onReview}>
      <span class="icon" use:obsidianIcon={"play"}></span>
      <span>Review ({dueCount} Due)</span>
    </button>
    {#if dueCount > 0}
      <div class="estimation-container">
        <span class="estimation"
          >Estimated Review Time:
          <b class="estimation-text">{estimatedText}</b>
        </span>
      </div>
    {/if}
  </div>

  <button class="action-btn browse-btn" onclick={onBrowse}>
    <span class="icon" use:obsidianIcon={"folder-open"}></span>
    <span>Browse Flashcards</span>
  </button>
</div>

<style>
  .button-group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    width: 100%;
    max-width: 800px;
    margin-bottom: 20px;
  }

  .estimation-text {
    color: var(--interactive-accent);
    font-weight: bold;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px 30px;
    font-size: 1.4em;
    font-weight: bold;
    cursor: pointer;
    border-radius: 8px;
    flex: 1 1 calc(50% - 10px);
    min-width: 250px;
    transition: filter 0.1s ease;
  }

  .action-btn:hover {
    filter: brightness(1.1);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon :global(svg) {
    width: 24px;
    height: 24px;
    display: block;
    margin-bottom: 2px;
  }

  .review-btn {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
  }

  .browse-btn {
    background-color: var(--background-secondary);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
  }

  .review-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1 1 calc(50% - 10px);
    min-width: 250px;
  }

  .review-button-container .action-btn {
    width: 100%;
    flex: unset;
    min-width: unset;
  }

  .estimation-container {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .estimation {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--text-muted);
  }
</style>
