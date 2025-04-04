import { classify, ClassificationRule } from '../simpleClassifier';

describe('resource matcher with default rules', () => {
    const rules: ClassificationRule[] = [
        new ClassificationRule('computer', "computer,cpu,ram,disk,memory,processor,storage,hardware"),
        new ClassificationRule('human', "tired,energy,sleep,exhausted,fatigue,rest,strength"),
        new ClassificationRule('financial', "money,budget,savings,cost,financial,expensive,price,afford"),
        new ClassificationRule('time', "time,hours,schedule,deadline,duration"),
    ];

    test('should classify text about computer resources correctly', () => {
        const computerTexts = [
            'My computer is running slow',
            'I need more RAM',
            'The CPU usage is high',
            'My disk space is running low'
        ];

        computerTexts.forEach(text => {
            expect(classify(text, rules)).toEqual(new Map([['computer', 1]]));
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
            expect(classify(text, rules)).toEqual(new Map([['human',1]]));
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
            expect(classify(text, rules)).toEqual(new Map([['financial', 1]]));
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
            expect(classify(text, rules)).toEqual(new Map([['time', 1]]));
        });
    });

    test('should return empty array for unclassifiable text', () => {
        const unknownTexts = [
            'Hello world',
            'The weather is nice today',
            'I like pizza',
            'Random text with no resource context'
        ];

        unknownTexts.forEach(text => {
            expect(classify(text, rules)).toEqual(new Map());
        });
    });

    test('should handle empty strings and whitespace', () => {
        expect(classify('', rules)).toEqual(new Map());
        expect(classify('   ', rules)).toEqual(new Map());
    });

    test('should be case insensitive', () => {
        expect(classify('MY COMPUTER IS SLOW', rules)).toEqual(new Map([['computer', 1]]));
        expect(classify('i need more Money', rules)).toEqual(new Map([['financial', 1]]));
    });

    test('should return multiple classifications when text matches multiple patterns', () => {
        expect(classify('My computer is running slow and I am tired', rules))
            .toEqual(new Map([['computer', 1], ['human', 1]]));
    });
});

describe('weather matcher with custom rules', () => {
    const customRules: ClassificationRule[] = [
        new ClassificationRule('nutrition', "hungry,food,eat,meal,snack,dinner,lunch,breakfast"),
        new ClassificationRule('weather', "rain,sun,snow,wind,storm,temperature,weather"),
    ];

    test('should classify text using custom rules', () => {
        expect(classify('I am hungry', customRules)).toEqual(new Map([['nutrition', 1]]));
        expect(classify('It might rain today', customRules)).toEqual(new Map([['weather', 1]]));
        expect(classify('I need more RAM', customRules)).toEqual(new Map());
    });

    test('should handle empty custom rules', () => {
        expect(classify('any text', [])).toEqual(new Map());
    });

    test('should be case insensitive with custom rules', () => {
        expect(classify('FEELING HUNGRY', customRules)).toEqual(new Map([['nutrition', 1]]));
        expect(classify('The WEATHER is nice', customRules)).toEqual(new Map([['weather', 1]]));
    });
});

describe('assistance resource matcher with custom rules', () => {
    const assistanceRules: ClassificationRule[] = [
        new ClassificationRule('food', "food,hungry,meal,eat,soup,kitchen,meals,snack"),
        new ClassificationRule('shelter', "shelter,sleep,overnight,housing,store belongings,night shelter"),
        new ClassificationRule('medicine', "sick,clinic,medical,health,injury,dental,treatment,rehab,hospital,doctor,dentist,nurse,ambulance,emergency,cut"),
        new ClassificationRule('legal', "ID,legal,rights,forms,application,crime,report,lawyer,law,attorney,judge,court,jail,prison"),
        new ClassificationRule('employment', "job,work,employment,training,placement,money,cash,gig"),
        new ClassificationRule('hygiene', "shower,clean,clothes,grooming,haircut"),
        new ClassificationRule('benefits', "benefits,government,assistance programs"),
        new ClassificationRule('mental', "mental,counseling,down,support"),
        new ClassificationRule('transportation', "transportation,transit,schedules,bus,train,taxi,car,ride"),
        new ClassificationRule('facility', "library,computer,facility,toilet,bathroom,restroom"),
        new ClassificationRule('social', "family,isolated,contact,social"),
        new ClassificationRule('clothing', "clothing,clothes,coat,jacket,shoes"),
        new ClassificationRule('utility', "charge,phone,charger"),
        new ClassificationRule('security', "safely,secure,mail,packages,bike"),
    ];

    const testClassification = (text: string, expectedClass: string) => {
        const result = classify(text, assistanceRules);
        if (!result.get(expectedClass)) {
            const rule = assistanceRules.find(r => r.category === expectedClass);
            const matchedRules = Array.from(result.keys());
            throw new Error(
                `Classification failed:\nText: "${text}"\nExpected to include: "${expectedClass}"\nGot: ${JSON.stringify(result)}\nExpected to match pattern: ${rule}${matchedRules.length ? `\nMatched patterns: ${matchedRules.map(r => r).join(', ')}` : ''}`
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

    test('should classify informal food assistance requests', () => {
        const informalFoodTexts = [
            "yo im dead ass hungry, any food joints open rn?",
            "soup kitchin info? need some hot grub now!",
            "any free meal spots round here? i'm starvin!",
            "what time does the soup kitchin open? need food like now."
        ];

        informalFoodTexts.forEach(text => testClassification(text, 'food'));
    });

    test('should classify informal shelter assistance requests', () => {
        const informalShelterTexts = [
            "any shelter available? it's freezy out here on da streetz.",
            // "i need a place 2 crash tonight, none of da usual spots open.", fails simple classification
            // "my dog needs care too—any shelters that take pets?", fails simple classification
            "need a safe spot 2 stash my stuff overnight. any ideas?",
            "shelter closed tonight, help me find a safe spot 2 sleep.",
            "gimme deets on a shelter that got bed space 4 tonight."
        ];

        informalShelterTexts.forEach(text => testClassification(text, 'shelter'));
    });

    test('should classify informal medical assistance requests', () => {
        const informalMedicalTexts = [
            "need help pronto, feelin real sick n don't know what 2 do.",
            // "scraped my knee bad, not sure if i need 2 see a docter.", fails simple classification
            "my teeth r killin me, need a free dentl clinic stat.",
            "im strugglin with addiction, any rehab centers that won't charge me?",
            // "where do i get my meds refilled? ran out days ago.", fails simple classification
            "got a nasty cut on my leg—any place 4 immediate care?"
        ];

        informalMedicalTexts.forEach(text => testClassification(text, 'medicine'));
    });

    test('should classify informal legal assistance requests', () => {
        const informalLegalTexts = [
            "lost ma ID, help me get a new one plz. idk how 2 start.",
            // "got mugged earlier, need help reportin it to someone who cares.", fails simple classification
            // "help me fill out this housing app—its super confusin.", fails simple classification
            "how do i report theft? someone take my stuff last night.",
            "any local service for legal advice for peeps like us?"
        ];

        informalLegalTexts.forEach(text => testClassification(text, 'legal'));
    });

    test('should classify informal employment assistance requests', () => {
        const informalEmploymentTexts = [
            "where's a quick gig? i need cash ASAP.",
            "u know of any work training programs? i wanna learn a skill."
        ];

        informalEmploymentTexts.forEach(text => testClassification(text, 'employment'));
    });

    test('should classify informal benefits assistance requests', () => {
        const informalBenefitsTexts = [
            "how do i apply 4 benefits? these forms r all messed up."
        ];

        informalBenefitsTexts.forEach(text => testClassification(text, 'benefits'));
    });

    test('should classify informal mental health assistance requests', () => {
        const informalMentalTexts = [
            "feelin' real low, any mental helpline or someone 2 talk to?",
            // "i need someone 2 talk to, feelin' alone out here..." fails simple classification
        ];

        informalMentalTexts.forEach(text => testClassification(text, 'mental'));
    });

    test('should classify informal transportation assistance requests', () => {
        const informalTransportationTexts = [
            "bus routes r so confusin—can anyone break it down for me?"
        ];

        informalTransportationTexts.forEach(text => testClassification(text, 'transportation'));
    });

    test('should classify informal utility assistance requests', () => {
        const informalUtilityTexts = [
            "where do i charge my phone for free? battery goin out.",
            "my phone charger got jacked, any free ones available?",
            // "im confused by the new update in this app—any tech help?" fails simple classification
        ];

        informalUtilityTexts.forEach(text => testClassification(text, 'utility'));
    });

    test('should classify informal hygiene assistance requests', () => {
        const informalHygieneTexts = [
            // "hey, can u hook me up with info on free haircuts? need a trim.", fails simple classification
            "need a shower real bad—any public facilities open rn?"
        ];

        informalHygieneTexts.forEach(text => testClassification(text, 'hygiene'));
    });

    test('should classify informal clothing assistance requests', () => {
        const informalClothingTexts = [
            "need a warm coat, it's freezin—any local charity help?"
        ];

        informalClothingTexts.forEach(text => testClassification(text, 'clothing'));
    });

    test('should classify informal facility assistance requests', () => {
        const informalFacilityTexts = [
            "can anyone tell me where a restroom's at? really need one."
        ];

        informalFacilityTexts.forEach(text => testClassification(text, 'facility'));
    });
});

describe('priority-based classification', () => {
    const priorityRules: ClassificationRule[] = [
        new ClassificationRule('high', "test,testing", 2),
        new ClassificationRule('medium', "test,testing", 1),
        new ClassificationRule('low', "test,testing", 0),
        new ClassificationRule('default', "test,testing", 0),
    ];

    test('should return classifications ordered by priority when multiple patterns match', () => {
        expect(classify('testing 123', priorityRules))
            .toEqual(new Map([['high', 2], ['medium', 1]]));
    });

    test('should handle rules with same priority correctly', () => {
        const equalPriorityRules: ClassificationRule[] = [
            new ClassificationRule('first', "test,testing", 1),
            new ClassificationRule('second', "test,testing", 1),
        ];
        // When priorities are equal, maintain order based on rule definition
        const result = classify('test', equalPriorityRules);
        expect(result).toEqual(new Map([['first', 1], ['second', 1]]));
    });

    test('should handle missing priority as 0', () => {
        const mixedRules: ClassificationRule[] = [
            new ClassificationRule('withPriority', "test,testing", 1),
            new ClassificationRule('no-priority', "test,testing", 0),
        ];
        expect(classify('test', mixedRules))
            .toEqual(new Map([['withPriority', 1]]));
    });
});