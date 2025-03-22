import { Eliza } from '../eliza';

describe('Eliza', () => {
    let eliza: Eliza;

    beforeEach(() => {
        // Use a fixed seed for deterministic tests
        eliza = new Eliza(12345);
    });

    describe('Basic Response Generation', () => {
        test('should match simple keywords and return deterministic responses', () => {
            const response = eliza.getResponse('hello').response;
            // With seed 12345, we know which response we'll get
            expect(response).toBe('Hey!');

            // Create a different instance with a different seed
            const eliza2 = new Eliza(54321);
            const response2 = eliza2.getResponse('hello').response;
            expect(response2).not.toBe(response); // Different seed should give different response
        });

        test('should handle equal priority keywords with deterministic output', () => {
            const response = eliza.getResponse('i am sad because of the weather').response;
            expect(response).toBe('How long have you been sad because of the weather?');
        });

        test('should handle decomposition with wildcards deterministically', () => {
            const response = eliza.getResponse('i am feeling happy').response;
            expect(response).toBe('How long have you been feeling happy?');
        });

        test('should return deterministic generic response when no keyword matches', () => {
            const response = eliza.getResponse('xyz').response;
            expect(response).toBe("Let's explore that further.");
        });
    });

    describe('Input Sanitization', () => {
        test('should handle uppercase input', () => {
            const response = eliza.getResponse('HELLO').response;
            expect(['Hi there!', 'Hello!', 'Hey!']).toContain(response);
        });

        test('should handle punctuation', () => {
            const response = eliza.getResponse('hello!!!').response;
            expect(['Hi there!', 'Hello!', 'Hey!']).toContain(response);
        });

        test('should handle extra whitespace', () => {
            const response = eliza.getResponse('   hello   ').response;
            expect(['Hi there!', 'Hello!', 'Hey!']).toContain(response);
        });
    });

    describe('Pattern Matching', () => {
        test('should match "i am" patterns correctly', () => {
            const responses = [
                eliza.getResponse('i am happy').response,
                eliza.getResponse('i am feeling sad').response,
                eliza.getResponse('i am a developer').response
            ];

            responses.forEach(response => {
                expect(response).toMatch(/Why do you say you are|How long have you been/);
            });
        });

        test('should match "because" patterns correctly', () => {
            const responses = [
                eliza.getResponse('because i want to').response,
                eliza.getResponse('i did it because of you').response,
                eliza.getResponse('because of the weather').response
            ];

            responses.forEach(response => {
                expect(response).toMatch(/And why do you think|Is that the real reason\?/);
            });
        });
    });

    describe('Response Consistency', () => {
        test('should maintain consistent wildcards in responses', () => {
            const input = 'i am feeling very happy today';
            const { response } = eliza.getResponse(input);
            expect(response).toBe('How long have you been feeling very happy today?');
        });

        test('should handle empty or whitespace input with deterministic responses', () => {
            const responses = [
                eliza.getResponse('').response,
                eliza.getResponse('   ').response,
                eliza.getResponse('\n\t').response
            ];

            // With seed 12345, we expect consistent responses
            expect(responses[0]).toBe("Let's explore that further.");
            expect(responses[1]).toBe("Let's explore that further.");
            expect(responses[2]).toBe("Let's explore that further.");
        });
    });

    describe('Seed Behavior', () => {
        test('should produce different but consistent results with different seeds', () => {
            const eliza1 = new Eliza(12345);
            const eliza2 = new Eliza(54321);
            const eliza3 = new Eliza(12345);

            const input = 'hello';
            const response1 = eliza1.getResponse(input).response;
            const response2 = eliza2.getResponse(input).response;
            const response3 = eliza3.getResponse(input).response;

            expect(response1).not.toBe(response2); // Different seeds should give different results
            expect(response1).toBe(response3); // Same seed should give same results
        });
    });

    describe('Alternative Responses', () => {
        test('should include alternative responses in details', () => {
            const { details } = eliza.getResponse('i am sad because i am lonely');

            // Verify we have alternative responses
            expect(details.alternativeResponses).toBeDefined();
            expect(details.alternativeResponses!.length).toBeGreaterThan(0);

            // Get all matched keywords (primary and alternatives)
            const primaryKeyword = details.matchedKeywords[0].word;
            const alternativeKeywords = details.alternativeResponses!.map(alt => alt.keyword);
            const allKeywords = [primaryKeyword, ...alternativeKeywords];

            // Verify that either:
            // 1. Both "because" and "i am" are in alternatives (if neither is primary), or
            // 2. At least one is in alternatives and the other is the primary response
            expect(
                // Case 1: Both in alternatives
                (alternativeKeywords.includes('because') && alternativeKeywords.includes('i am')) ||
                // Case 2a: One primary, one alternative
                (primaryKeyword === 'i am' && alternativeKeywords.includes('because')) ||
                // Case 2b: Other primary, other alternative
                (primaryKeyword === 'because' && alternativeKeywords.includes('i am'))
            ).toBe(true);

            // Verify that both keywords are matched somewhere (either primary or alternative)
            expect(allKeywords).toContain('because');
            expect(allKeywords).toContain('i am');

            // Verify structure of alternative responses
            details.alternativeResponses!.forEach(alt => {
                expect(alt).toHaveProperty('keyword');
                expect(alt).toHaveProperty('priority');
                expect(alt).toHaveProperty('possibleResponses');
                expect(Array.isArray(alt.possibleResponses)).toBe(true);
                expect(alt.possibleResponses.length).toBeGreaterThan(0);
            });
        });

        test('should order alternative responses by priority', () => {
            const { details } = eliza.getResponse('i am sad because i am lonely');

            // Verify priorities are in descending order
            const priorities = details.alternativeResponses!.map(alt => alt.priority);
            const sortedPriorities = [...priorities].sort((a, b) => b - a);
            expect(priorities).toEqual(sortedPriorities);
        });

        test('should include pattern information when available', () => {
            const { details } = eliza.getResponse('i am feeling very sad');

            // Find the "i am" alternative (if it wasn't the main response)
            const iAmAlt = details.alternativeResponses?.find(alt => alt.keyword === 'i am');

            if (iAmAlt) {
                expect(iAmAlt.pattern).toBeDefined();
                expect(iAmAlt.pattern).toContain('*'); // Should contain wildcard
            }
        });

        test('should exclude the primary matched keyword from alternatives', () => {
            const { details } = eliza.getResponse('i am sad');

            // The keyword that was used for the main response should not appear in alternatives
            const mainKeyword = details.matchedKeywords[0].word;
            const alternativeKeywords = details.alternativeResponses!.map(alt => alt.keyword);

            expect(alternativeKeywords).not.toContain(mainKeyword);
        });

        test('should handle generic responses with no alternatives', () => {
            const { details } = eliza.getResponse('xyzabc');

            expect(details.isGenericResponse).toBe(true);
            expect(details.alternativeResponses).toBeUndefined();
        });
    });
});