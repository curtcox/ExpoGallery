import { metaphones, stemmed, wordMatchScore, phraseMatchScore } from '../metaphoneRule';

describe('metaphones function', () => {
    test('should generate metaphone codes for a single simple word', () => {
        const input = ['smith'];
        const result = metaphones(input);
        expect(result.has('SM0')).toBeTruthy(); // Smith typically gets SM0 as primary code
        expect(result.size).toBeGreaterThan(0);
    });

    test('should generate metaphone codes for multiple words', () => {
        const input = ['smith', 'smythe'];
        const result = metaphones(input);
        // Both smith and smythe should generate similar metaphone codes
        expect(result.has('SM0')).toBeTruthy();
        // Should have codes for both words
        expect(result.size).toBeGreaterThan(1);
    });

    test('should handle different cases consistently', () => {
        const lowerCase = metaphones(['smith']);
        const upperCase = metaphones(['SMITH']);
        const mixedCase = metaphones(['SmItH']);

        // All should generate the same metaphone codes
        expect(lowerCase).toEqual(upperCase);
        expect(lowerCase).toEqual(mixedCase);
    });

    test('should handle punctuation correctly', () => {
        const withPunctuation = metaphones(['smith!', 'smith.', 'smith?']);
        const withoutPunctuation = metaphones(['smith']);

        // Should generate same codes regardless of punctuation
        expect(withPunctuation).toEqual(withoutPunctuation);
    });

    test('should handle empty and invalid inputs', () => {
        const emptyArray = metaphones([]);
        const emptyString = metaphones(['']);
        const whitespace = metaphones([' ', '  ']);

        expect(emptyArray.size).toBe(0);
        expect(emptyString.size).toBe(0);
        expect(whitespace.size).toBe(0);
    });
});

describe('stemmed function', () => {
    test('should correctly stem basic words', () => {
        const input = ['running', 'jumping', 'swimming'];
        const result = stemmed(input);
        // The Porter Stemmer should reduce these words to their roots
        expect(result.has('run')).toBeTruthy();
        expect(result.has('jump')).toBeTruthy();
        expect(result.has('swim')).toBeTruthy();
    });

    test('should handle different cases consistently', () => {
        const lowerCase = stemmed(['running']);
        const upperCase = stemmed(['RUNNING']);
        const mixedCase = stemmed(['RuNnInG']);

        // All should produce the same stemmed result
        expect(lowerCase).toEqual(upperCase);
        expect(lowerCase).toEqual(mixedCase);
    });

    test('should handle punctuation correctly', () => {
        const withPunctuation = stemmed(['running!', 'running.', 'running?']);
        const withoutPunctuation = stemmed(['running']);

        // Should produce same stemmed result regardless of punctuation
        expect(withPunctuation).toEqual(withoutPunctuation);
    });

    test('should handle empty and invalid inputs', () => {
        const emptyArray = stemmed([]);
        const emptyString = stemmed(['']);

        // Only test empty array and empty string since whitespace handling
        // depends on the normalizeText function's behavior
        expect(emptyArray.size).toBe(0);
        expect(emptyString.size).toBe(0);
    });

    test('should stem similar word forms', () => {
        const input = ['running', 'runs', 'ran'];
        const result = stemmed(input);

        // Each word form might stem differently due to Porter Stemmer rules
        expect(result.has('run')).toBeTruthy();  // 'running' -> 'run'
        expect(result.has('run')).toBeTruthy();  // 'runs' -> 'run'
        expect(result.has('ran')).toBeTruthy();  // 'ran' stays as 'ran'
        expect(result.size).toBe(2);  // 'run' and 'ran'
    });
});

describe('wordMatchScore function', () => {
    test('identical strings should have the highest score', () => {
        const exactMatch = wordMatchScore('hello', 'hello');
        expect(exactMatch).toBe(1.0);
    });

    test('case-insensitive matches should score lower than exact but higher than stem matches', () => {
        const exactMatch = wordMatchScore('hello', 'hello');
        const caseMatch = wordMatchScore('hello', 'HELLO');
        const stemMatch = wordMatchScore('running', 'run');

        expect(caseMatch).toBeLessThan(exactMatch);
        expect(caseMatch).toBeGreaterThan(stemMatch);
        expect(caseMatch).toBeGreaterThan(0.8); // High score but not perfect
    });

    test('stem matches should score lower than case-insensitive but higher than metaphone matches', () => {
        const caseMatch = wordMatchScore('hello', 'HELLO');
        const stemMatch = wordMatchScore('running', 'run');
        const metaphoneMatch = wordMatchScore('phone', 'fone');

        expect(stemMatch).toBeLessThan(caseMatch);
        expect(stemMatch).toBeGreaterThan(metaphoneMatch);
        expect(stemMatch).toBeGreaterThan(0.6); // Good score but clearly below case match
    });

    test('metaphone matches should score lower than stem matches but higher than no match', () => {
        const stemMatch = wordMatchScore('running', 'run');
        const metaphoneMatch = wordMatchScore('phone', 'fone');
        const noMatch = wordMatchScore('hello', 'world');

        expect(metaphoneMatch).toBeLessThan(stemMatch);
        expect(metaphoneMatch).toBeGreaterThan(noMatch);
        expect(metaphoneMatch).toBeGreaterThan(0.4); // Moderate score
    });

    test('no matches should have the lowest score of 0', () => {
        const noMatch = wordMatchScore('hello', 'world');
        expect(noMatch).toBe(0);
    });

    test('score hierarchy should be consistent across different examples', () => {
        // Different word sets should follow same hierarchy
        const exact = wordMatchScore('testing', 'testing');
        const caseVariant = wordMatchScore('testing', 'TESTING');
        const stemVariant = wordMatchScore('testing', 'test');
        const phoneticMatch = wordMatchScore('write', 'rite');
        const different = wordMatchScore('testing', 'banana');

        expect(exact).toBeGreaterThan(caseVariant);
        expect(caseVariant).toBeGreaterThan(stemVariant);
        expect(stemVariant).toBeGreaterThan(phoneticMatch);
        expect(phoneticMatch).toBeGreaterThan(different);
    });

    test('similar words should follow the hierarchy rules', () => {
        // Test with words that could match multiple categories
        const exact = wordMatchScore('writing', 'writing');
        const caseMatch = wordMatchScore('writing', 'WRITING');
        const stemMatch = wordMatchScore('writing', 'write');
        const soundMatch = wordMatchScore('writing', 'riting');

        expect(exact).toBeGreaterThan(caseMatch);
        expect(caseMatch).toBeGreaterThan(stemMatch);
        expect(stemMatch).toBeGreaterThan(soundMatch);
    });

    test('scores should be normalized between 0 and 1', () => {
        // Test various matches to ensure scores stay in range
        const scores = [
            wordMatchScore('hello', 'hello'),      // exact
            wordMatchScore('hello', 'HELLO'),      // case
            wordMatchScore('running', 'run'),      // stem
            wordMatchScore('phone', 'fone'),       // metaphone
            wordMatchScore('hello', 'world')       // no match
        ];

        scores.forEach(score => {
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });

    test('longer words should follow same hierarchy', () => {
        const exact = wordMatchScore('implementation', 'implementation');
        const caseMatch = wordMatchScore('implementation', 'IMPLEMENTATION');
        const stemMatch = wordMatchScore('implementation', 'implement');
        const phoneticMatch = wordMatchScore('implementation', 'implementashun');

        expect(exact).toBeGreaterThan(caseMatch);
        expect(caseMatch).toBeGreaterThan(stemMatch);
        expect(stemMatch).toBeGreaterThan(phoneticMatch);
    });
});

describe('phraseMatchScore function', () => {
    test('single word phrase should use metaphone matching', () => {
        const words = ['phone', 'test', 'hello'];
        const phrase = ['fone'];

        // Should match 'phone' at index 0
        expect(phraseMatchScore(words, phrase, 0)).toBe(0.5); // Metaphone match score
        // Should not match 'test' at index 1
        expect(phraseMatchScore(words, phrase, 1)).toBe(0);
    });

    test('multi-word phrase should consider subsequent words', () => {
        const phrase = ['write', 'some', 'code'];
        expect(phraseMatchScore(['write', 'some', 'code',   'today'], phrase, 0)).toBe(1.0);
        expect(phraseMatchScore(['write', 'sum',  'code',   'today'], phrase, 0)).toBeCloseTo(0.833);
        expect(phraseMatchScore(['rite',  'some', 'code',   'today'], phrase, 0)).toBeCloseTo(0.833);
        expect(phraseMatchScore(['rite',  'sum',  'code',   'today'], phrase, 0)).toBeCloseTo(0.666);
        expect(phraseMatchScore(['eat',   'my',   'shorts', 'today'], phrase, 0)).toBe(0.0);
    });

    test('phrase longer than remaining words should return lower score', () => {
        const words = ['write', 'some'];
        const phrase = ['rite', 'sum', 'code'];

        const score = phraseMatchScore(words, phrase, 0);
        expect(score).toBeLessThan(0.5); // Should be lower due to missing matches
    });

    test('no matches should return zero', () => {
        const words = ['hello', 'world'];
        const phrase = ['goodbye', 'earth'];

        expect(phraseMatchScore(words, phrase, 0)).toBe(0);
    });

    test('exact matches in multi-word phrase should score higher', () => {
        const words = ['hello', 'world', 'today'];
        const phrase = ['hello', 'world'];

        const score = phraseMatchScore(words, phrase, 0);
        expect(score).toBeGreaterThan(0.9); // Should be very high due to exact matches
    });
});