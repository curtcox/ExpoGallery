/**
 * The interface between a chat UI and a chatbot based on keyword matching.
 * It includes some minimal diagnostic information about how the chatbot matched the user's input to a response.
 */

export interface ResponseDetails {
    sanitizedInput: string;
    keywordResponses: Map<string, string>;
}

export interface IBot {
    getResponse(input: string): { response: string; details: ResponseDetails };
}
