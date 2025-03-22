import { elizaKeywords, genericResponses } from './keywords';

interface Rule {
    pattern: string;
    responses: string[];
    reassembRules: string[];
}

interface KeywordData {
    word: string;
    priority: number;
    responses: string[];
    rules: Rule[];
}

type KeywordTuple = [string, number, [string, string[]][]][];

export class Eliza {
    private keywords: KeywordData[];

    constructor() {
        this.keywords = elizaKeywords.map(([word, priority, rules]: [string, number, [string, string[]][]]): KeywordData => ({
            word,
            priority,
            responses: rules.map(([_, responses]: [string, string[]]) => responses[0]),
            rules: rules.map(([pattern, responses]: [string, string[]]) => ({
                pattern,
                responses,
                reassembRules: responses
            }))
        }));
    }

    public getResponse(input: string): string {
        const sanitizedInput = this.sanatize(input);
        const matchedKeywords = this.getDecompositionRules(sanitizedInput);

        if (!matchedKeywords || matchedKeywords.length === 0) {
            const genericResponses = this.keywords.find(k => k.word === '*')?.responses || [];
            return genericResponses[Math.floor(Math.random() * genericResponses.length)];
        }

        // Try each keyword in order of priority
        for (const keyword of matchedKeywords) {
            const decompositionRule = this.getDecompositionRule(sanitizedInput, keyword.rules);
            if (decompositionRule) {
                const reassemblyRule = this.getReassemblyRule(decompositionRule);
                return this.reassemble(sanitizedInput, reassemblyRule, decompositionRule.pattern);
            }
        }

        // If no decomposition rules match, use the first keyword's response
        return matchedKeywords[0].responses[Math.floor(Math.random() * matchedKeywords[0].responses.length)];
    }

    private sanatize(input: string): string {
        return input.toLowerCase().replace(/[^\w\s]/g, '').trim();
    }

    private getDecompositionRules(input: string): KeywordData[] {
        return this.keywords
            .filter(k => input.includes(k.word))
            .sort((a, b) => b.priority - a.priority);
    }

    private getDecompositionRule(input: string, rules: Rule[]): Rule | null {
        for (const rule of rules) {
            const regex = this.getRegExp(rule.pattern);
            if (regex.test(input)) {
                return rule;
            }
        }
        return null;
    }

    private getReassemblyRule(rule: Rule): string {
        return rule.reassembRules[Math.floor(Math.random() * rule.reassembRules.length)];
    }

    private getRegExp(pattern: string): RegExp {
        const parts = pattern.split('*').map(part => part.trim());
        const regexParts = parts.map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regexPattern = regexParts.join('(.*)');
        return new RegExp(regexPattern);
    }

    private reassemble(input: string, reassemblyRule: string, decompositionRule: string): string {
        const regex = this.getRegExp(decompositionRule);
        const matches = input.match(regex);
        if (!matches) return reassemblyRule;

        let result = reassemblyRule;
        for (let i = 1; i < matches.length; i++) {
            result = result.replace(`(${i})`, matches[i] ? matches[i].trim() : '');
        }
        return result;
    }
}