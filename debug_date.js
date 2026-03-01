const { FSRS, State, createEmptyCard } = require('ts-fsrs');

// Simulate the dataMap.ts parsing and engine.ts review
const dueYear = parseInt("20260305".substring(0, 4), 10);
const dueMonth = parseInt("20260305".substring(4, 6), 10) - 1;
const dueDay = parseInt("20260305".substring(6, 8), 10);
const dueDate = new Date(dueYear, dueMonth, dueDay);

const card = {
    due: dueDate,
    stability: 5.2,
    difficulty: 4.8,
    reps: 12,
    lapses: 1,
    state: 2 // Review
};

const f = new FSRS();
try {
    const schedulingInfo = f.repeat(card, new Date());
    console.log("Success:", Object.keys(schedulingInfo));
} catch (e) {
    console.error("Failed!", e);
}
