export interface Rule {
    pattern: string;
    responses: string[];
    reassembRules: string[];
}

export interface KeywordData {
    word: string;
    priority: number;
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

export interface IBot {
    getResponse(input: string): { response: string; details: ResponseDetails };
}
