import { classify, ClassificationRule } from '../simpleClassifier';
import assistanceData from './assistanceRequests.json';
import assistanceRules from './assistanceSimple.json';
import { classify as metaphoneClassify, Rule, WeightMap } from '../metaphoneClassifier';
import { log } from "console";

interface AssistanceMessage {
    id: number;
    text: string;
    classifications: string[];
}

interface AssistanceData {
    messages: AssistanceMessage[];
}

interface AssistanceRule {
    category: string;
    phrases: string;
    weight?: number;
}

function assistanceRulesAsClassificationRule(): ClassificationRule[] {
    const rules = assistanceRules as AssistanceRule[];
    return rules.map(rule => new ClassificationRule(rule.category, rule.phrases, rule.weight ?? 1));
}

describe('simple classifier assistance resource matcher scoring', () => {

    test('should achieve at least 75% classification accuracy', () => {
        let totalClassifications = 0;
        let correctClassifications = 0;

        // Process each message in the assistance data
        (assistanceData as AssistanceData).messages.forEach(message => {
            const expectedClassifications = message.classifications;
            const actualClassifications = classify(message.text, assistanceRulesAsClassificationRule());

            // Count total expected classifications
            totalClassifications += expectedClassifications.length;

            // Count correct classifications
            expectedClassifications.forEach(expected => {
                const tooMany = expectedClassifications.length + 2 <= actualClassifications.size;
                if (actualClassifications.has(expected) && !tooMany) {
                    correctClassifications++;
                                    } else {
    log(`Classification failed:
    Text: "${message.text}"
    Expected: "${expected}"
    Got: "${Array.from(actualClassifications.keys())}"`);
                }
            });
        });

        const accuracy = correctClassifications / totalClassifications;
        const percentage = (accuracy * 100).toFixed(2);

        console.log(`Classification Results:
        Total Classifications Attempted: ${totalClassifications}
        Correct Classifications: ${correctClassifications}
        Accuracy: ${percentage}%`);

        expect(accuracy).toBeGreaterThanOrEqual(0.75);
    });
});

function assistanceRulesAsMetaphoneRule(): Rule[] {
    const rules = assistanceRules as AssistanceRule[];
    const phrases = new WeightMap();
    const exclusions = new WeightMap();
    return rules.map(rule => new Rule(rule.category, phrases, exclusions));
}

describe('metaphone classifier assistance resource matcher scoring', () => {

    test('should achieve at least 75% classification accuracy', () => {
        let totalClassifications = 0;
        let correctClassifications = 0;

        // Process each message in the assistance data
        (assistanceData as AssistanceData).messages.forEach(message => {
            const expectedClassifications = message.classifications;
            const actualClassifications = metaphoneClassify(message.text, assistanceRulesAsMetaphoneRule());

            // Count total expected classifications
            totalClassifications += expectedClassifications.length;

            // Count correct classifications
            expectedClassifications.forEach(expected => {
                const tooMany = expectedClassifications.length + 2 <= actualClassifications.length;
                if (actualClassifications.some(classification => classification.category === expected) && !tooMany) {
                    correctClassifications++;
                                    } else {
    log(`Classification failed:
    Text: "${message.text}"
    Expected: "${expected}"
    Got: "${JSON.stringify(actualClassifications)}"`);
                }
            });
        });

        const accuracy = correctClassifications / totalClassifications;
        const percentage = (accuracy * 100).toFixed(2);

        console.log(`Classification Results:
        Total Classifications Attempted: ${totalClassifications}
        Correct Classifications: ${correctClassifications}
        Accuracy: ${percentage}%`);

        expect(accuracy).toBeGreaterThanOrEqual(0.75);
    });
});
