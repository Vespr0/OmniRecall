# OmniRecall: Local-First Spaced Repetition

A spaced repetition plugin for Obsidian powered by the Free Spaced Repetition Scheduler (FSRS) v6.

This plugin is designed with one strict rule: **Your data must survive file syncing**. Whether you use Obsidian Sync, Syncthing, iCloud, or Git, this plugin ensures your flashcard review history is never corrupted or lost due to sync conflicts.

> [!tip] Are you a developer? Read the [DEVELOPER.md](DEVELOPER.md) file for the technical details.

## Why this plugin?

Most flashcard plugins store your entire review history in a single, hidden database file. If you review cards on your phone and your laptop at the same time, or if your sync app glitches, that database corrupts. Your progress is permanently deleted.

OmniRecall solves this by storing the scheduling data **directly inside your notes**, invisibly attached to the flashcards themselves.

- **Sync-Safe**: Your review history travels safely with your text. If your notes sync successfully, your flashcards sync successfully.
- **Edit Freely**: You can rewrite your flashcards, fix typos, or move them to completely different folders. The plugin will never lose track of your progress.
- **Clean Notes**: The data is stored as a hidden HTML comment. While editing, you will only see a small, unobtrusive colored badge indicating the card's status (🔵 New, 🔴 Due, 🟢 Mature). _Please don't delete the colored markers, they make the app work!_

## How to Use

### 1. Creating Flashcards

Use standard multi-line delimiters to create a flashcard anywhere in your vault.

```markdown
What is the time complexity of a Binary Search?
?
$O(\log n)$
```

When you finish typing and move your cursor away, the plugin will automatically attach a hidden ID to the card and display a 🔵 (New) badge.

### 2. Reviewing Flashcards

- Open the Command Palette and select **OmniRecall: Start Review Session**.
- Rate cards using **1 (Again)**, **2 (Hard)**, **3 (Good)**, **4 (Easy)**.
- The algorithm schedules the next review and updates the hidden data in your notes automatically.

## Features

- **Advanced Algorithm**: Uses FSRS, which reduces daily review loads by up to 20% compared to legacy algorithms like Anki's default (SM-2).
- **Built for Students**: Flawlessly supports complex notes, including multi-line code blocks and mathematical proofs (LaTeX/MathJax).
- **Focused Reviews**: During a review session, the plugin hides the surrounding text of your note, preventing you from "cheating" by recognizing the context around the flashcard.

---

### Planned Features

- [ ] A time guessing system that tells you how much time it would take you to review all the cards you have due that day.
- [ ] Rewrite the UI in Svelte 5.
- [ ] Cramming mode to allow you to review cards that aren't due.
- [ ] Extensive plugin settings.

### Installation

Search for "OmniRecall" in the Obsidian Community Plugins browser.

Install and Enable the plugin.

(Optional) Go to settings to adjust your Target Retention Rate (Default: 90%).

### Developers & Architecture

If you want to contribute, or if you want to understand the technical implementation of the parser, lazy injection, and sync-conflict mitigation, please read the DEVELOPER.md.

### Licence

See LICENSE.md
