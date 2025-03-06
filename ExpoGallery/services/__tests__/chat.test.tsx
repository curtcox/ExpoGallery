import { localBot, ChatContext } from '../localBot';
import { defaultProfile } from '../../storage/profile';
import lincolnCounty from '../../assets/json/lincoln-county.json';
import stLouisCityCounty from '../../assets/json/st-louis-city-county.json';

// npx jest services/__tests__/chat.test.tsx
jest.mock('@/utils/index', () => ({
  error: jest.fn(),
}));

describe('localBot', () => {
  const mockContext: ChatContext = {
    timestamp: new Date(),
    userProfile: defaultProfile,
    resources: [...stLouisCityCounty.resources, ...lincolnCounty.resources]
  };

  test('Show shelter link when message contains a request for shelter', () => {
    const result = localBot('I need shelter', mockContext);
    expect(result).toContain('shelter');
    expect(result).toContain('Turning Point');
    expect(result).toContain('PO Box 426, Warrenton, MO 63383');
  });

  test('Show food link when message contains a request for food', () => {
    const result = localBot('I need food', mockContext);
    expect(result).toContain('food');
    expect(result).toContain('Bread of Life');
    expect(result).toContain('820 Cap-Au-Gris, Troy, MO 63379');
  });

  test('help message when message contains "help"', () => {
    const result = localBot('I need help with something', mockContext);
    expect(result).toContain('How can I help you');
  });

  test('thank you message when message contains "thank"', () => {
    const result = localBot('Thank you for your assistance', mockContext);
    expect(result).toContain("You're welcome");
  });

  test('thank you message regardless of casing', () => {
    const result = localBot('THANK YOU very much', mockContext);
    expect(result).toContain("You're welcome");
  });

  test('default message for empty string', () => {
    const result = localBot('', mockContext);
    expect(result).toContain('How can I help you');
  });

  test('responds with first matching rule when multiple keywords match', () => {
    const result = localBot('Thank you for your help', mockContext);
    expect(result).toContain("You're welcome");
  });

  test('includes user name in response when available', () => {
    const contextWithName = {
      ...mockContext,
      userProfile: {
        ...defaultProfile,
        name: 'John'
      }
    };
    const result = localBot('Thank you', contextWithName);
    expect(result).toContain('John');
  });

  test('provides nearest shelter when location matches Warrenton area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.9550,
        longitude: -90.7850 // Warrenton, MO coordinates
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('Turning Point');
    expect(result).toContain('PO Box 426, Warrenton, MO 63383');
  });

  test('provides nearest food bank when location matches Troy area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.9700,
        longitude: -90.7000 // Troy, MO coordinates
      }
    };
    const result = localBot('I need food', contextWithLocation);
    expect(result).toContain('Bread of Life');
    expect(result).toContain('820 Cap-Au-Gris, Troy, MO 63379');
  });

  test('provides St. Louis area shelter when location matches', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.6336,
        longitude: -90.1958 // Downtown St. Louis coordinates
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('St. Patrick Center');
    expect(result).toContain('800 N Tucker Blvd, St. Louis, MO 63101');
  });
});