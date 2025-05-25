import { Keyword } from './keyBot';

function math(x: string): string {
	return eval(x.replace(/math/g, ''));
}

const keywords: [ string, number, (x:string) => string ] [] = [
	["math", 0, (x: string) => `The answer to ${x} is ${math(x)}`],
	["no",   0, (x: string) => `Are you sure, no one ${x} ?`],
	["yes",  0, (x: string) => `Are you sure, yes one ${x} ?`],
	["",     0, (_: string) => `Try yes, no, or math.`],
];

function sanatize(input: string): string {
	return input.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
}

class KeywordFunction implements Keyword {
	word: string;
	priority: number;
	f: (x:string) => string;
	response(input: string): string {
		try {
			return this.f(input);
		} catch (e) {
			return `Error: ${e}`;
		}
	}

	match(input: string): boolean {
		return input.includes(sanatize(this.word));
	}

	constructor(word: string, priority: number, f: (x:string) => string) {
		this.word = word;
		this.priority = priority;
		this.f = f;
	}
}


export const allFunctions: Keyword[] = keywords.map(
	([word, priority, rule]: [string, number, (x:string) => string]): KeywordFunction =>
		new KeywordFunction(word, priority, rule));