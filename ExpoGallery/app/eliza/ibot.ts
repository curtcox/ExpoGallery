export interface Rule {
    decompRule: string;
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
    pattern: string;
    response: string;
}

export interface IBot {
    getResponse(input: string): { response: string; details: ResponseDetails };
}
