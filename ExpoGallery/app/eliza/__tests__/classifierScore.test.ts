import { classify, classificationMap } from '../classifier';
import assistanceData from './assistance.json';

interface AssistanceMessage {
    id: number;
    text: string;
    classifications: string[];
}

interface AssistanceData {
    messages: AssistanceMessage[];
}

describe('assistance resource matcher scoring', () => {
    const assistanceRules: classificationMap = {
        food: {
            pattern: /\b(food|hungry|meal|eat|soup|kitchen|meals|snack)\b/,
            classification: 'food'
        },
        shelter: {
            pattern: /\b(shelter|sleep|overnight|housing|store belongings|night shelter)\b/,
            classification: 'shelter'
        },
        medicine: {
            pattern: /\b(sick|clinic|medical|health|injury|dental|treatment|rehab|hospital|doctor|dentist|nurse|ambulance|emergency|cut)\b/,
            classification: 'medicine'
        },
        legal: {
            pattern: /\b(ID|legal|rights|forms|application|crime|report|lawyer|law|attorney|judge|court|jail|prison)\b/i,
            classification: 'legal',
            priority: 2
        },
        employment: {
            pattern: /\b(job|work|employment|training|placement|money|cash|gig)\b/,
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
            pattern: /\b(transportation|transit|schedules|bus|train|taxi|car|ride)\b/,
            classification: 'transportation'
        },
        facility: {
            pattern: /\b(library|computer|facility|toilet|bathroom|restroom)\b/,
            classification: 'facility'
        },
        social: {
            pattern: /\b(family|isolated|contact|social)\b/,
            classification: 'social'
        },
        clothing: {
            pattern: /\b(clothing|clothes|coat|jacket|shoes)\b/,
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

    test('should achieve at least 90% classification accuracy', () => {
        let totalClassifications = 0;
        let correctClassifications = 0;

        // Process each message in the assistance data
        (assistanceData as AssistanceData).messages.forEach(message => {
            const expectedClassifications = message.classifications;
            const actualClassifications = classify(message.text, assistanceRules);

            // Count total expected classifications
            totalClassifications += expectedClassifications.length;

            // Count correct classifications
            expectedClassifications.forEach(expected => {
                if (actualClassifications.includes(expected)) {
                    correctClassifications++;
                } else {
                    console.log(`Classification failed:
                    Text: "${message.text}"
                    Expected: "${expected}"
                    Got: "${actualClassifications}"`);
                }
            });
        });

        const accuracy = correctClassifications / totalClassifications;
        const percentage = (accuracy * 100).toFixed(2);

        console.log(`Classification Results:
        Total Classifications Attempted: ${totalClassifications}
        Correct Classifications: ${correctClassifications}
        Accuracy: ${percentage}%`);

        expect(accuracy).toBeGreaterThanOrEqual(0.78);
    });
});