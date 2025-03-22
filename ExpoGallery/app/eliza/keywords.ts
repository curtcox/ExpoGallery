export const elizaKeywords: [string, number, [string, string[]][]][] = [
	['hello', 10, [
		['*', ['Hello!', 'Hi there!', 'Hey!']]
	]],
	['i am', 5, [
		['i am *', ['Why do you say you are (1)?', 'How long have you been (1)?']],
		['i am feeling *', ['Why do you say you are feeling (1)?', 'How long have you been feeling (1)?']]
	]],
	['because', 5, [
		['because *', ['And why do you think (1)?', 'Is that the real reason?']],
		['* because *', ['And why do you think (2)?', 'Is that the real reason?']]
	]],
	['*', 0, [
		['*', ["Let's explore that further.", "Very interesting.", "Tell me more about that."]]
	]]
];

export const genericResponses = [
	"Let's explore that further.",
	"Very interesting.",
	"Tell me more about that."
];