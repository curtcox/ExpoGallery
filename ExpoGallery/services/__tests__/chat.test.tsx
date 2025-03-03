import { localBot } from '../chat';

// npx jest services/__tests__/chat.test.tsx
jest.mock('@/utils/index', () => ({
  error: jest.fn(),
}));

describe('localBot', () => {

  test('Show shelter link when message contains a request for shelter', () => {
    const shelter_response = 'It sounds like you need a place to stay. Tap here for more information on Turning Point which is a shelter in your area. /9yzmw5s3k4';
    expect(localBot('I need shelter')).toBe(shelter_response);
    expect(localBot('I need a place to stay')).toBe(shelter_response);
    expect(localBot('I need someplace to sleep')).toBe(shelter_response);
  });

  test('Show food link when message contains a request for food', () => {
    const food_response = 'It sounds like you need some food. Tap here for more information on Bread of Life which distributes food in your area. /9yzt8n628y';
    expect(localBot('I need food')).toBe(food_response);
    expect(localBot('I need something to eat')).toBe(food_response);
    expect(localBot('I need some food')).toBe(food_response);
    expect(localBot('I am hungry')).toBe(food_response);
  });

  test('help message when message contains "help"', () => {
    const result = localBot('I need help with something');
    expect(result).toBe('How can I help you?');
  });

  test('thank you message when message contains "thank"', () => {
    const result = localBot('Thank you for your assistance');
    expect(result).toBe("You're welcome! Is there anything else I can help with?");
  });

  test('thank you message regardless of casing', () => {
    const result = localBot('THANK YOU very much');
    expect(result).toBe("You're welcome! Is there anything else I can help with?");
  });

  test('default message for empty string', () => {
    const result = localBot('');
    expect(result).toBe('How can I help you?');
  });

  test('responds with first matching rule when multiple keywords match', () => {
    const result = localBot('Thank you for your help');
    expect(result).toBe("You're welcome! Is there anything else I can help with?");
  });
});