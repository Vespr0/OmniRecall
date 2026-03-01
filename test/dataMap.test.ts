import { State } from 'ts-fsrs';
import { parseFSRSString, serializeFSRSCard, FSRS_REGEX, generateNewFSRSString } from '../src/fsrs/dataMap';

describe('FSRS Data Mapping', () => {

    it('should correctly parse a valid FSRS string', () => {
        const testStr = '<!--FSRS:x7k9P2|20260305|5.234|4.812|12|1|2-->';
        const result = parseFSRSString(testStr);

        expect(result).not.toBeNull();
        expect(result?.id).toBe('x7k9P2');
        expect(result?.card.due.getFullYear()).toBe(2026);
        expect(result?.card.due.getMonth()).toBe(2); // March is 2 (0-indexed)
        expect(result?.card.due.getDate()).toBe(5);
        
        expect(result?.card.stability).toBe(5.234);
        expect(result?.card.difficulty).toBe(4.812);
        expect(result?.card.reps).toBe(12);
        expect(result?.card.lapses).toBe(1);
        expect(result?.card.state).toBe(State.Review);
    });

    it('should return null for invalid strings', () => {
        expect(parseFSRSString('<!--FSRS:123-->')).toBeNull(); // Missing params
        expect(parseFSRSString('FSRS:x7k9P2|20260305|5.2|4.8|12|1|2')).toBeNull(); // Missing HTML comment tags
    });

    it('should correctly serialize an FSRS card', () => {
        const date = new Date(2026, 2, 5); // March 5, 2026
        const card = {
            due: date,
            stability: 5.2,
            difficulty: 4.8,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 12,
            lapses: 1,
            state: State.Review,
            last_review: date
        };

        const result = serializeFSRSCard('x7k9P2', card);
        expect(result).toBe('<!--FSRS:x7k9P2|202603050000|5.2|4.8|12|1|2-->');
    });

    it('should truncate floats during serialization', () => {
        const date = new Date(2026, 2, 5);
        const card = {
            due: date,
            stability: 5.234567,
            difficulty: 4.8000,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 12,
            lapses: 1,
            state: State.Review,
            last_review: date
        };

        const result = serializeFSRSCard('x7k9P2', card);
        expect(result).toBe('<!--FSRS:x7k9P2|202603050000|5.2346|4.8|12|1|2-->');
    });

    it('should generate a new FSRS string with 6-char id', () => {
        const result = generateNewFSRSString();
        const parsed = parseFSRSString(result);
        expect(parsed).not.toBeNull();
        expect(parsed?.id.length).toBe(6);
        expect(parsed?.card.state).toBe(State.New);
        expect(parsed?.card.reps).toBe(0);
    });

    it('regex should match iteratively', () => {
        const text = `
Here is a flashcard
Capital of Italy?::Rome
<!--FSRS:abc123|202603051230|1|1|1|1|1-->
Another card
Q?
A
<!--FSRS:xyz890|202603061230|2|2|2|2|2-->
        `;

        const matches = [...text.matchAll(FSRS_REGEX)];
        expect(matches.length).toBe(2);
        expect(matches[0][1]).toBe('abc123');
        expect(matches[1][1]).toBe('xyz890');
    });
});
