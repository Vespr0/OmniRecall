import { App, TFile, Events } from "obsidian";
import { MarkdownParser, Flashcard } from "../parser/parser";
import {
  generateNewFSRSString,
  FSRS_REGEX,
  SerializedFSRSData,
} from "../fsrs/dataMap";
import { FSRSPluginSettings } from "../main";

export interface CacheEntry {
  mtime: number;
  cards: Flashcard[];
}

export type CacheData = Record<string, CacheEntry>;

export class CacheManager extends Events {
  private app: App;
  private parser: MarkdownParser;
  private data: CacheData = {};
  private saveCallback: (data: CacheData) => Promise<void>;
  private unbornWrites: Map<string, string> = new Map(); // filePath -> newContent
  private unbornRanges: Map<string, { start: number; end: number }[]> =
    new Map(); // filePath -> ranges

  constructor(
    app: App,
    initialData: CacheData,
    saveCallback: (data: CacheData) => Promise<void>,
    settings: FSRSPluginSettings,
  ) {
    super();
    this.app = app;
    this.data = this.rehydrateCache(initialData || {});
    this.parser = new MarkdownParser(app, settings);
    this.saveCallback = saveCallback;
  }

  private rehydrateCache(data: CacheData): CacheData {
    for (const filePath in data) {
      const entry = data[filePath];
      if (entry && entry.cards) {
        for (const card of entry.cards) {
          if (card.fsrsData && card.fsrsData.card) {
            if (typeof card.fsrsData.card.due === "string") {
              card.fsrsData.card.due = new Date(card.fsrsData.card.due);
            }
            if (typeof card.fsrsData.card.last_review === "string") {
              card.fsrsData.card.last_review = new Date(
                card.fsrsData.card.last_review,
              );
            }
          }
        }
      }
    }
    return data;
  }

  public getCacheData(): CacheData {
    return this.data;
  }

  public async scanVault() {
    const files = this.app.vault.getMarkdownFiles();
    let changed = false;

    for (const file of files) {
      const cached = this.data[file.path];
      if (!cached || cached.mtime !== file.stat.mtime) {
        await this.processFile(file, true);
        changed = true;
      }
    }

    // Remove deleted files
    const filePaths = new Set(files.map((f) => f.path));
    for (const path in this.data) {
      if (!filePaths.has(path)) {
        delete this.data[path];
        changed = true;
      }
    }

    if (changed) {
      await this.saveCallback(this.data);
      this.trigger("update");
    }
  }

  public async processFile(file: TFile, skipTrigger = false) {
    const content = await this.app.vault.read(file);
    const cards = await this.parser.parseFile(file, content);

    let previousCards: Flashcard[] = [];
    const oldUnbornContent = this.unbornWrites.get(file.path);
    if (oldUnbornContent) {
      previousCards = this.parser.fallbackParseText(oldUnbornContent);
    }

    // Check for new cards that need an FSRS state injected
    let needsWrite = false;
    let newContent = content;

    // We iterate backwards to avoid breaking indices when inserting text
    for (let i = cards.length - 1; i >= 0; i--) {
      const card = cards[i];
      if (!card.fsrsData) {
        needsWrite = true;

        const matchedPrevCard = previousCards.find(
          (c) =>
            c.type === card.type &&
            ((c.front === card.front && c.back === card.back) ||
              c.startIndex === card.startIndex),
        );

        let injectionString = "";
        if (matchedPrevCard && matchedPrevCard.fsrsData) {
          injectionString = " " + matchedPrevCard.fsrsData.rawString;
        } else {
          injectionString = " " + generateNewFSRSString();
        }

        // Inject right after the card ends
        newContent =
          newContent.substring(0, card.endIndex) +
          injectionString +
          newContent.substring(card.endIndex);
      }
    }

    if (needsWrite) {
      // Lazy Injection: Queue the write operation instead of executing it immediately
      this.unbornWrites.set(file.path, newContent);

      // Track the spatial boundaries of the Unborn cards for Trigger A (Spatial Blur)
      const lines = content.split("\n");
      const getLine = (index: number) =>
        content.substring(0, index).split("\n").length;

      const ranges = cards
        .filter((c) => !c.fsrsData)
        .map((c) => ({
          start: getLine(c.startIndex),
          end: getLine(c.endIndex) + 2, // Add a buffer of 2 lines
        }));
      this.unbornRanges.set(file.path, ranges);

      // Still update the cache so the Browse tab and other UI elements know about the cards
      // Note: unborn cards won't appear in the review queue until they are flushed and parsed with their new FSRS data.
      this.data[file.path] = {
        mtime: file.stat.mtime,
        cards: cards,
      };
    } else {
      // Update cache normally
      this.data[file.path] = {
        mtime: file.stat.mtime,
        cards: cards.filter((c) => c.fsrsData !== null), // Only cache valid tracked cards
      };
    }

    if (!skipTrigger) {
      this.trigger("update");
    }
  }

  public hasUnborn(filePath: string): boolean {
    return this.unbornWrites.has(filePath);
  }

  public getUnbornRanges(filePath: string): { start: number; end: number }[] {
    return this.unbornRanges.get(filePath) || [];
  }

  public async flushFile(file: TFile) {
    const content = this.unbornWrites.get(file.path);
    if (content) {
      this.unbornWrites.delete(file.path);
      this.unbornRanges.delete(file.path);
      await this.app.vault.modify(file, content);
      // The metadataCache 'changed' event will re-trigger processFile to fully register the cards
      this.trigger("update");
    }
  }

  public async flushAll() {
    if (this.unbornWrites.size === 0) return;

    for (const [path, content] of this.unbornWrites.entries()) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        await this.app.vault.modify(file, content);
      }
    }
    this.unbornWrites.clear();
    this.unbornRanges.clear();

    // Wait a small amount of time for Obsidian to fire the metadataCache changed events
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.trigger("update");
  }

  public updateCardFsrsData(
    filePath: string,
    cardId: string,
    fsrsData: SerializedFSRSData,
  ) {
    const entry = this.data[filePath];
    if (entry) {
      const card = entry.cards.find((c) => c.fsrsData?.id === cardId);
      if (card) {
        card.fsrsData = fsrsData;
        this.trigger("update");
      }
    }
  }

  public getReviewQueue(prefix?: string | null): { file: string; card: Flashcard }[] {
    const queue: { file: string; card: Flashcard }[] = [];
    const now = new Date();

    for (const filePath in this.data) {
      if (prefix && filePath !== prefix && !filePath.startsWith(prefix + "/")) {
        continue;
      }
      
      for (const card of this.data[filePath].cards) {
        if (card.fsrsData) {
          // Due date is in the past or today
          if (card.fsrsData.card.due <= now) {
            queue.push({ file: filePath, card });
          }
        }
      }
    }

    // Fisher-Yates shuffle: interleave the queue so every review is
    // an independent retrieval event, preventing sequential cueing
    // from inflating FSRS Stability estimates.
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    return queue;
  }
}
