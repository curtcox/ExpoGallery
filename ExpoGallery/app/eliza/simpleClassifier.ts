import { log } from "console";

function sanatize(input: string): string {
    return input.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
}

export class ClassificationRule {
    category: string;
    phrases: string;
    weight: number;  // Optional priority field, defaults to 0

    constructor(category: string, phrases: string, weight?: number) {
        this.category = category;
        this.phrases = phrases;
        this.weight = weight ?? 1;
    }

    score(text: string): number {
        const input = sanatize(text);
        const words = input.split(/\s+/);
        const phraseWords = this.phrases.split(/,/).map(word => word.toLocaleLowerCase());

        let score = 0;
        for (const word of words) {
            if (phraseWords.includes(word)) {
                score += 1;
            }
        }
        return score * this.weight;
    }
}

export function classify(text: string, rules: ClassificationRule[]): Map<string,number> {
    const input = sanatize(text);
    const matches: Map<string,number> = new Map();

    for (const rule of rules) {
        const score = rule.score(input);
        if (score > 0) {
            matches.set(rule.category, score);
        }
    }
    // log('matches', matches);
    return matches;
}