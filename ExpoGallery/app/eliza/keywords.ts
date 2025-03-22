export const elizaKeywords: [string, number, [string, string[]][]][] = [
	['hello', 1, [
		['*', ['Hi there!', 'Hello!', 'Hey!']]
	]],
	['i am', 2, [
		['* i am feeling *', ['Why do you say you are feeling (2)?', 'How long have you been feeling (2)?']],
		['* i am *', ['Why do you say you are (2)?', 'How long have you been (2)?']]
	]],
	['because', 2, [
		['* because *', ['And why do you think (2)?', 'Is that the real reason?']]
	]],
	['*', 0, [
		['*', ["Let's explore that further.", "Very interesting.", "Tell me more about that."]]
	]]
];

export const genericResponses = [
	"I see.",
	"Please go on.",
	"Tell me more about that.",
	"That's interesting.",
	"I understand."
];