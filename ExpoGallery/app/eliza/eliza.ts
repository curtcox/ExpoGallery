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

export interface ResponseDetails {
    sanitizedInput: string;
    matchedKeywords: KeywordData[];
    usedRule?: {
        pattern: string;
        response: string;
    };
    isGenericResponse: boolean;
    alternativeResponses?: {
        keyword: string;
        priority: number;
        pattern?: string;
        possibleResponses: string[];
    }[];
}

export class Eliza {
    private keywords: KeywordData[];
    private rng: () => number;

    constructor(seed?: number) {
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

        if (seed !== undefined) {
            // Simple seeded random number generator
            let currentSeed = seed;
            this.rng = () => {
                currentSeed = (1597 * currentSeed + 51749) % 244944;
                return currentSeed / 244944;
            };
        } else {
            this.rng = Math.random;
        }
    }

    public getResponse(input: string): { response: string; details: ResponseDetails } {
        const sanitizedInput = this.sanatize(input);
        const matchedKeywords = this.getDecompositionRules(sanitizedInput);

        if (!matchedKeywords || matchedKeywords.length === 0) {
            const response = genericResponses[Math.floor(this.rng() * genericResponses.length)];
            return {
                response,
                details: {
                    sanitizedInput,
                    matchedKeywords: [],
                    isGenericResponse: true
                }
            };
        }

        // Try each keyword in order of priority
        for (const keyword of matchedKeywords) {
            const decompositionRule = this.getDecompositionRule(sanitizedInput, keyword.rules);
            if (decompositionRule) {
                const reassemblyRule = this.getReassemblyRule(decompositionRule);
                const response = this.reassemble(sanitizedInput, reassemblyRule, decompositionRule.pattern);

                // Collect alternative responses from lower priority matches
                const alternativeResponses = matchedKeywords
                    .filter(k => k !== keyword) // Exclude the current keyword
                    .map(k => {
                        const altDecompRule = this.getDecompositionRule(sanitizedInput, k.rules);
                        return {
                            keyword: k.word,
                            priority: k.priority,
                            pattern: altDecompRule?.pattern,
                            possibleResponses: altDecompRule
                                ? altDecompRule.responses
                                : k.responses
                        };
                    });

                return {
                    response,
                    details: {
                        sanitizedInput,
                        matchedKeywords,
                        usedRule: {
                            pattern: decompositionRule.pattern,
                            response: reassemblyRule
                        },
                        isGenericResponse: false,
                        alternativeResponses
                    }
                };
            }
        }

        // If no decomposition rules match, use the first keyword's response
        const response = matchedKeywords[0].responses[Math.floor(this.rng() * matchedKeywords[0].responses.length)];

        // Collect alternative responses from other matches
        const alternativeResponses = matchedKeywords
            .slice(1) // Exclude the first keyword which was used
            .map(k => ({
                keyword: k.word,
                priority: k.priority,
                possibleResponses: k.responses
            }));

        return {
            response,
            details: {
                sanitizedInput,
                matchedKeywords,
                isGenericResponse: false,
                alternativeResponses
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
        return rule.reassembRules[Math.floor(this.rng() * rule.reassembRules.length)];
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