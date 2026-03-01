import { MarkdownParser } from '../src/parser/parser';
import { App } from 'obsidian';

describe('MarkdownParser', () => {

    const mockApp = {} as App; 

    it('should extract a valid inline flashcard with an FSRS comment', () => {
        const text = `
Here is a test:
Capital of Italy?::Rome
<!--FSRS:abc123|20260305|1|1|1|1|1-->
        `;
        const parser = new MarkdownParser(mockApp);
        const cards = parser.fallbackParseText(text);

        expect(cards.length).toBe(1);
        expect(cards[0].front).toBe('Capital of Italy?');
        expect(cards[0].back).toBe('Rome');
        expect(cards[0].fsrsData?.id).toBe('abc123');
    });

    it('should ignore an FSRS comment if not structurally adjacent to a card', () => {
        const text = `
Just some random text without card syntax.
<!--FSRS:xyz890|20260305|1|1|1|1|1-->
        `;
        const parser = new MarkdownParser(mockApp);
        const cards = parser.fallbackParseText(text);

        expect(cards.length).toBe(0); // Ghost card ignored
    });

    it('should extract multiline flashcards', () => {
        const text = `
Before

Front of multiline card
?
Back of multiline card
<!--FSRS:multi1|20260305|1|1|1|1|1-->

After
        `;
        const parser = new MarkdownParser(mockApp);
        const cards = parser.fallbackParseText(text);

        expect(cards.length).toBe(1);
        expect(cards[0].front).toBe('Front of multiline card');
        expect(cards[0].back).toBe('Back of multiline card');
    });

    it('AST parser should ignore inline cards inside code blocks', async () => {
        const text = `
Here is some code:
\`\`\`python
my_dict = {"Question"::"Answer"}
\`\`\`
        `;
        
        const mockFile = {} as any;
        const mockAppWithCache = {
            metadataCache: {
                getFileCache: (file: any) => ({
                    sections: [
                        { type: 'paragraph', position: { start: { offset: 1 }, end: { offset: 20 } } },
                        // AST type 'code' is not in ALLOWED_BLOCKS
                        { type: 'code', position: { start: { offset: 21 }, end: { offset: 66 } } }
                    ]
                })
            }
        } as unknown as App;

        const parser = new MarkdownParser(mockAppWithCache);
        const cards = await parser.parseFile(mockFile, text);

        expect(cards.length).toBe(0);
    });

    it('AST parser should extract cards from valid paragraphs', async () => {
        const text = `
Here is a normal card
Q::A
        `;
        
        const mockFile = {} as any;
        const mockAppWithCache = {
            metadataCache: {
                getFileCache: (file: any) => ({
                    sections: [
                        { type: 'paragraph', position: { start: { offset: 1 }, end: { offset: 30 } } }
                    ]
                })
            }
        } as unknown as App;

        const parser = new MarkdownParser(mockAppWithCache);
        const cards = await parser.parseFile(mockFile, text);

        expect(cards.length).toBe(1);
        expect(cards[0].front).toBe('Q');
        expect(cards[0].back).toBe('A');
    });
});
