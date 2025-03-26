import { classify } from '../metaphoneClassifier';
import { ProcessedRule } from '../metaphoneClassifier';

describe('MetaphoneClassifier', () => {
    // Sample rules for testing
    const testRules: ProcessedRule[] = [
        {
            categoryName: 'greeting',
            stemmedKeywords: new Set(['hello', 'hi', 'hey']),
            metaphoneKeywords: new Set(['HL', 'H']),
            stemmedPhrases: [['how', 'ar', 'you']],
            stemmedExclusions: new Set(['bye', 'goodby']),
            metaphoneExclusions: new Set(['B', 'KTB']),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'farewell',
            stemmedKeywords: new Set(['bye', 'goodby', 'cya']),
            metaphoneKeywords: new Set(['B', 'KTB']),
            stemmedPhrases: [['see', 'you', 'later']],
            stemmedExclusions: new Set(['hello', 'hi']),
            metaphoneExclusions: new Set(['HL', 'H']),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        }
    ];

    test('should classify basic greetings correctly', () => {
        expect(classify('hello there', testRules)).toBe('greeting');
        expect(classify('hi how are you', testRules)).toBe('greeting');
    });

    test('should classify basic farewells correctly', () => {
        expect(classify('goodbye friend', testRules)).toBe('farewell');
        expect(classify('see you later', testRules)).toBe('farewell');
    });

    test('should return unknown for unmatched input', () => {
        expect(classify('random text here', testRules)).toBe('unknown');
    });

    test('should handle empty input correctly', () => {
        expect(classify('', testRules)).toBe('unknown');
    });

    test('should respect exclusions', () => {
        // Should not classify as greeting because 'bye' is in exclusions
        expect(classify('hello bye', testRules)).not.toBe('greeting');
    });
});