# OmniRecall: Local-First Spaced Repetition

A spaced repetition plugin for Obsidian powered by the Free Spaced Repetition Scheduler (FSRS) v6.

This plugin is designed with file syncing in mind. Whether you use Obsidian Sync, Syncthing, iCloud, or Git, this plugin ensures your flashcard review history is never corrupted or lost due to sync conflicts.

> Are you a developer? Read the [DEVELOPER.md](DEVELOPER.md) file for the technical details.

## Features

- **FSRS v6**: OmniRecall uses the Free Spaced Repetition Scheduler (FSRS) v6, a state-of-the-art spaced repetition algorithm that reduces daily review loads by up to 20% compared to legacy algorithms like SM-2 (common in other spaced repetition obsidian plugins).
- **Sync-Safe**: Your review history travels safely with your text. If your notes sync successfully, your flashcards sync successfully, easy.
- **Edit Freely**: You can rewrite your flashcards, fix typos, or move them to completely different folders. The plugin will never lose track of your progress.
- **Clean Notes**: The data is stored as a hidden HTML comment. While editing, you will only see a small, unobtrusive colored badge indicating the card's status (🔵 New, 🔴 Due, 🟢 Mature). _Please don't delete the colored markers, they make the app work!_
- **Built for Students**: Flawlessly supports complex notes, including multi-line code blocks and LaTeX.

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

### Planned Features

- [ ] A time guessing system that tells you how much time it would take you to review all the cards you have due that day.
- [ ] Show not just the card front but also the headers hierarchy above and file name
- [ ] Allow users to review specific folders or files from the browse section
- [ ] Reset or convert existing timestamps of other spaced repetition plugins
- [ ] Cells saturation in the stats section should be based on the highest number of flashcards due on that single day and not a static number.

### Installation

Search for "OmniRecall" in the Obsidian Community Plugins browser.

Install and Enable the plugin.

(Optional) Go to settings to adjust your Target Retention Rate (Default: 90%).

### Licence

See LICENSE.md
