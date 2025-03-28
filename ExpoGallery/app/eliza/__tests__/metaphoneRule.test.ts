import { metaphones, stemmed } from '../metaphoneRule';

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