import { classify, classificationMap } from '../classifier';

describe('resource matcher with default rules', () => {
    const rules: classificationMap = {
        computer: {
            pattern: /\b(computer|cpu|ram|disk|memory|processor|storage|hardware)\b/,
            classification: 'computer'
        },
        human: {
            pattern: /\b(tired|energy|sleep|exhausted|fatigue|rest|strength)\b/,
            classification: 'human'
        },
        financial: {
            pattern: /\b(money|budget|savings|cost|financial|expensive|price|afford)\b/,
            classification: 'financial'
        },
        time: {
            pattern: /\b(time|hours|schedule|deadline|duration)\b/,
            classification: 'time'
        }
    };

    test('should classify text about computer resources correctly', () => {
        const computerTexts = [
            'My computer is running slow',
            'I need more RAM',
            'The CPU usage is high',
            'My disk space is running low'
        ];

        computerTexts.forEach(text => {
            expect(classify(text, rules)).toBe('computer');
        });
    });

    test('should classify text about human resources correctly', () => {
        const humanTexts = [
            'I feel tired today',
            'My energy levels are low',
            'I need more sleep',
            'I am exhausted from work'
        ];

        humanTexts.forEach(text => {
            expect(classify(text, rules)).toBe('human');
        });
    });

    test('should classify text about financial resources correctly', () => {
        const financialTexts = [
            'I need more money',
            'My budget is tight',
            'Running out of savings',
            'The cost is too high'
        ];

        financialTexts.forEach(text => {
            expect(classify(text, rules)).toBe('financial');
        });
    });

    test('should classify text about time resources correctly', () => {
        const timeTexts = [
            'I dont have enough time',
            'Running out of time',
            'Need more hours in the day',
            'Time is limited'
        ];

        timeTexts.forEach(text => {
            expect(classify(text, rules)).toBe('time');
        });
    });

    test('should return "unknown" for unclassifiable text', () => {
        const unknownTexts = [
            'Hello world',
            'The weather is nice today',
            'I like pizza',
            'Random text with no resource context'
        ];

        unknownTexts.forEach(text => {
            expect(classify(text, rules)).toBe('unknown');
        });
    });

    test('should handle empty strings and whitespace', () => {
        expect(classify('', rules)).toBe('unknown');
        expect(classify('   ', rules)).toBe('unknown');
    });

    test('should be case insensitive', () => {
        expect(classify('MY COMPUTER IS SLOW', rules)).toBe('computer');
        expect(classify('i need more Money', rules)).toBe('financial');
    });
});

describe('weather matcher with custom rules', () => {
    const customRules: classificationMap = {
        food: {
            pattern: /\b(hungry|food|eat|meal|snack|dinner|lunch|breakfast)\b/,
            classification: 'nutrition'
        },
        weather: {
            pattern: /\b(rain|sun|snow|wind|storm|temperature|weather)\b/,
            classification: 'weather'
        }
    };

    test('should classify text using custom rules', () => {
        expect(classify('I am hungry', customRules)).toBe('nutrition');
        expect(classify('It might rain today', customRules)).toBe('weather');
        expect(classify('I need more RAM', customRules)).toBe('unknown');
    });

    test('should handle empty custom rules', () => {
        expect(classify('any text', {})).toBe('unknown');
    });

    test('should be case insensitive with custom rules', () => {
        expect(classify('FEELING HUNGRY', customRules)).toBe('nutrition');
        expect(classify('The WEATHER is nice', customRules)).toBe('weather');
    });
});

describe('assistance resource matcher with custom rules', () => {
    const assistanceRules: classificationMap = {
        food: {
            pattern: /\b(food|hungry|meal|eat|soup kitchen|meals|snack)\b/,
            classification: 'food'
        },
        shelter: {
            pattern: /\b(shelter|sleep|overnight|housing|store belongings|night shelter)\b/,
            classification: 'shelter'
        },
        medicine: {
            pattern: /\b(sick|clinic|medical|health|injury|dental|treatment|rehab)\b/,
            classification: 'medicine'
        },
        legal: {
            pattern: /\b(ID|legal|rights|forms|application|crime|report|lawyer|law|attorney|judge|court|jail|prison)\b/i,
            classification: 'legal',
            priority: 2
        },
        employment: {
            pattern: /\b(job|work|employment|training|placement)\b/,
            classification: 'employment'
        },
        hygiene: {
            pattern: /\b(shower|clean|clothes|grooming|haircut)\b/,
            classification: 'hygiene'
        },
        benefits: {
            pattern: /\b(benefits|government|assistance programs)\b/,
            classification: 'benefits'
        },
        mental: {
            pattern: /\b(mental|counseling|down|support)\b/,
            classification: 'mental',
            priority: 1
        },
        transportation: {
            pattern: /\b(transportation|transit|schedules)\b/,
            classification: 'transportation'
        },
        facility: {
            pattern: /\b(library|computer|facility)\b/,
            classification: 'facility'
        },
        social: {
            pattern: /\b(family|isolated|contact|social)\b/,
            classification: 'social'
        },
        clothing: {
            pattern: /\b(clothing|warm clothes)\b/,
            classification: 'clothing'
        },
        utility: {
            pattern: /\b(charge|phone|charger)\b/,
            classification: 'utility'
        },
        security: {
            pattern: /\b(safely|secure|mail|packages|bike)\b/,
            classification: 'security'
        }
    };

    const testClassification = (text: string, expectedClass: string) => {
        const result = classify(text, assistanceRules);
        if (result !== expectedClass) {
            const rule = assistanceRules[expectedClass];
            const matchedRule = result !== 'unknown' ? assistanceRules[result] : null;
            throw new Error(
                `Classification failed:\nText: "${text}"\nExpected: "${expectedClass}"\nGot: "${result}"\nExpected to match pattern: ${rule.pattern}${matchedRule ? `\nMatched pattern: ${matchedRule.pattern}` : ''}`
            );
        }
    };

    test('should classify food-related assistance requests', () => {
        const foodTexts = [
            "I'm really hungry—are there any food assistance programs nearby?",
            "Where can I get a warm meal today?",
            "Where can I find a free soup kitchen that's open now?",
            "Do you know of any outreach programs that distribute food regularly?",
            "Are there any community meals being served today?"
        ];

        foodTexts.forEach(text => testClassification(text, 'food'));
    });

    test('should classify shelter-related assistance requests', () => {
        const shelterTexts = [
            "Can anyone point me to a safe place to sleep tonight?",
            "Is there a shelter nearby that welcomes pets?",
            "I need somewhere safe to store my belongings overnight.",
            "Can someone tell me if there's a night shelter open in this area?",
            "What are the operating hours of the nearest shelter?",
            "Where can I find a shelter that allows for storing personal belongings safely?"
        ];

        shelterTexts.forEach(text => testClassification(text, 'shelter'));
    });

    test('should classify medical assistance requests', () => {
        const medicalTexts = [
            "I'm feeling really sick; is there a free clinic in the area?",
            "I have a sprained ankle; is there a place for free medical help?",
            "Can someone direct me to a free dental clinic?",
            "I'm having trouble with substance abuse; is there a rehab center nearby?",
            "I have a minor injury and no money for treatment—any ideas for free care?"
        ];

        medicalTexts.forEach(text => testClassification(text, 'medicine'));
    });

    test('should classify legal assistance requests', () => {
        const legalTexts = [
            "I lost my wallet; can someone help me replace my ID?",
            "Can someone help me understand my rights as a tenant or street resident?",
            "I need a lawyer to help with my housing application, can anyone guide me?",
            "I need legal help with filling out forms to apply for housing—can someone assist?",
        ];

        legalTexts.forEach(text => testClassification(text, 'legal'));
    });

    test('should classify employment assistance requests', () => {
        const employmentTexts = [
            "Are there any temporary job opportunities available right now?",
            "Are there any programs that offer job training or work placement?",
            "I'm looking for a part-time job; any leads on work nearby?",
            "I'm trying to get back on my feet—are there any programs that assist with job placement?"
        ];

        employmentTexts.forEach(text => testClassification(text, 'employment'));
    });

    test('should classify hygiene assistance requests', () => {
        const hygieneTexts = [
            "I need a shower and some clean clothes—any ideas where I can go?",
            "Where can I go for a free hair cut or grooming services?"
        ];

        hygieneTexts.forEach(text => testClassification(text, 'hygiene'));
    });

    test('should classify mental health assistance requests', () => {
        const mentalTexts = [
            "I'm feeling really down—can I speak to someone about mental health support?",
            "Is there a clinic that offers mental health counseling without a fee?"
        ];

        mentalTexts.forEach(text => testClassification(text, 'mental'));
    });

    test('should classify transportation assistance requests', () => {
        const transportationTexts = [
            "I'm looking for information on local transportation schedules—any help?",
            "I'm having difficulty navigating public transit—can someone help?"
        ];

        transportationTexts.forEach(text => testClassification(text, 'transportation'));
    });

    test('should classify utility assistance requests', () => {
        const utilityTexts = [
            "Where can I charge my phone without paying?",
            "I lost my phone charger—can anyone recommend a place to get one for free?"
        ];

        utilityTexts.forEach(text => testClassification(text, 'utility'));
    });

    test('should classify security assistance requests', () => {
        const securityTexts = [
            "I need assistance with getting my mail or packages collected safely.",
            "I need to find a place where I can safely leave my bike."
        ];

        securityTexts.forEach(text => testClassification(text, 'security'));
    });
});

describe('priority-based classification', () => {
    const priorityRules: classificationMap = {
        highPriority: {
            pattern: /\b(test|testing)\b/,
            classification: 'high',
            priority: 2
        },
        mediumPriority: {
            pattern: /\b(test|testing)\b/,
            classification: 'medium',
            priority: 1
        },
        lowPriority: {
            pattern: /\b(test|testing)\b/,
            classification: 'low',
            priority: 0
        },
        defaultPriority: {
            pattern: /\b(test|testing)\b/,
            classification: 'default'
            // No priority specified - should default to 0
        }
    };

    test('should choose highest priority rule when multiple patterns match', () => {
        expect(classify('testing 123', priorityRules)).toBe('high');
    });

    test('should handle rules with same priority correctly', () => {
        const equalPriorityRules: classificationMap = {
            first: {
                pattern: /\b(test)\b/,
                classification: 'first',
                priority: 1
            },
            second: {
                pattern: /\b(test)\b/,
                classification: 'first',
                priority: 1
            }
        };
        // When priorities are equal, the first matching rule in iteration order should win
        expect(classify('test', equalPriorityRules)).toBe('first');
    });

    test('should handle missing priority as 0', () => {
        const mixedRules: classificationMap = {
            withPriority: {
                pattern: /\b(test)\b/,
                classification: 'priority',
                priority: 1
            },
            withoutPriority: {
                pattern: /\b(test)\b/,
                classification: 'no-priority'
                // No priority specified - should default to 0
            }
        };
        expect(classify('test', mixedRules)).toBe('priority');
    });
});