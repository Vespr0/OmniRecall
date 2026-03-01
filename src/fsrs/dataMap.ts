import { Card, State } from 'ts-fsrs';
import { nanoid } from 'nanoid';

export const FSRS_PREFIX = "<!--FSRS:";
export const FSRS_SUFFIX = "-->";

// Pattern: <!--FSRS:ID|Due|Stability|Difficulty|Reps|Lapses|State-->
// Example: <!--FSRS:aB3x|202603051230|5.2|4.8|12|1|2-->
export const FSRS_REGEX = /<!--FSRS:([A-Za-z0-9_-]{4,10})\|(\d{8,14})\|([\d.]+)\|([\d.]+)\|(\d+)\|(\d+)\|(\d+)-->/g;

export interface SerializedFSRSData {
    id: string;
    card: Card;
    rawString: string;
}

export function parseFSRSString(fsrsString: string): SerializedFSRSData | null {
    const match = new RegExp(FSRS_REGEX.source).exec(fsrsString);
    if (!match) return null;

    const [, id, dueStr, stabilityStr, difficultyStr, repsStr, lapsesStr, stateStr] = match;

    const dueYear = parseInt(dueStr.substring(0, 4), 10);
    const dueMonth = parseInt(dueStr.substring(4, 6), 10) - 1; // 0-indexed
    const dueDay = parseInt(dueStr.substring(6, 8), 10);
    
    let dueHour = 0;
    let dueMinute = 0;
    if (dueStr.length >= 12) {
        dueHour = parseInt(dueStr.substring(8, 10), 10);
        dueMinute = parseInt(dueStr.substring(10, 12), 10);
    }
    
    const dueDate = new Date(dueYear, dueMonth, dueDay, dueHour, dueMinute);

    const card: Card = {
        due: dueDate,
        stability: parseFloat(stabilityStr),
        difficulty: parseFloat(difficultyStr),
        elapsed_days: 0,
        scheduled_days: 0,
        reps: parseInt(repsStr, 10),
        lapses: parseInt(lapsesStr, 10),
        state: parseInt(stateStr, 10) as State,
        last_review: dueDate
    };

    return {
        id,
        card,
        rawString: fsrsString
    };
}

function formatDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${year}${month}${day}${hour}${min}`;
}

export function serializeFSRSCard(id: string, card: Card): string {
    const dueStr = formatDate(card.due);
    // Truncate floats to save space
    const stabilityStr = card.stability.toFixed(4).replace(/\.?0+$/, ''); 
    const difficultyStr = card.difficulty.toFixed(4).replace(/\.?0+$/, '');
    
    return `${FSRS_PREFIX}${id}|${dueStr}|${stabilityStr}|${difficultyStr}|${card.reps}|${card.lapses}|${card.state}${FSRS_SUFFIX}`;
}

export function generateNewFSRSString(): string {
    const newId = nanoid(6);
    // Initial State Card for ts-fsrs
    const initialCard: Card = {
        due: new Date(),
        stability: 0,
        difficulty: 0,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 0,
        lapses: 0,
        state: State.New,
        last_review: new Date()
    };
    return serializeFSRSCard(newId, initialCard);
}
