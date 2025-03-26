import { classify } from '../metaphoneClassifier';
import { ProcessedRule } from '../metaphoneClassifier';

describe('MetaphoneClassifier', () => {
    // Helper function to find matches in text for a rule
    const findMatches = (text: string, rule: ProcessedRule) => {
        const words = text.toLowerCase().split(/\s+/);
        const stemmedWords = words.map(w => w.replace(/[^a-z0-9]/g, '')); // Simple stemming for test purposes

        const matchedKeywords = Array.from(rule.stemmedKeywords)
            .filter(keyword => stemmedWords.some(word => word.includes(keyword)));

        const matchedMetaphone = Array.from(rule.metaphoneKeywords)
            .filter(phone => words.some(word => word.toUpperCase().includes(phone)));

        const matchedPhrases = rule.stemmedPhrases
            .filter(phrase => {
                const phraseStr = phrase.join(' ');
                return text.toLowerCase().includes(phraseStr);
            });

        return {
            matchedKeywords,
            matchedMetaphone,
            matchedPhrases
        };
    };

    // Helper function for detailed failure messages
    const expectClassification = (text: string, rules: ProcessedRule[], expectedClass: string) => {
        const result = classify(text, rules);
        if (result !== expectedClass) {
            const expectedRule = rules.find(r => r.categoryName === expectedClass);
            const actualRule = rules.find(r => r.categoryName === result);

            let message = `Classification failed:\n`;
            message += `Text: "${text}"\n`;
            message += `Expected: "${expectedClass}"\n`;
            message += `Got: "${result}"\n\n`;

            if (expectedRule) {
                const expectedMatches = findMatches(text, expectedRule);
                message += `Expected rule details:\n`;
                message += `- Category: ${expectedRule.categoryName}\n`;
                message += `- Keywords: ${Array.from(expectedRule.stemmedKeywords).join(', ')}\n`;
                message += `- Metaphone: ${Array.from(expectedRule.metaphoneKeywords).join(', ')}\n`;
                message += `- Phrases: ${expectedRule.stemmedPhrases.map((p: string[]) => p.join(' ')).join('; ')}\n`;
                message += `- Weights: keyword=${expectedRule.keywordWeight}, phrase=${expectedRule.phraseWeight}\n`;
                message += `- Matched Keywords: ${expectedMatches.matchedKeywords.join(', ') || 'none'}\n`;
                message += `- Matched Metaphone: ${expectedMatches.matchedMetaphone.join(', ') || 'none'}\n`;
                message += `- Matched Phrases: ${expectedMatches.matchedPhrases.map((p: string[]) => p.join(' ')).join('; ') || 'none'}\n\n`;
            }

            if (actualRule) {
                const actualMatches = findMatches(text, actualRule);
                message += `Actual matched rule details:\n`;
                message += `- Category: ${actualRule.categoryName}\n`;
                message += `- Keywords: ${Array.from(actualRule.stemmedKeywords).join(', ')}\n`;
                message += `- Metaphone: ${Array.from(actualRule.metaphoneKeywords).join(', ')}\n`;
                message += `- Phrases: ${actualRule.stemmedPhrases.map((p: string[]) => p.join(' ')).join('; ')}\n`;
                message += `- Weights: keyword=${actualRule.keywordWeight}, phrase=${actualRule.phraseWeight}\n`;
                message += `- Matched Keywords: ${actualMatches.matchedKeywords.join(', ') || 'none'}\n`;
                message += `- Matched Metaphone: ${actualMatches.matchedMetaphone.join(', ') || 'none'}\n`;
                message += `- Matched Phrases: ${actualMatches.matchedPhrases.map((p: string[]) => p.join(' ')).join('; ') || 'none'}\n`;
            }

            throw new Error(message);
        }
    };

    // Base rules for basic functionality tests
    const baseRules: ProcessedRule[] = [
        {
            categoryName: 'greeting',
            stemmedKeywords: new Set(['hello', 'hi', 'hey']),
            metaphoneKeywords: new Set(['HL', 'H']),
            stemmedPhrases: [['how', 'ar', 'you']],
            stemmedExclusions: new Set(['bye', 'goodby']),
            metaphoneExclusions: new Set(['B', 'KTB']),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'farewell',
            stemmedKeywords: new Set(['bye', 'goodby', 'cya']),
            metaphoneKeywords: new Set(['B', 'KTB']),
            stemmedPhrases: [['see', 'you', 'later']],
            stemmedExclusions: new Set(['hello', 'hi']),
            metaphoneExclusions: new Set(['HL', 'H']),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        }
    ];

    // Resource classification rules
    const resourceRules: ProcessedRule[] = [
        {
            categoryName: 'computer',
            stemmedKeywords: new Set(['comput', 'cpu', 'ram', 'disk', 'memori', 'processor', 'storag', 'hardwar']),
            metaphoneKeywords: new Set(['KMPT', 'KP', 'RM', 'TSK', 'MMR', 'PRSSS', 'STRJ', 'HRTR']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 1.0
        },
        {
            categoryName: 'human',
            stemmedKeywords: new Set(['tire', 'energi', 'sleep', 'exhaust', 'fatig', 'rest', 'strength']),
            metaphoneKeywords: new Set(['TR', 'ENRJ', 'SLP', 'EXST', 'FTK', 'RST', 'STRNK']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 1.0
        },
        {
            categoryName: 'financial',
            stemmedKeywords: new Set(['money', 'budget', 'save', 'cost', 'financ', 'expens', 'price', 'afford']),
            metaphoneKeywords: new Set(['MN', 'BJT', 'SF', 'KST', 'FNNS', 'EXPNS', 'PRS', 'AFRT']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 1.0
        },
        {
            categoryName: 'time',
            stemmedKeywords: new Set(['time', 'hour', 'schedul', 'deadlin', 'durat']),
            metaphoneKeywords: new Set(['TM', 'HR', 'SKTL', 'TTLN', 'TRT']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 1.0
        }
    ];

    // Weather and food rules
    const customRules: ProcessedRule[] = [
        {
            categoryName: 'nutrition',
            stemmedKeywords: new Set(['hungri', 'food', 'eat', 'meal', 'snack', 'dinner', 'lunch', 'breakfast']),
            metaphoneKeywords: new Set(['HNKR', 'FT', 'ET', 'ML', 'SNK', 'TNR', 'LNX', 'BRKFST']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 1.0
        },
        {
            categoryName: 'weather',
            stemmedKeywords: new Set(['rain', 'sun', 'snow', 'wind', 'storm', 'temperatur', 'weather']),
            metaphoneKeywords: new Set(['RN', 'SN', 'SN', 'WNT', 'STRM', 'TMPRTR', 'W0R']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 1.0
        }
    ];

    // Priority-based rules
    const priorityRules: ProcessedRule[] = [
        {
            categoryName: 'high',
            stemmedKeywords: new Set(['test', 'test']),
            metaphoneKeywords: new Set(['TST', 'TSTNK']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 2.0,  // Higher weight to simulate priority
            phraseWeight: 2.0
        },
        {
            categoryName: 'medium',
            stemmedKeywords: new Set(['test', 'test']),
            metaphoneKeywords: new Set(['TST', 'TSTNK']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.5,  // Medium weight
            phraseWeight: 1.5
        },
        {
            categoryName: 'low',
            stemmedKeywords: new Set(['test', 'test']),
            metaphoneKeywords: new Set(['TST', 'TSTNK']),
            stemmedPhrases: [],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,  // Lower weight
            phraseWeight: 1.0
        }
    ];

    // Assistance resource rules
    const assistanceRules: ProcessedRule[] = [
        {
            categoryName: 'food',
            stemmedKeywords: new Set(['food', 'hungri', 'meal', 'eat', 'soup', 'kitchen', 'meal', 'snack', 'grub', 'starv']),
            metaphoneKeywords: new Set(['FT', 'HNKR', 'ML', 'ET', 'SP', 'KXN', 'SNK', 'KRB', 'STRF']),
            stemmedPhrases: [['soup', 'kitchen'], ['hot', 'meal'], ['free', 'meal']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'shelter',
            stemmedKeywords: new Set(['shelter', 'sleep', 'overnight', 'hous', 'store', 'belong', 'night', 'crash', 'spot', 'bed', 'space']),
            metaphoneKeywords: new Set(['XLTR', 'SLP', 'OFRNT', 'HS', 'STR', 'BLNK', 'NT', 'KRX', 'SPT', 'BT', 'SPS']),
            stemmedPhrases: [['safe', 'place'], ['place', 'to', 'sleep'], ['need', 'place']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'medicine',
            stemmedKeywords: new Set(['sick', 'clinic', 'medic', 'health', 'injuri', 'dental', 'treatment', 'rehab', 'hospit', 'doctor', 'dentist', 'nurs', 'ambul', 'emerg', 'cut', 'addict', 'teeth', 'kill', 'meds', 'refil']),
            metaphoneKeywords: new Set(['SK', 'KLNK', 'MTK', 'HL0', 'INJR', 'TNTL', 'TRTMNT', 'RHB', 'HSPT', 'TKTR', 'TNTST', 'NRS', 'AMBL', 'EMRJ', 'KT', 'ATKT', 'T0', 'KL', 'MTS', 'RFL']),
            stemmedPhrases: [['feel', 'sick'], ['need', 'medic'], ['need', 'doctor']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'legal',
            stemmedKeywords: new Set(['id', 'legal', 'right', 'form', 'applic', 'crime', 'report', 'lawyer', 'law', 'attorney', 'judg', 'court', 'jail', 'prison', 'theft', 'stolen', 'mugg']),
            metaphoneKeywords: new Set(['T', 'LKL', 'RT', 'FRM', 'APLK', 'KRM', 'RPRT', 'LYR', 'L', 'ATRN', 'JJ', 'KRT', 'JL', 'PRSN', '0FT', 'STLN', 'MK']),
            stemmedPhrases: [['need', 'lawyer'], ['legal', 'help'], ['legal', 'advice']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 2.0,  // Higher priority
            phraseWeight: 3.0
        },
        {
            categoryName: 'employment',
            stemmedKeywords: new Set(['job', 'work', 'employ', 'train', 'place', 'money', 'cash', 'gig', 'skill']),
            metaphoneKeywords: new Set(['JB', 'WRK', 'EMPL', 'TRN', 'PLS', 'MN', 'KX', 'KK', 'SKL']),
            stemmedPhrases: [['need', 'work'], ['need', 'job'], ['quick', 'money']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'hygiene',
            stemmedKeywords: new Set(['shower', 'clean', 'cloth', 'groom', 'haircut', 'trim']),
            metaphoneKeywords: new Set(['XWR', 'KLN', 'KL0', 'KRM', 'HRKT', 'TRM']),
            stemmedPhrases: [['need', 'shower'], ['need', 'haircut']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'benefits',
            stemmedKeywords: new Set(['benefit', 'govern', 'assist', 'program', 'form', 'appli']),
            metaphoneKeywords: new Set(['BNFT', 'KFRN', 'ASST', 'PRKRM', 'FRM', 'APL']),
            stemmedPhrases: [['apply', 'for', 'benefits']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'mental',
            stemmedKeywords: new Set(['mental', 'counsel', 'down', 'support', 'low', 'alon', 'talk']),
            metaphoneKeywords: new Set(['MNTL', 'KNSL', 'TN', 'SPRT', 'L', 'ALN', 'TLK']),
            stemmedPhrases: [['feel', 'down'], ['need', 'talk'], ['mental', 'health']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 2.0,  // Higher priority
            phraseWeight: 3.0
        },
        {
            categoryName: 'transportation',
            stemmedKeywords: new Set(['transport', 'transit', 'schedul', 'bus', 'train', 'taxi', 'car', 'ride', 'rout']),
            metaphoneKeywords: new Set(['TRNSPRT', 'TRNST', 'SKTL', 'BS', 'TRN', 'TKS', 'KR', 'RT', 'RT']),
            stemmedPhrases: [['need', 'ride'], ['bus', 'schedule']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'facility',
            stemmedKeywords: new Set(['librari', 'comput', 'facil', 'toilet', 'bathroom', 'restroom']),
            metaphoneKeywords: new Set(['LBRR', 'KMPT', 'FSLT', 'TLT', 'B0RM', 'RSTRM']),
            stemmedPhrases: [['public', 'restroom'], ['need', 'bathroom']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'social',
            stemmedKeywords: new Set(['famili', 'isol', 'contact', 'social', 'alon']),
            metaphoneKeywords: new Set(['FML', 'ASL', 'KNTKT', 'SXL', 'ALN']),
            stemmedPhrases: [['feel', 'alone'], ['need', 'help']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'clothing',
            stemmedKeywords: new Set(['cloth', 'coat', 'jacket', 'shoe', 'warm']),
            metaphoneKeywords: new Set(['KL0', 'KT', 'JKT', 'X', 'WRM']),
            stemmedPhrases: [['need', 'clothes'], ['warm', 'clothes']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'utility',
            stemmedKeywords: new Set(['charg', 'phone', 'charger', 'batteri', 'tech', 'app', 'updat']),
            metaphoneKeywords: new Set(['XRJ', 'FN', 'XRJR', 'BTTR', 'TK', 'AP', 'APTT']),
            stemmedPhrases: [['charge', 'phone'], ['need', 'charger']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        },
        {
            categoryName: 'security',
            stemmedKeywords: new Set(['safe', 'secur', 'mail', 'packag', 'bike']),
            metaphoneKeywords: new Set(['SF', 'SKR', 'ML', 'PKJ', 'BK']),
            stemmedPhrases: [['safe', 'place'], ['secure', 'location']],
            stemmedExclusions: new Set([]),
            metaphoneExclusions: new Set([]),
            keywordWeight: 1.0,
            phraseWeight: 2.0
        }
    ];

    describe('basic functionality', () => {
        test('should classify basic greetings correctly', () => {
            expectClassification('hello there', baseRules, 'greeting');
            expectClassification('hi how are you', baseRules, 'greeting');
        });

        test('should classify basic farewells correctly', () => {
            expectClassification('goodbye friend', baseRules, 'farewell');
            expectClassification('see you later', baseRules, 'farewell');
        });

        test('should return unknown for unmatched input', () => {
            expectClassification('random text here', baseRules, 'unknown');
        });

        test('should handle empty input correctly', () => {
            expectClassification('', baseRules, 'unknown');
        });

        test('should respect exclusions', () => {
            expectClassification('hello bye', baseRules, 'unknown');
        });
    });

    describe('resource classification', () => {
        test('should classify computer-related text correctly', () => {
            const computerTexts = [
                'My computer is running slow',
                'I need more RAM',
                'The CPU usage is high',
                'My disk space is running low'
            ];

            computerTexts.forEach(text => {
                expectClassification(text, resourceRules, 'computer');
            });
        });

        test('should classify human resource text correctly', () => {
            const humanTexts = [
                'I feel tired today',
                'My energy levels are low',
                'I need more sleep',
                'I am exhausted from work'
            ];

            humanTexts.forEach(text => {
                expectClassification(text, resourceRules, 'human');
            });
        });

        test('should classify financial text correctly', () => {
            const financialTexts = [
                'I need more money',
                'My budget is tight',
                'Running out of savings',
                'The cost is too high'
            ];

            financialTexts.forEach(text => {
                expectClassification(text, resourceRules, 'financial');
            });
        });

        test('should classify time-related text correctly', () => {
            const timeTexts = [
                'I dont have enough time',
                'Running out of time',
                'Need more hours in the day',
                'Time is limited'
            ];

            timeTexts.forEach(text => {
                expectClassification(text, resourceRules, 'time');
            });
        });

        test('should return unknown for unclassifiable text', () => {
            const unknownTexts = [
                'Hello world',
                'The weather is nice today',
                'I like pizza',
                'Random text with no resource context'
            ];

            unknownTexts.forEach(text => {
                expectClassification(text, resourceRules, 'unknown');
            });
        });

        test('should handle empty strings and whitespace', () => {
            expectClassification('', resourceRules, 'unknown');
            expectClassification('   ', resourceRules, 'unknown');
        });

        test('should be case insensitive', () => {
            expectClassification('MY COMPUTER IS SLOW', resourceRules, 'computer');
            expectClassification('i need more Money', resourceRules, 'financial');
        });
    });

    describe('custom classifications', () => {
        test('should classify nutrition-related text correctly', () => {
            expectClassification('I am hungry', customRules, 'nutrition');
            expectClassification('Time for breakfast', customRules, 'nutrition');
        });

        test('should classify weather-related text correctly', () => {
            expectClassification('It might rain today', customRules, 'weather');
            expectClassification('The temperature is rising', customRules, 'weather');
        });

        test('should return unknown for unrelated text', () => {
            expectClassification('I need more RAM', customRules, 'unknown');
        });

        test('should be case insensitive with custom rules', () => {
            expectClassification('FEELING HUNGRY', customRules, 'nutrition');
            expectClassification('The WEATHER is nice', customRules, 'weather');
        });
    });

    describe('priority-based classification', () => {
        test('should prioritize classifications based on weights', () => {
            // Since metaphone classifier returns single best match,
            // it should return the highest priority match
            expectClassification('testing 123', priorityRules, 'high');
        });

        test('should handle equal weights correctly', () => {
            const equalWeightRules: ProcessedRule[] = [
                {
                    categoryName: 'first',
                    stemmedKeywords: new Set(['test']),
                    metaphoneKeywords: new Set(['TST']),
                    stemmedPhrases: [],
                    stemmedExclusions: new Set([]),
                    metaphoneExclusions: new Set([]),
                    keywordWeight: 1.0,
                    phraseWeight: 1.0
                },
                {
                    categoryName: 'second',
                    stemmedKeywords: new Set(['test']),
                    metaphoneKeywords: new Set(['TST']),
                    stemmedPhrases: [],
                    stemmedExclusions: new Set([]),
                    metaphoneExclusions: new Set([]),
                    keywordWeight: 1.0,
                    phraseWeight: 1.0
                }
            ];

            // With equal weights, should return the first matching category
            expectClassification('test', equalWeightRules, 'first');
        });
    });

    describe('assistance resource classification', () => {
        test('should classify food-related assistance requests', () => {
            const foodTexts = [
                "I'm really hungry—are there any food assistance programs nearby?",
                "Where can I get a warm meal today?",
                "Where can I find a free soup kitchen that's open now?",
                "Do you know of any outreach programs that distribute food regularly?",
                "Are there any community meals being served today?",
                // Informal texts
                "yo im dead ass hungry, any food joints open rn?",
                "soup kitchin info? need some hot grub now!",
                "any free meal spots round here? i'm starvin!",
                "what time does the soup kitchin open? need food like now."
            ];

            foodTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'food');
            });
        });

        test('should classify shelter-related assistance requests', () => {
            const shelterTexts = [
                "Can anyone point me to a safe place to sleep tonight?",
                "Is there a shelter nearby that welcomes pets?",
                "I need somewhere safe to store my belongings overnight.",
                "Can someone tell me if there's a night shelter open in this area?",
                "What are the operating hours of the nearest shelter?",
                "Where can I find a shelter that allows for storing personal belongings safely?",
                // Informal texts
                "any shelter available? it's freezy out here on da streetz.",
                "need a safe spot 2 stash my stuff overnight. any ideas?",
                "shelter closed tonight, help me find a safe spot 2 sleep.",
                "gimme deets on a shelter that got bed space 4 tonight.",
                // Previously failing texts - now included
                "i need a place 2 crash tonight, none of da usual spots open.",
                "my dog needs care too—any shelters that take pets?"
            ];

            shelterTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'shelter');
            });
        });

        test('should classify medical assistance requests', () => {
            const medicalTexts = [
                "I'm feeling really sick; is there a free clinic in the area?",
                "I have a sprained ankle; is there a place for free medical help?",
                "Can someone direct me to a free dental clinic?",
                "I'm having trouble with substance abuse; is there a rehab center nearby?",
                "I have a minor injury and no money for treatment—any ideas for free care?",
                // Informal texts
                "need help pronto, feelin real sick n don't know what 2 do.",
                "my teeth r killin me, need a free dentl clinic stat.",
                "im strugglin with addiction, any rehab centers that won't charge me?",
                "got a nasty cut on my leg—any place 4 immediate care?",
                // Previously failing texts - now included
                "scraped my knee bad, not sure if i need 2 see a docter.",
                "where do i get my meds refilled? ran out days ago."
            ];

            medicalTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'medicine');
            });
        });

        test('should classify legal assistance requests', () => {
            const legalTexts = [
                "I lost my wallet; can someone help me replace my ID?",
                "Can someone help me understand my rights as a tenant or street resident?",
                "I need a lawyer to help with my housing application, can anyone guide me?",
                "I need legal help with filling out forms to apply for housing—can someone assist?",
                // Informal texts
                "lost ma ID, help me get a new one plz. idk how 2 start.",
                "how do i report theft? someone take my stuff last night.",
                "any local service for legal advice for peeps like us?",
                // Previously failing texts - now included
                "got mugged earlier, need help reportin it to someone who cares.",
                "help me fill out this housing app—its super confusin."
            ];

            legalTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'legal');
            });
        });

        test('should classify employment assistance requests', () => {
            const employmentTexts = [
                "Are there any temporary job opportunities available right now?",
                "Are there any programs that offer job training or work placement?",
                "I'm looking for a part-time job; any leads on work nearby?",
                "I'm trying to get back on my feet—are there any programs that assist with job placement?",
                // Informal texts
                "where's a quick gig? i need cash ASAP.",
                "u know of any work training programs? i wanna learn a skill."
            ];

            employmentTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'employment');
            });
        });

        test('should classify hygiene assistance requests', () => {
            const hygieneTexts = [
                "I need a shower and some clean clothes—any ideas where I can go?",
                "Where can I go for a free hair cut or grooming services?",
                // Informal texts
                "need a shower real bad—any public facilities open rn?",
                // Previously failing texts - now included
                "hey, can u hook me up with info on free haircuts? need a trim."
            ];

            hygieneTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'hygiene');
            });
        });

        test('should classify mental health assistance requests', () => {
            const mentalTexts = [
                "I'm feeling really down—can I speak to someone about mental health support?",
                "Is there a clinic that offers mental health counseling without a fee?",
                // Informal texts
                "feelin' real low, any mental helpline or someone 2 talk to?",
                // Previously failing texts - now included
                "i need someone 2 talk to, feelin' alone out here..."
            ];

            mentalTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'mental');
            });
        });

        test('should classify transportation assistance requests', () => {
            const transportationTexts = [
                "I'm looking for information on local transportation schedules—any help?",
                "I'm having difficulty navigating public transit—can someone help?",
                // Informal texts
                "bus routes r so confusin—can anyone break it down for me?"
            ];

            transportationTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'transportation');
            });
        });

        test('should classify utility assistance requests', () => {
            const utilityTexts = [
                "Where can I charge my phone without paying?",
                "I lost my phone charger—can anyone recommend a place to get one for free?",
                // Informal texts
                "where do i charge my phone for free? battery goin out.",
                "my phone charger got jacked, any free ones available?",
                // Previously failing texts - now included
                "im confused by the new update in this app—any tech help?"
            ];

            utilityTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'utility');
            });
        });

        test('should classify facility assistance requests', () => {
            const facilityTexts = [
                "Where can I find a public restroom?",
                "Is there a library or computer facility nearby?",
                // Informal texts
                "can anyone tell me where a restroom's at? really need one."
            ];

            facilityTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'facility');
            });
        });

        test('should classify security assistance requests', () => {
            const securityTexts = [
                "I need assistance with getting my mail or packages collected safely.",
                "I need to find a place where I can safely leave my bike.",
                "Where can I store my belongings securely?"
            ];

            securityTexts.forEach(text => {
                expectClassification(text, assistanceRules, 'security');
            });
        });
    });
});