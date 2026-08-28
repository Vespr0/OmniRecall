<script lang="ts">
  import type { App as ObsidianApp } from "obsidian";
  import type { CacheManager } from "../cache/cacheManager";
  import type { FSRSEngine } from "../fsrs/engine";
  import type { FSRSMainView } from "./common/mainView";
  import type OmniRecallPlugin from "../main";

  import Menu from "./menu/Menu.svelte";
  import Review from "./review/Review.svelte";
  import Browse from "./browse/Browse.svelte";
  import TabHeader from "./common/TabHeader.svelte";
  import DrillBrowse from "./drills/DrillBrowse.svelte";
  import DrillSession from "./drills/DrillSession.svelte";

  const _components = { Menu, Review, Browse, TabHeader, DrillBrowse, DrillSession };

  let {
    app,
    cacheManager,
    fsrsEngine,
    parentView,
    plugin,
  }: {
    app: ObsidianApp;
    cacheManager: CacheManager;
    fsrsEngine: FSRSEngine;
    parentView: FSRSMainView;
    plugin: OmniRecallPlugin;
  } = $props();

  let activeTab: 'flashcards' | 'drills' = $state('flashcards');

  const ViewState = { MENU: 0, REVIEW: 1, BROWSE: 2, DRILL_SESSION: 3 } as const;
  type ViewStateType = (typeof ViewState)[keyof typeof ViewState];

  let currentState: ViewStateType = $state(ViewState.MENU);
  let currentReviewPrefix: string | null = $state(null);
  let currentDrillFolder: string = $state('');

  function handleTabChange(tab: 'flashcards' | 'drills') {
    activeTab = tab;
    currentState = ViewState.MENU;
    currentReviewPrefix = null;
    currentDrillFolder = '';
  }

  function goMenu() {
    currentState = ViewState.MENU;
    currentReviewPrefix = null;
    currentDrillFolder = '';
  }

  function goReview() {
    currentReviewPrefix = null;
    currentState = ViewState.REVIEW;
  }

  function goReviewFiltered(prefix: string) {
    currentReviewPrefix = prefix;
    currentState = ViewState.REVIEW;
  }

  function goBrowse() {
    currentState = ViewState.BROWSE;
  }

  function startDrill(folderPath: string) {
    currentDrillFolder = folderPath;
    currentState = ViewState.DRILL_SESSION;
  }
</script>

<div
  class="fsrs-wrapper"
  style="display: flex; flex-direction: column; height: 100%; overflow-y: auto; padding: 20px;"
>
  <TabHeader {activeTab} onTabChange={handleTabChange} />

  {#if activeTab === 'flashcards'}
    {#if currentState === ViewState.MENU}
      <Menu {cacheManager} {plugin} onReview={goReview} onBrowse={goBrowse} />
    {:else if currentState === ViewState.REVIEW}
      <Review
        {app}
        {cacheManager}
        {fsrsEngine}
        {parentView}
        {plugin}
        reviewPrefix={currentReviewPrefix}
        onBack={goMenu}
      />
    {:else if currentState === ViewState.BROWSE}
      <Browse {cacheManager} onBack={goMenu} {goReviewFiltered} />
    {/if}
  {:else if activeTab === 'drills'}
    {#if currentState === ViewState.DRILL_SESSION}
      <DrillSession
        {app}
        {cacheManager}
        {plugin}
        folderPath={currentDrillFolder}
        onBack={goMenu}
      />
    {:else}
      <DrillBrowse
        {cacheManager}
        {plugin}
        onStartDrill={startDrill}
      />
    {/if}
  {/if}
</div>
