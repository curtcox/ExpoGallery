function sanatize(input: string): string {
    return input.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
}

export interface ResourceRule {
    pattern: RegExp;
    classification: string;
    priority?: number;  // Optional priority field, defaults to 0
}

export type classificationMap = Record<string, ResourceRule>;

export function classify(text: string, rulesMap: classificationMap): string {
    const input = sanatize(text);
    let highestPriority = -1;
    let bestMatch = 'unknown';

    for (const rule of Object.values(rulesMap)) {
        if (rule.pattern.test(input)) {
            const priority = rule.priority ?? 0;  // Use nullish coalescing to default to 0
            if (priority > highestPriority) {
                highestPriority = priority;
                bestMatch = rule.classification;
            }
        }
    }

    return bestMatch;
}