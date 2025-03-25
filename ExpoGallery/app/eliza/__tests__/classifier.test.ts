import { classify, ResourceRulesMap } from '../classifier';

describe('resource matcher with default rules', () => {
    const rules: ResourceRulesMap = {
        computer: {
            pattern: /\b(computer|cpu|ram|disk|memory|processor|storage|hardware)\b/,
            classification: 'computer'
        },
        human: {
            pattern: /\b(tired|energy|sleep|exhausted|fatigue|rest|strength)\b/,
            classification: 'human'
        },
        financial: {
            pattern: /\b(money|budget|savings|cost|financial|expensive|price|afford)\b/,
            classification: 'financial'
        },
        time: {
            pattern: /\b(time|hours|schedule|deadline|duration)\b/,
            classification: 'time'
        }
    };

    test('should classify text about computer resources correctly', () => {
        const computerTexts = [
            'My computer is running slow',
            'I need more RAM',
            'The CPU usage is high',
            'My disk space is running low'
        ];

        computerTexts.forEach(text => {
            expect(classify(text, rules)).toBe('computer');
        });
    });

    test('should classify text about human resources correctly', () => {
        const humanTexts = [
            'I feel tired today',
            'My energy levels are low',
            'I need more sleep',
            'I am exhausted from work'
        ];

        humanTexts.forEach(text => {
            expect(classify(text, rules)).toBe('human');
        });
    });

    test('should classify text about financial resources correctly', () => {
        const financialTexts = [
            'I need more money',
            'My budget is tight',
            'Running out of savings',
            'The cost is too high'
        ];

        financialTexts.forEach(text => {
            expect(classify(text, rules)).toBe('financial');
        });
    });

    test('should classify text about time resources correctly', () => {
        const timeTexts = [
            'I dont have enough time',
            'Running out of time',
            'Need more hours in the day',
            'Time is limited'
        ];

        timeTexts.forEach(text => {
            expect(classify(text, rules)).toBe('time');
        });
    });

    test('should return "unknown" for unclassifiable text', () => {
        const unknownTexts = [
            'Hello world',
            'The weather is nice today',
            'I like pizza',
            'Random text with no resource context'
        ];

        unknownTexts.forEach(text => {
            expect(classify(text, rules)).toBe('unknown');
        });
    });

    test('should handle empty strings and whitespace', () => {
        expect(classify('', rules)).toBe('unknown');
        expect(classify('   ', rules)).toBe('unknown');
    });

    test('should be case insensitive', () => {
        expect(classify('MY COMPUTER IS SLOW', rules)).toBe('computer');
        expect(classify('i need more Money', rules)).toBe('financial');
    });
});

describe('weather matcher with custom rules', () => {
    const customRules: ResourceRulesMap = {
        food: {
            pattern: /\b(hungry|food|eat|meal|snack|dinner|lunch|breakfast)\b/,
            classification: 'nutrition'
        },
        weather: {
            pattern: /\b(rain|sun|snow|wind|storm|temperature|weather)\b/,
            classification: 'weather'
        }
    };

    test('should classify text using custom rules', () => {
        expect(classify('I am hungry', customRules)).toBe('nutrition');
        expect(classify('It might rain today', customRules)).toBe('weather');
        expect(classify('I need more RAM', customRules)).toBe('unknown');
    });

    test('should handle empty custom rules', () => {
        expect(classify('any text', {})).toBe('unknown');
    });

    test('should be case insensitive with custom rules', () => {
        expect(classify('FEELING HUNGRY', customRules)).toBe('nutrition');
        expect(classify('The WEATHER is nice', customRules)).toBe('weather');
    });
});