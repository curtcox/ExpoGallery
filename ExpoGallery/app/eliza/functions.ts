export const elizaKeywords: [ string, number, (x:string) => string ] [] = [
	["math", 0, (x: string) => `The answer to ${x} is ${eval(x)}`],
	["no|nope|nah", 0, (x: string) => `Are you sure, no one ${x} ?`],
	["yes|yup|yep", 0, (x: string) => `Are you sure, yes one ${x} ?`],
];

export const genericResponses: string[] = [
	"Generic response 1",
	"Generic response 2",
];