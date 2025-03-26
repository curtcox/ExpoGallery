function sanatize(input: string): string {
    return input.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
}

export interface ClassificationRule {
    pattern: RegExp;
    classification: string;
    priority?: number;  // Optional priority field, defaults to 0
}

export type classificationMap = Record<string, ClassificationRule>;

export function classify(text: string, rulesMap: classificationMap): string[] {
    const input = sanatize(text);
    const matches: Array<{classification: string; priority: number}> = [];

    // Collect all matches with their priorities
    for (const rule of Object.values(rulesMap)) {
        if (rule.pattern.test(input)) {
            matches.push({
                classification: rule.classification,
                priority: rule.priority ?? 0
            });
        }
    }

    // Sort matches by priority in descending order
    matches.sort((a, b) => b.priority - a.priority);

    // Return array of classifications
    return matches.map(match => match.classification);
}