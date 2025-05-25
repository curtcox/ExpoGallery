import { ResponseDetails, IBot } from './ibot';

export interface Keyword {
    word: string;
    priority: number;
	match(input: string): boolean;
	response(input: string): string;
}

export class KeyBot implements IBot {
    private keywords: Keyword[];

    constructor(keywords: Keyword[]) {
        this.keywords = keywords;
    }


    public getResponse(input: string): { response: string; details: ResponseDetails } {
        const matchedKeywords = this.getDecompositionRules(input);

        if (matchedKeywords) {
            const keywordResponses = this.responsesFromAllKeywords(input, matchedKeywords);
            const response = matchedKeywords[0].response(input);
            return {
                response,
                details: {
                    input,
                    keywordResponses
                }
            };
        }

        return {
            response: 'No keyword found',
            details: {
                input,
                keywordResponses: new Map()
            }
        };
    }

    public responsesFromAllKeywords(input: string, keywords: Keyword[]): Map<string, string> {
        return new Map(keywords.map(keyword => [keyword.word, keyword.response(input) ]));
    }

    private getDecompositionRules(input: string): Keyword[] {
        return this.keywords
            .filter(k => input.includes(k.word))
            .sort((a, b) => b.priority - a.priority);
    }
}