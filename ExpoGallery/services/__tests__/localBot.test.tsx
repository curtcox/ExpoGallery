import { localBot, ChatContext } from '../localBot';
import { defaultProfile } from '../../storage/profile';
import lincolnCounty from '../../assets/json/lincoln-county.json';
import stLouisCityCounty from '../../assets/json/st-louis-city-county.json';
import santaClaraCounty from '../../assets/json/santa-clara-county.json';

// npx jest services/__tests__/localBot.test.tsx
jest.mock('@/utils/index', () => ({
  error: jest.fn(),
}));

describe('localBot', () => {
  const mockContext: ChatContext = {
    timestamp: new Date(),
    userProfile: defaultProfile,
    resources: [...stLouisCityCounty.resources, ...lincolnCounty.resources, ...santaClaraCounty.resources]
  };

  test('Show shelter link when message contains a request for shelter', () => {
    const result = localBot('I need shelter', mockContext);
    expect(result).toContain('shelter');
  });

  test('Show food link when message contains a request for food', () => {
    const result = localBot('I need food', mockContext);
    expect(result).toContain('food');
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

  // New tests for location-based resource proximity

  test('provides Gateway 180 as the closest shelter for North St. Louis', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.6378,
        longitude: -90.2049 // North St. Louis coordinates
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('Gateway 180');
    expect(result).toContain('1000 N 19th St, St. Louis, MO 63106');
  });

  test('provides Biddle Housing as the closest shelter for North 13th St area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.637,
        longitude: -90.1965 // Near Biddle House
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('Biddle Housing Opportunities Center');
    expect(result).toContain('1212 N 13th St, St. Louis, MO 63106');
  });

  test('provides Peter & Paul Community Services as closest shelter for South St. Louis', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.5968,
        longitude: -90.2252 // South St. Louis
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('Peter & Paul Community Services');
    expect(result).toContain('2612 Wyoming St, St. Louis, MO 63118');
  });

  test('provides Salvation Army as closest shelter for Page Ave area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.692,
        longitude: -90.399 // Page Ave area
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('Salvation Army Family Haven');
    expect(result).toContain('10740 Page Ave, St. Louis, MO 63132');
  });

  test('provides Harvey Kornblum as closest food resource for Baur Blvd area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.686,
        longitude: -90.395 // Near Baur Blvd
      }
    };
    const result = localBot('I need food', contextWithLocation);
    expect(result).toContain('Harvey Kornblum Jewish Food Pantry');
    expect(result).toContain('10601 Baur Blvd, St. Louis, MO 63132');
  });

  test('provides St. Augustine Wellston Center as closest food resource for Wellston area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.678,
        longitude: -90.285 // Wellston area
      }
    };
    const result = localBot('I need food', contextWithLocation);
    expect(result).toContain('St. Augustine Wellston Center');
    expect(result).toContain('1705 Kienlen Ave, St. Louis, MO 63133');
  });

  test('provides Guardian Angel Settlement as closest food resource for South Jefferson area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.597,
        longitude: -90.225 // South Jefferson area
      }
    };
    const result = localBot('I need food', contextWithLocation);
    expect(result).toContain('Guardian Angel Settlement Association');
    expect(result).toContain('3300 S Jefferson Ave, St. Louis, MO 63118');
  });

  test('provides Trinity Episcopal Church as closest food resource for Central West End', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.650,
        longitude: -90.261 // Central West End
      }
    };
    const result = localBot('I need food', contextWithLocation);
    expect(result).toContain('Trinity Episcopal Church');
    expect(result).toContain('600 N Euclid Ave, St. Louis, MO 63108');
  });

  test('provides Carondelet St. Joseph Outreach as closest food resource for South City', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.563,
        longitude: -90.250 // South City area
      }
    };
    const result = localBot('I need food', contextWithLocation);
    expect(result).toContain('Carondelet St. Joseph Outreach');
    expect(result).toContain('6408 Michigan Ave, St. Louis, MO 63111');
  });

  test('provides resources for different phrasings of food requests', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.686,
        longitude: -90.395 // Near Harvey Kornblum
      }
    };

    // Test various ways to ask for food
    const result1 = localBot('I am hungry', contextWithLocation);
    expect(result1).toContain('Harvey Kornblum Jewish Food Pantry');

    const result2 = localBot('Where can I get a meal?', contextWithLocation);
    expect(result2).toContain('Harvey Kornblum Jewish Food Pantry');

    const result3 = localBot('Need food assistance', contextWithLocation);
    expect(result3).toContain('Harvey Kornblum Jewish Food Pantry');
  });

  test('provides resources for different phrasings of shelter requests', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 38.637,
        longitude: -90.196 // Near Biddle House
      }
    };

    // Test various ways to ask for shelter
    const result1 = localBot('I need a place to stay', contextWithLocation);
    expect(result1).toContain('Biddle Housing Opportunities Center');

    const result2 = localBot('Where can I sleep tonight?', contextWithLocation);
    expect(result2).toContain('Biddle Housing Opportunities Center');

    const result3 = localBot('Need shelter assistance', contextWithLocation);
    expect(result3).toContain('Biddle Housing Opportunities Center');
  });

  // Santa Clara County tests

  test('provides HomeFirst Sobrato House as closest shelter in downtown San Jose', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.330,
        longitude: -121.883 // Downtown San Jose coordinates
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('HomeFirst - Sobrato House Youth Center');
    expect(result).toContain('496 S Third St, San Jose, CA 95112');
  });

  test('provides LifeMoves Julian Street Inn as closest shelter in Julian St area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.336,
        longitude: -121.903 // Near Julian Street
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('LifeMoves | Julian Street Inn');
    expect(result).toContain('546 W Julian St, San Jose, CA 95110');
  });

  test('provides LifeMoves Montgomery Street Inn as closest shelter in Montgomery St area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.338,
        longitude: -121.904 // Near Montgomery Street
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('LifeMoves | Montgomery Street Inn');
    expect(result).toContain('358 N Montgomery St, San Jose, CA 95110');
  });

  test('provides Salvation Army as closest shelter in North San Jose', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.345,
        longitude: -121.892 // North San Jose area
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('The Salvation Army');
    expect(result).toContain('405 N 4th St, San Jose, CA 95112');
  });

  test('provides United States Mission as closest shelter in South San Jose area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.332,
        longitude: -121.881 // South San Jose area
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('United States Mission');
    expect(result).toContain('420 S 5th St, San Jose, CA 95112');
  });

  test('provides Bill Wilson Drop-in Center as closest shelter for youth in Second St area', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.327,
        longitude: -121.882 // Second Street area
      }
    };
    const result = localBot('I need shelter', contextWithLocation);
    expect(result).toContain('Bill Wilson Drop-in Center');
    expect(result).toContain('693 S Second St, San Jose, CA 95112');
  });

  test('provides Front Door Communities as closest food resource in downtown San Jose', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.338,
        longitude: -121.890 // Downtown San Jose - 2nd Street area
      }
    };
    const result = localBot('I need food', contextWithLocation);
    expect(result).toContain('Front Door Communities');
    expect(result).toContain('81 N 2nd St, San Jose, CA 95113');
  });

  test('provides different resources based on different keywords in the same location', () => {
    const contextWithLocation = {
      ...mockContext,
      location: {
        latitude: 37.338,
        longitude: -121.890 // Downtown San Jose area
      }
    };

    // Food request should return Front Door Communities
    const foodResult = localBot('I need food', contextWithLocation);
    expect(foodResult).toContain('Front Door Communities');

    // Shelter request from same location should return different resource
    const shelterResult = localBot('I need shelter', contextWithLocation);
    expect(shelterResult).toContain('Womens Gather Place');
  });
});