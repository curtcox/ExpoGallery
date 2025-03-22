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
});