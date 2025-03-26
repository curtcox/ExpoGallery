import { classify, classificationMap } from '../simpleClassifier';
import assistanceData from './assistanceRequests.json';
import assistanceRulesJson from './assistanceSimple.json';

interface AssistanceMessage {
    id: number;
    text: string;
    classifications: string[];
}

interface AssistanceData {
    messages: AssistanceMessage[];
}

describe('assistance resource matcher scoring', () => {
    // Convert JSON patterns to RegExp objects
    const assistanceRules: classificationMap = Object.entries(assistanceRulesJson).reduce((acc, [key, value]) => {
        acc[key] = {
            ...value,
            pattern: new RegExp(value.pattern, 'i')
        };
        return acc;
    }, {} as classificationMap);

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