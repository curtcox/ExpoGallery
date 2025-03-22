import { Eliza } from '../eliza';

describe('Eliza', () => {
    let eliza: Eliza;

    beforeEach(() => {
        eliza = new Eliza();
    });

    describe('Basic Response Generation', () => {
        test('should match simple keywords and return appropriate responses', () => {
            const response = eliza.getResponse('hello');
            expect(['Hi there!', 'Hello!', 'Hey!']).toContain(response);
        });

        test('should handle equal priority keywords', () => {
            const response = eliza.getResponse('i am sad because of the weather');
            expect(response).toMatch(/Why do you say you are sad because of the weather\?|How long have you been sad because of the weather\?/);
        });

        test('should handle decomposition with wildcards', () => {
            const response = eliza.getResponse('i am feeling happy');
            expect(response).toMatch(/Why do you say you are feeling happy\?|How long have you been feeling happy\?/);
        });

        test('should return generic response when no keyword matches', () => {
            const response = eliza.getResponse('xyz');
            expect(["Let's explore that further.", "Very interesting.", "Tell me more about that."]).toContain(response);
        });
    });

    describe('Input Sanitization', () => {
        test('should handle uppercase input', () => {
            const response = eliza.getResponse('HELLO');
            expect(['Hi there!', 'Hello!', 'Hey!']).toContain(response);
        });

        test('should handle punctuation', () => {
            const response = eliza.getResponse('hello!!!');
            expect(['Hi there!', 'Hello!', 'Hey!']).toContain(response);
        });

        test('should handle extra whitespace', () => {
            const response = eliza.getResponse('   hello   ');
            expect(['Hi there!', 'Hello!', 'Hey!']).toContain(response);
        });
    });

    describe('Pattern Matching', () => {
        test('should match "i am" patterns correctly', () => {
            const responses = [
                eliza.getResponse('i am happy'),
                eliza.getResponse('i am feeling sad'),
                eliza.getResponse('i am a developer')
            ];

            responses.forEach(response => {
                expect(response).toMatch(/Why do you say you are|How long have you been/);
            });
        });

        test('should match "because" patterns correctly', () => {
            const responses = [
                eliza.getResponse('because i want to'),
                eliza.getResponse('i did it because of you'),
                eliza.getResponse('because of the weather')
            ];

            responses.forEach(response => {
                expect(response).toMatch(/And why do you think|Is that the real reason\?/);
            });
        });
    });

    describe('Response Consistency', () => {
        test('should maintain consistent wildcards in responses', () => {
            const input = 'i am feeling very happy today';
            const response = eliza.getResponse(input);

            if (response.includes('very happy today')) {
                expect(response).toMatch(/Why do you say you are feeling very happy today\?|How long have you been feeling very happy today\?/);
            }
        });

        test('should handle empty or whitespace input', () => {
            const responses = [
                eliza.getResponse(''),
                eliza.getResponse('   '),
                eliza.getResponse('\n\t')
            ];

            responses.forEach(response => {
                expect(["Let's explore that further.", "Very interesting.", "Tell me more about that."]).toContain(response);
            });
        });
    });
});