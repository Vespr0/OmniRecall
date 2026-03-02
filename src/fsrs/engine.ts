import { FSRS, fsrs, generatorParameters, Card, Rating, ReviewLog } from 'ts-fsrs';

export class FSRSEngine {
    private f: FSRS;

    constructor(requestRetention: number = 0.9, customWeights?: number[]) {
        if (customWeights && customWeights.length === 17) {
            const params = generatorParameters({ request_retention: requestRetention, w: customWeights, maximum_interval: 36500 });
            this.f = fsrs(params);
        } else {
            const params = generatorParameters({ request_retention: requestRetention, maximum_interval: 36500 });
            this.f = fsrs(params);
        }
    }

    /**
     * Recreate FSRS instance if weights change
     */
    public updateWeights(requestRetention: number, customWeights: number[] = []) {
        if (customWeights && customWeights.length === 17) {
            const params = generatorParameters({ request_retention: requestRetention, w: customWeights, maximum_interval: 36500 });
            this.f = fsrs(params);
        } else {
            const params = generatorParameters({ request_retention: requestRetention, maximum_interval: 36500 });
            this.f = fsrs(params);
        }
    }

    /**
     * Process a review
     * @param card The current FSRS Card parsed from the markdown
     * @param rating User's rating (1=Again, 2=Hard, 3=Good, 4=Easy)
     * @param now Timestamp of the review
     */
    public reviewCard(card: Card, rating: Rating, now: Date = new Date()): { card: Card, log: ReviewLog } {
        const schedulingInfo = this.f.repeat(card, now);
        return (schedulingInfo as any)[rating];
    }
}
