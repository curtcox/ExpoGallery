import { ResponseDetails, IBot } from './ibot';
import { elizaKeywords, genericResponses } from './keywords';

const rng = Math.random;

function pick<T>(array: T[]): T {
    return array[Math.floor(rng() * array.length)];
}

class Rule {

    public decompRule: string;
    public responses: string[];
    public reassembRules: string[];

    constructor(decompRule: string, responses: string[], reassembRules: string[]) {
        this.decompRule = decompRule;
        this.responses = responses;
        this.reassembRules = reassembRules;
    }

    public getResponse(input: string): string {
        return this.reassemble(input, pick(this.reassembRules), this.decompRule);
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

interface KeywordData {
    word: string;
    priority: number;
    rules: Rule[];
}

function ruleFromData(decompRule: string, responses: string[], reassembRules: string[]): Rule {
    return new Rule(decompRule, responses, reassembRules);
}


export class Eliza implements IBot {
    private keywords: KeywordData[];

    constructor() {
        this.keywords = elizaKeywords.map(([word, priority, rules]: [string, number, [string, string[]][]]): KeywordData => ({
            word,
            priority,
            rules: rules.map(([decompRule, responses]: [string, string[]]) => ruleFromData(decompRule, responses, responses))
        }));
    }


    public getResponse(input: string): { response: string; details: ResponseDetails } {
        const sanitizedInput = this.sanatize(input);
        const matchedKeywords = this.getDecompositionRules(sanitizedInput);

        if (matchedKeywords) {
            const keywordResponses = this.responsesFromAllKeywords(sanitizedInput, matchedKeywords);
            const response = this.responseFromOneKeyword(sanitizedInput, matchedKeywords[0]);
            return {
                response,
                details: {
                    sanitizedInput,
                    keywordResponses
                }
            };
        }

        return {
            response: pick(genericResponses),
            details: {
                sanitizedInput,
                keywordResponses: new Map()
            }
        };
    }

    public responsesFromAllKeywords(input: string, keywords: KeywordData[]): Map<string, string> {
        return new Map(keywords.map(keyword => [keyword.word, this.responseFromOneKeyword(input, keyword)]));
    }

    public responseFromOneKeyword(input: string, keyword: KeywordData): string {
        return pick(keyword.rules).getResponse(input);
    }

    private sanatize(input: string): string {
        return input.toLowerCase().replace(/[^\w\s]/g, '').trim();
    }

    private getDecompositionRules(input: string): KeywordData[] {
        return this.keywords
            .filter(k => input.includes(k.word))
            .sort((a, b) => b.priority - a.priority);
    }
}