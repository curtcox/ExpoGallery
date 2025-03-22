import { elizaKeywords } from '../keywords';

describe('ELIZA Keywords', () => {
  // Helper function to find a keyword entry
  const findKeyword = (key: string) => elizaKeywords.find(([keyword]) => keyword === key);

  // Helper function to simulate ELIZA's response selection with a fixed seed
  const getResponse = (keyword: string, input: string, seed = 0): string | undefined => {
    const entry = findKeyword(keyword);
    if (!entry) return undefined;

    const [, , patterns] = entry;

    // Find matching pattern
    for (const [pattern, responses] of patterns) {
      if (pattern === '*' || input.includes(pattern.replace(/\*/g, ''))) {
        // Use seed to deterministically select response
        const index = seed % responses.length;
        let response = responses[index];

        // Replace capture groups if any
        if (pattern !== '*' && pattern.includes('*')) {
          const parts = input.split(pattern.replace(/\*/g, ''));
          for (let i = 0; i < parts.length; i++) {
            response = response.replace(`(${i + 1})`, parts[i].trim());
          }
        }

        return response;
      }
    }
    return undefined;
  };

  test('sorry keyword responses', () => {
    const keyword = findKeyword('sorry');
    expect(keyword).toBeDefined();
    expect(getResponse('sorry', "I'm sorry", 0)).toBe("Please don't apologize.");
    expect(getResponse('sorry', "I'm sorry", 1)).toBe("Apologies are not necessary.");
  });

  test('remember keyword responses', () => {
    const keyword = findKeyword('remember');
    expect(keyword).toBeDefined();
    expect(getResponse('remember', "I remember my childhood", 0))
      .toBe("Do you often think of my childhood ?");
    expect(getResponse('remember', "Do you remember what I told you?", 0))
      .toBe("Did you think I would forget what I told you ?");
  });

  test('forget keyword responses', () => {
    const keyword = findKeyword('forget');
    expect(keyword).toBeDefined();
    expect(getResponse('forget', "I forget my keys sometimes", 0))
      .toBe("Can you think of why you might forget my keys ?");
  });

  test('if keyword responses', () => {
    const keyword = findKeyword('if');
    expect(keyword).toBeDefined();
    expect(getResponse('if', "What if I fail?", 0))
      .toBe("Do you think it's likely that I fail ?");
  });

  test('dream keyword responses', () => {
    const keyword = findKeyword('dream');
    expect(keyword).toBeDefined();
    expect(getResponse('dream', "I had a dream", 0))
      .toBe("What does that dream suggest to you ?");
  });

  test('perhaps keyword responses', () => {
    const keyword = findKeyword('perhaps');
    expect(keyword).toBeDefined();
    expect(getResponse('perhaps', "Perhaps I should leave", 0))
      .toBe("You don't seem quite certain.");
  });

  test('name keyword responses', () => {
    const keyword = findKeyword('name');
    expect(keyword).toBeDefined();
    expect(getResponse('name', "My name is John", 0))
      .toBe("I am not interested in names.");
  });

  test('computer keyword responses', () => {
    const keyword = findKeyword('computer');
    expect(keyword).toBeDefined();
    expect(getResponse('computer', "Are you a computer?", 0))
      .toBe("Do computers worry you ?");
  });

  test('am keyword responses', () => {
    const keyword = findKeyword('am');
    expect(keyword).toBeDefined();
    expect(getResponse('am', "Am I going crazy?", 0))
      .toBe("Do you believe you are going crazy ?");
  });

  test('are keyword responses', () => {
    const keyword = findKeyword('are');
    expect(keyword).toBeDefined();
    expect(getResponse('are', "Are you real?", 0))
      .toBe("Why are you interested in whether I am real or not ?");
  });

  test('your keyword responses', () => {
    const keyword = findKeyword('your');
    expect(keyword).toBeDefined();
    expect(getResponse('your', "Your responses are mechanical", 0))
      .toBe("Why are you concerned over my responses ?");
  });

  test('was keyword responses', () => {
    const keyword = findKeyword('was');
    expect(keyword).toBeDefined();
    expect(getResponse('was', "I was happy", 0))
      .toBe("Were you really ?");
  });

  test('i keyword responses', () => {
    const keyword = findKeyword('i');
    expect(keyword).toBeDefined();
    expect(getResponse('i', "I am sad", 0))
      .toBe("Is it because you are sad that you came to me ?");
    expect(getResponse('i', "I desire success", 0))
      .toBe("What would it mean to you if you got success ?");
  });

  test('you keyword responses', () => {
    const keyword = findKeyword('you');
    expect(keyword).toBeDefined();
    expect(getResponse('you', "You remind me of my father", 0))
      .toBe("In what way ?");
  });

  test('yes keyword responses', () => {
    const keyword = findKeyword('yes');
    expect(keyword).toBeDefined();
    expect(getResponse('yes', "Yes, that's correct", 0))
      .toBe("You seem to be quite positive.");
  });

  test('no keyword responses', () => {
    const keyword = findKeyword('no');
    expect(keyword).toBeDefined();
    expect(getResponse('no', "No one understands me", 0))
      .toBe("Are you sure, no one understands ?");
  });

  test('my keyword responses', () => {
    const keyword = findKeyword('my');
    expect(keyword).toBeDefined();
    expect(getResponse('my', "My life is a mess", 0))
      .toBe("Does that have anything to do with the fact that your life ?");
  });

  test('can keyword responses', () => {
    const keyword = findKeyword('can');
    expect(keyword).toBeDefined();
    expect(getResponse('can', "Can you help me?", 0))
      .toBe("You believe I can help don't you ?");
  });

  test('what keyword responses', () => {
    const keyword = findKeyword('what');
    expect(keyword).toBeDefined();
    expect(getResponse('what', "What should I do?", 0))
      .toBe("Why do you ask ?");
  });

  test('because keyword responses', () => {
    const keyword = findKeyword('because');
    expect(keyword).toBeDefined();
    expect(getResponse('because', "Because I said so", 0))
      .toBe("Is that the real reason ?");
  });

  test('why keyword responses', () => {
    const keyword = findKeyword('why');
    expect(keyword).toBeDefined();
    expect(getResponse('why', "Why don't you understand?", 0))
      .toBe("Do you believe I don't understand ?");
  });

  test('everyone keyword responses', () => {
    const keyword = findKeyword('everyone');
    expect(keyword).toBeDefined();
    expect(getResponse('everyone', "Everyone hates me", 0))
      .toBe("Really, hates me ?");
  });

  test('always keyword responses', () => {
    const keyword = findKeyword('always');
    expect(keyword).toBeDefined();
    expect(getResponse('always', "You always say that", 0))
      .toBe("Can you think of a specific example ?");
  });

  test('like keyword responses', () => {
    const keyword = findKeyword('like');
    expect(keyword).toBeDefined();
    expect(getResponse('like', "She is like my mother", 0))
      .toBe("In what way ?");
  });

  test('different keyword responses', () => {
    const keyword = findKeyword('different');
    expect(keyword).toBeDefined();
    expect(getResponse('different', "This feels different", 0))
      .toBe("How is it different ?");
  });
});