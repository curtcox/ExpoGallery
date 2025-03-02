import { localBot } from '../chat';

// npx jest services/__tests__/chat.test.tsx
jest.mock('@/utils/index', () => ({
  error: jest.fn(),
}));

describe('localBot', () => {

  test('responds with help message when message contains "help"', () => {
    const result = localBot('I need help with something');
    expect(result).toBe('How can I help you?');
  });

  test('responds with thank you message when message contains "thank"', () => {
    const result = localBot('Thank you for your assistance');
    expect(result).toBe("You're welcome! Is there anything else I can help with?");
  });

  test('responds with thank you message regardless of casing', () => {
    const result = localBot('THANK YOU very much');
    expect(result).toBe("You're welcome! Is there anything else I can help with?");
  });

  test('responds with default message for empty string', () => {
    const result = localBot('');
    expect(result).toBe('How can I help you?');
  });

  test('responds with first matching rule when multiple keywords match', () => {
    const result = localBot('Thank you for your help');
    expect(result).toBe("You're welcome! Is there anything else I can help with?");
  });
});