<script lang="ts">
  let { activeTab, onTabChange }: { activeTab: 'flashcards' | 'drills'; onTabChange: (tab: 'flashcards' | 'drills') => void } = $props();
</script>

<div class="omni-tab-header">
  <button 
    class="omni-tab-btn {activeTab === 'flashcards' ? 'active' : ''}" 
    onclick={() => onTabChange('flashcards')}>
    ⚡ FLASHCARDS
  </button>
  <button 
    class="omni-tab-btn {activeTab === 'drills' ? 'active' : ''}" 
    onclick={() => onTabChange('drills')}>
    🎯 DRILLS
  </button>
</div>

<style>
  .omni-tab-header {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    border-bottom: 2px solid var(--background-modifier-border);
    padding-bottom: 8px;
  }
  .omni-tab-btn {
    background: transparent;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s ease;
  }
  .omni-tab-btn:hover {
    color: var(--text-normal);
    background-color: var(--background-modifier-hover);
  }
  .omni-tab-btn.active {
    color: var(--interactive-accent);
    background-color: var(--background-modifier-active-hover);
    border-bottom: 2px solid var(--interactive-accent);
  }
</style>
