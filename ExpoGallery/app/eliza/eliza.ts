import { KeywordData, Rule, ResponseDetails } from './ibot';
import { elizaKeywords, genericResponses } from './keywords';

export class Eliza {
    private keywords: KeywordData[];
    private rng: () => number;

    constructor() {
        this.keywords = elizaKeywords.map(([word, priority, rules]: [string, number, [string, string[]][]]): KeywordData => ({
            word,
            priority,
            rules: rules.map(([pattern, responses]: [string, string[]]) => ({
                pattern,
                responses,
                reassembRules: responses
            }))
        }));

        this.rng = Math.random;
    }

    private pick<T>(array: T[]): T {
        return array[Math.floor(this.rng() * array.length)];
    }

    public getResponse(input: string): { response: string; details: ResponseDetails } {
        const sanitizedInput = this.sanatize(input);
        const matchedKeywords = this.getDecompositionRules(sanitizedInput);

        if (matchedKeywords) {
            for (const keyword of matchedKeywords) {
                const decompositionRule = this.getDecompositionRule(sanitizedInput, keyword.rules);
                if (decompositionRule) {
                    const reassemblyRule = this.getReassemblyRule(decompositionRule);
                    const response = this.reassemble(sanitizedInput, reassemblyRule, decompositionRule.pattern);
                    return {
                        response,
                        details: {
                            sanitizedInput,
                            matchedKeywords,
                            pattern: decompositionRule.pattern,
                            response: reassemblyRule
                        }
                    };
                }
            }
        }

        return {
            response: 'No mathing response.',
            details: {
                sanitizedInput,
                matchedKeywords,
                pattern: '',
                response: ''
            }
        };
    }

    private sanatize(input: string): string {
        return input.toLowerCase().replace(/[^\w\s]/g, '').trim();
    }

    private matchesKeyword(input: string, keyword: string): boolean {
        // Split keyword by | to handle multiple variations
        const variations = keyword.split('|');
        return variations.some(variation => input.includes(variation));
    }

    private getDecompositionRules(input: string): KeywordData[] {
        return this.keywords
            .filter(k => this.matchesKeyword(input, k.word))
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
        return this.pick(rule.reassembRules);
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