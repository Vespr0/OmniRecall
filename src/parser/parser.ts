import { App, TFile, CachedMetadata, SectionCache } from 'obsidian';
import { parseFSRSString, SerializedFSRSData, FSRS_REGEX, generateNewFSRSString } from '../fsrs/dataMap';

export interface Flashcard {
    front: string;
    back: string;
    fsrsData: SerializedFSRSData | null;
    startIndex: number;
    endIndex: number;
    type: 'inline' | 'multiline';
}

export class MarkdownParser {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    // Matches inline cards: "Front :: Back"
    private readonly INLINE_REGEX = /^(.+?)::(.+?)$/gm;

    // Allowed Markdown blocks for inline and multiline cards
    // Excludes 'code', 'math', 'yaml' to prevent false positives
    private readonly ALLOWED_BLOCKS = new Set(['callout', 'list', 'paragraph', 'quote', 'blockquote']);

    public async parseFile(file: TFile, text: string): Promise<Flashcard[]> {
        const cards: Flashcard[] = [];
        const cache = this.app.metadataCache.getFileCache(file);
        
        if (!cache || !cache.sections) {
            // Fallback to naive regex if cache isn't ready
            return this.fallbackParseText(text);
        }

        const sections = cache.sections;

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];

            if (!this.ALLOWED_BLOCKS.has(section.type)) {
                continue;
            }

            const sectionStartIndex = section.position.start.offset;
            const sectionEndIndex = section.position.end.offset;
            const blockText = text.substring(sectionStartIndex, sectionEndIndex);

            // 1. Parse Inline Flashcards within valid blocks
            let inlineMatch;
            this.INLINE_REGEX.lastIndex = 0;
            while ((inlineMatch = this.INLINE_REGEX.exec(blockText)) !== null) {
                const front = inlineMatch[1].trim();
                const back = inlineMatch[2].trim();
                
                // Real indices based on the original full text
                const startIndex = sectionStartIndex + inlineMatch.index;
                const endIndex = startIndex + inlineMatch[0].length;

                const fsrsData = this.checkForFSRSComment(text, endIndex);

                cards.push({
                    front,
                    back,
                    fsrsData,
                    startIndex,
                    endIndex: fsrsData ? endIndex + fsrsData.rawString.length + this.getWhitespaceLength(text, endIndex) : endIndex,
                    type: 'inline'
                });
            }
        }

        // 2. Parse Multiline Flashcards
        // Note: Obsidian AST parses paragraphs separated by blank lines into separate section objects.
        // This means a multiline card of [Paragraph \n?\n Paragraph] spans multiple AST nodes.
        // We iterate the original split methodology, but ONLY accept it if the start/end bounds fall within valid AST sections.

        const blocks = text.split(/\n{2,}/);
        let currentOffset = 0;
        
        for (let j = 0; j < blocks.length; j++) {
            const block = blocks[j];
            const qIndex = block.indexOf('\n?\n');
            
            if (qIndex !== -1) {
                const blockStartIndex = text.indexOf(block, currentOffset);
                const blockEndIndex = blockStartIndex + block.length;
                
                // Verify this block falls within valid AST territory (not inside a code block or math block)
                const isInsideValidAst = sections.some(sec => 
                    this.ALLOWED_BLOCKS.has(sec.type) && 
                    ((blockStartIndex >= sec.position.start.offset && blockStartIndex <= sec.position.end.offset) ||
                     (blockEndIndex >= sec.position.start.offset && blockEndIndex <= sec.position.end.offset))
                );

                if (isInsideValidAst) {
                    const front = block.substring(0, qIndex).trim();
                    const back = block.substring(qIndex + 3).replace(new RegExp(FSRS_REGEX.source, 'g'), '').trim();
                    
                    const fsrsData = this.checkForFSRSComment(text, blockEndIndex - this.getTrailingFSRSTextLength(block));

                    cards.push({
                        front,
                        back,
                        fsrsData,
                        startIndex: blockStartIndex,
                        endIndex: fsrsData ? blockEndIndex : blockEndIndex,
                        type: 'multiline'
                    });
                }
                
                currentOffset = blockEndIndex;
            } else {
                currentOffset = text.indexOf(block, currentOffset) + block.length;
            }
        }

        return cards;
    }

    // Retained for fallback and unit tests without an active FileCache
    public fallbackParseText(text: string): Flashcard[] {
        const cards: Flashcard[] = [];
        
        // 1. Parse Inline Flashcards
        let inlineMatch;
        this.INLINE_REGEX.lastIndex = 0;
        while ((inlineMatch = this.INLINE_REGEX.exec(text)) !== null) {
            const front = inlineMatch[1].trim();
            const back = inlineMatch[2].trim();
            const startIndex = inlineMatch.index;
            const endIndex = startIndex + inlineMatch[0].length;

            const fsrsData = this.checkForFSRSComment(text, endIndex);

            cards.push({
                front,
                back,
                fsrsData,
                startIndex,
                endIndex: fsrsData ? endIndex + fsrsData.rawString.length + this.getWhitespaceLength(text, endIndex) : endIndex,
                type: 'inline'
            });
        }

        // 2. Parse Multiline Flashcards
        const blocks = text.split(/\n{2,}/);
        let currentOffset = 0;
        
        for (const block of blocks) {
            const qIndex = block.indexOf('\n?\n');
            if (qIndex !== -1) {
                const front = block.substring(0, qIndex).trim();
                const back = block.substring(qIndex + 3).replace(new RegExp(FSRS_REGEX.source, 'g'), '').trim();
                
                const blockStartIndex = text.indexOf(block, currentOffset);
                const blockEndIndex = blockStartIndex + block.length;
                
                const fsrsData = this.checkForFSRSComment(text, blockEndIndex - this.getTrailingFSRSTextLength(block));

                cards.push({
                    front,
                    back,
                    fsrsData,
                    startIndex: blockStartIndex,
                    endIndex: fsrsData ? blockEndIndex : blockEndIndex,
                    type: 'multiline'
                });
                
                currentOffset = blockEndIndex;
            } else {
                currentOffset = text.indexOf(block, currentOffset) + block.length;
            }
        }

        return cards;
    }

    private getTrailingFSRSTextLength(block: string): number {
        const match = new RegExp(FSRS_REGEX.source + '$').exec(block.trim());
        return match ? match[0].length : 0;
    }

    private getWhitespaceLength(text: string, startIndex: number): number {
        let len = 0;
        while (startIndex + len < text.length && (text[startIndex + len] === ' ' || text[startIndex + len] === '\n' || text[startIndex + len] === '\r')) {
            len++;
        }
        return len;
    }

    /**
     * Checks if there's an FSRS comment immediately following the matched card
     */
    private checkForFSRSComment(text: string, currentIndex: number): SerializedFSRSData | null {
        // Skip whitespace and newlines after the card
        let offset = currentIndex;
        while (offset < text.length && (text[offset] === ' ' || text[offset] === '\n' || text[offset] === '\r')) {
            offset++;
        }

        // Check if the next characters match FSRS tracking string
        const substr = text.substring(offset, offset + 100); // 100 chars should be enough for FSRS comment
        const fsrsMatch = new RegExp('^' + FSRS_REGEX.source).exec(substr);

        if (fsrsMatch) {
            return parseFSRSString(fsrsMatch[0]);
        }

        return null;
    }
}
