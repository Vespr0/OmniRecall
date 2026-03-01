import { App, TFile } from 'obsidian';
import { MarkdownParser, Flashcard } from '../parser/parser';
import { generateNewFSRSString, FSRS_REGEX } from '../fsrs/dataMap';

export interface CacheEntry {
    mtime: number;
    cards: Flashcard[];
}

export type CacheData = Record<string, CacheEntry>;

export class CacheManager {
    private app: App;
    private parser: MarkdownParser;
    private data: CacheData = {};
    private saveCallback: (data: CacheData) => Promise<void>;
    private unbornWrites: Map<string, string> = new Map(); // filePath -> newContent
    private unbornRanges: Map<string, { start: number, end: number }[]> = new Map(); // filePath -> ranges

    constructor(app: App, initialData: CacheData, saveCallback: (data: CacheData) => Promise<void>) {
        this.app = app;
        this.data = initialData || {};
        this.parser = new MarkdownParser(app);
        this.saveCallback = saveCallback;
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
                await this.processFile(file);
                changed = true;
            }
        }

        // Remove deleted files
        const filePaths = new Set(files.map(f => f.path));
        for (const path in this.data) {
            if (!filePaths.has(path)) {
                delete this.data[path];
                changed = true;
            }
        }

        if (changed) {
            await this.saveCallback(this.data);
        }
    }

    public async processFile(file: TFile) {
        const content = await this.app.vault.read(file);
        const cards = await this.parser.parseFile(file, content);

        // Check for new cards that need an FSRS state injected
        let needsWrite = false;
        let newContent = content;
        
        // We iterate backwards to avoid breaking indices when inserting text
        for (let i = cards.length - 1; i >= 0; i--) {
            const card = cards[i];
            if (!card.fsrsData) {
                needsWrite = true;
                const injectionString = '\n' + generateNewFSRSString();
                // Inject right after the card ends
                newContent = newContent.substring(0, card.endIndex) + injectionString + newContent.substring(card.endIndex);
            }
        }

        if (needsWrite) {
            // Lazy Injection: Queue the write operation instead of executing it immediately
            this.unbornWrites.set(file.path, newContent);
            
            // Track the spatial boundaries of the Unborn cards for Trigger A (Spatial Blur)
            const lines = content.split('\n');
            const getLine = (index: number) => content.substring(0, index).split('\n').length;
            
            const ranges = cards.filter(c => !c.fsrsData).map(c => ({
                start: getLine(c.startIndex),
                end: getLine(c.endIndex) + 2 // Add a buffer of 2 lines
            }));
            this.unbornRanges.set(file.path, ranges);
            
            // Still update the cache so the Browse tab and other UI elements know about the cards
            // Note: unborn cards won't appear in the review queue until they are flushed and parsed with their new FSRS data.
            this.data[file.path] = {
                mtime: file.stat.mtime,
                cards: cards
            };
        } else {
            // Update cache normally
            this.data[file.path] = {
                mtime: file.stat.mtime,
                cards: cards.filter(c => c.fsrsData !== null) // Only cache valid tracked cards
            };
        }
    }

    public hasUnborn(filePath: string): boolean {
        return this.unbornWrites.has(filePath);
    }

    public getUnbornRanges(filePath: string): { start: number, end: number }[] {
        return this.unbornRanges.get(filePath) || [];
    }

    public async flushFile(file: TFile) {
        const content = this.unbornWrites.get(file.path);
        if (content) {
            this.unbornWrites.delete(file.path);
            this.unbornRanges.delete(file.path);
            await this.app.vault.modify(file, content);
            // The metadataCache 'changed' event will re-trigger processFile to fully register the cards
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
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    public getReviewQueue(): { file: string, card: Flashcard }[] {
        const queue: { file: string, card: Flashcard }[] = [];
        const now = new Date();

        for (const filePath in this.data) {
            for (const card of this.data[filePath].cards) {
                if (card.fsrsData) {
                    // Due date is in the past or today
                    if (card.fsrsData.card.due <= now) {
                        queue.push({ file: filePath, card });
                    }
                }
            }
        }

        // Sort by due date, oldest first
        queue.sort((a, b) => a.card.fsrsData!.card.due.getTime() - b.card.fsrsData!.card.due.getTime());
        return queue;
    }
}
