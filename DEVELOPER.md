## Developer Quickstart

To build and test the plugin locally, you must map the repository to a local Obsidian test vault.

#### Repository Setup

Clone this repository directly into the plugins folder of a designated Obsidian test vault:

```bash
cd /path/to/your/test-vault/.obsidian/plugins/
git clone [https://github.com/yourusername/omnirecall.git](https://github.com/yourusername/omnirecall.git)
cd omnirecall
```

> [!NOTE]
> Alternatively, clone it elsewhere and create a symlink to your test vault's plugin directory.

Install Dependencies

```bash
pnpm install
```

Development Build (Watch Mode)
Runs esbuild in watch mode. Saves to .ts files will automatically transpile main.js into the current directory.

```bash
pnpm run dev
```

> [!NOTE]
> I reccomend the use of the "Hot Reload" plugin by pjeby. It is a developer tool and is not available in the official community store. You must install it manually from GitHub (pjeby/hot-reload) or via the BRAT plugin to automatically reload OmniRecall upon esbuild compilation.

#### Production Build

Minifies and optimizes the code. Execute this only when generating a main.js for a release artifact.

```bash
pnpm run build
```

Run Unit Tests
Executes the Jest test suite.

```bash
pnpm test
```

---

## Architectural Decisions

This document outlines the engineering constraints and architectural decisions for the OmniRecall plugin. It is intended for developers contributing to the codebase.

### 1. The Synchronization Constraint

This plugin assumes a hostile synchronization environment (e.g., decentralized P2P via Syncthing).

The Anti-Pattern: Storing FSRS state (Difficulty, Stability, Retrievability) in a monolithic .obsidian/plugins/omnirecall/data.json file. In a P2P network, concurrent reviews on different nodes will cause the sync engine to generate a .sync-conflict file, destroying the review history of one node.

The Solution: Inline Serialization (Model 4)
The FSRS state is tightly coupled to the atomic unit of replication (the markdown file). The state object is flattened and injected directly adjacent to the flashcard block as an HTML comment.

Format: <!--FSRS:[Base62_ID]|[Due_Date]|[Stability]|[Difficulty]|[Reps]|[Lapses]|[State]-->

Example: <!--FSRS:x7k9P2|20260305|5.2|4.8|12|1|2-->

Result: We delegate conflict resolution entirely to the sync engine's native diff-match-patch text algorithms. Data integrity is guaranteed.

### 2. Parser Architecture (AST > Regex)

Target users (STEM students) utilize complex markdown structures (LaTeX, code fences, nested blockquotes). Naive Regex parsing across multi-line strings is structurally unsound and will truncate data. The plugin must utilize Obsidian's native Abstract Syntax Tree (AST) via app.metadataCache.getFileCache() to define strict block boundaries before attempting to extract or inject FSRS strings.

### 3. UX Race Conditions: Lazy Injection

Writing state strings to a markdown file while the user is actively typing inside that CodeMirror block causes catastrophic cursor desynchronization.

The system utilizes a Lazy Injection model to separate detection from I/O operations:

Unborn Queue: New flashcards are parsed into memory but not written to disk.

Execution Triggers: The Vault.process() file write is deferred until a safe state is reached:

Trigger A (Spatial Blur): A CodeMirror 6 extension detects the cursor has left the flashcard block line boundaries.

Trigger B (View Navigation): app.workspace.on('active-leaf-change') fires, flushing the queue before the file view is destroyed.

Trigger C (App Quit): The onunload lifecycle method flushes all remaining unborn cards to disk.

### 4. UI Abstraction

Raw HTML comments degrade the readability of plain-text notes. The presentation layer is abstracted using a CodeMirror 6 ViewPlugin.
The <!--FSRS:...--> string is visually replaced with a minimal WidgetType (e.g., a colored CSS dot). Hovering over this widget displays a tooltip with the parsed FSRS variables.

### 5. Telemetry Decoupling

While scheduling variables (S, D, Due) must remain inline, the review logs (required for FSRS machine learning optimization) cannot. Appending an infinite log of reviews to an inline HTML comment will bloat the file to an unreadable state.
Review logs are strictly decoupled and written to a local, append-only fsrs_telemetry.csv file. Sync conflicts on this specific file are an acceptable architectural trade-off, as they only result in a marginal loss of ML optimization data, not the scheduling parameters themselves.

### FSRS Implementation

The plugin utilizes the standard ts-fsrs library. We map the inline string to the Card interface, calculate the intervals using the DSR mathematical model, and serialize the resulting state back into the markdown file.
