<script lang="ts">
  import type { App as ObsidianApp } from "obsidian";
  import type { FSRSMainView } from "../common/mainView";
  import type { Flashcard } from "../../parser/parser";
  import type { Snippet } from "svelte";
  import CardFaceFront from "./CardFaceFront.svelte";
  import CardFaceBack from "./CardFaceBack.svelte";

  let {
    app,
    parentView,
    currentItem,
    isShowingAnswer,
    onToggleAnswer,
    enableAnimations = true,
    isShaking = false,
    children,
  }: {
    app: ObsidianApp;
    parentView: FSRSMainView;
    currentItem: { file: string; card: Flashcard } | undefined;
    isShowingAnswer: boolean;
    onToggleAnswer: () => void;
    enableAnimations?: boolean;
    isShaking?: boolean;
    children: Snippet;
  } = $props();

  let breadcrumbs = $derived.by(() => {
    if (!currentItem) return "";
    let fileName = currentItem.file.split("/").pop();
    let parts = ["📄 " + fileName];
    if (currentItem.card.context && currentItem.card.context.length > 0) {
      parts.push(...currentItem.card.context);
    }
    return parts.join(" > ");
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y-no-static-element-interactions -->
<div class="card-scene {isShaking && enableAnimations ? 'shake' : ''}">
  <div
    class="card-flipper {isShowingAnswer && enableAnimations ? 'is-flipped' : ''}"
    onclick={onToggleAnswer}
    role="button"
    tabindex="0"
    onkeydown={(e) => {
      if (e.key === "Enter" || e.key === " ") onToggleAnswer();
    }}
    style="cursor: pointer;"
  >
    <CardFaceFront {app} {parentView} {currentItem} {breadcrumbs} />

    <CardFaceBack
      {app}
      {parentView}
      {currentItem}
      {isShowingAnswer}
      {breadcrumbs}
    >
      {@render children()}
    </CardFaceBack>
  </div>
</div>

<style>
  .card-scene {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    perspective: 1200px;
  }

  .card-flipper {
    display: grid;
    grid-template-areas: "card";
    width: 100%;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  }

  .card-flipper.is-flipped {
    transform: rotateY(180deg);
  }

  .shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-2px, 0, 0); }
    20%, 80% { transform: translate3d(4px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
    40%, 60% { transform: translate3d(8px, 0, 0); }
  }
</style>
