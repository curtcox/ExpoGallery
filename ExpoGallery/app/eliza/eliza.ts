import { ResponseDetails, IBot } from './ibot';
import { elizaKeywordsRules, Keyword} from './keywords';

export class Eliza implements IBot {
    private keywords: Keyword[];

    constructor() {
        this.keywords = elizaKeywordsRules;
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