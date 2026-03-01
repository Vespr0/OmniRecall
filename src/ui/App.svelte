<script lang="ts">
  import type { App as ObsidianApp } from "obsidian";
  import type { CacheManager } from "../cache/cacheManager";
  import type { FSRSEngine } from "../fsrs/engine";
  import type { FSRSMainView } from "./mainView";
  import type OmniRecallPlugin from "../main";

  import Menu from "./Menu.svelte";
  import Review from "./Review.svelte";
  import Browse from "./Browse.svelte";

  // Prevent TypeScript from stripping component imports because they are strictly used in the template
  const _components = { Menu, Review, Browse };

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

  enum ViewState {
    MENU,
    REVIEW,
    BROWSE,
  }

  let currentState: ViewState = $state(ViewState.MENU);

  function goMenu() {
    currentState = ViewState.MENU;
  }

  function goReview() {
    currentState = ViewState.REVIEW;
  }

  function goBrowse() {
    currentState = ViewState.BROWSE;
  }
</script>

<div
  class="fsrs-wrapper"
  style="display: flex; flex-direction: column; height: 100%; overflow-y: auto; padding: 20px;"
>
  {#if currentState === ViewState.MENU}
    <Menu {cacheManager} {plugin} onReview={goReview} onBrowse={goBrowse} />
  {:else if currentState === ViewState.REVIEW}
    <Review
      {app}
      {cacheManager}
      {fsrsEngine}
      {parentView}
      {plugin}
      onBack={goMenu}
    />
  {:else if currentState === ViewState.BROWSE}
    <Browse {cacheManager} onBack={goMenu} />
  {/if}
</div>
