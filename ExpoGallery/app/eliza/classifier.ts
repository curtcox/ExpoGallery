function sanatize(input: string): string {
    return input.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

export interface ResourceRule {
    pattern: RegExp;
    classification: string;
}

export type ResourceRulesMap = Record<string, ResourceRule>;

export function classify(text: string, rulesMap: ResourceRulesMap): string {
    const input = sanatize(text);

    for (const rule of Object.values(rulesMap)) {
        if (rule.pattern.test(input)) {
            return rule.classification;
        }
    }

    return 'unknown';
}