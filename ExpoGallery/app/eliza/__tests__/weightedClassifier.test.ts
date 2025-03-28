import { WeightMap, WeightRule, classify } from '../weightedClassifier';

describe('WeightedClassifier Tests', () => {
    test('WeightMap should correctly handle basic operations', () => {
        const weights = new WeightMap();
        weights.set('key1', 5);
        weights.set('key2', 3);

        expect(weights.get('key1')).toBe(5);
        expect(weights.get('key2')).toBe(3);
        expect(weights.get('nonexistent')).toBe(0);
        expect(weights.total()).toBe(8);

        // Test deletion via setting to 0
        weights.set('key1', 0);
        expect(weights.get('key1')).toBe(0);
        expect(weights.keys()).toEqual(['key2']);
    });

    test('WeightMap should correctly add weights', () => {
        const weights1 = new WeightMap();
        const weights2 = new WeightMap();

        weights1.set('key1', 5);
        weights2.set('key1', 3);
        weights2.set('key2', 2);

        weights1.addAll(weights2);

        expect(weights1.get('key1')).toBe(8);
        expect(weights1.get('key2')).toBe(2);
        expect(weights1.total()).toBe(10);
    });

    test('classify should handle empty rules', () => {
        const rules: WeightRule[] = [];
        const result = classify('test input', rules);

        expect(result).toEqual([]);
    });

    test('classify should correctly rank categories', () => {
        const rules: WeightRule[] = [
            {
                categoryName: 'category1',
                score: () => {
                    const weights = new WeightMap();
                    weights.set('match', 5);
                    return weights;
                }
            },
            {
                categoryName: 'category2',
                score: () => {
                    const weights = new WeightMap();
                    weights.set('match', 3);
                    return weights;
                }
            }
        ];

        const result = classify('test input', rules);

        expect(result.length).toBe(2);
        expect(result[0].category).toBe('category1');
        expect(result[1].category).toBe('category2');
        expect(result[0].score.total()).toBe(5);
        expect(result[1].score.total()).toBe(3);
    });

    test('classify should filter out zero scores', () => {
        const rules: WeightRule[] = [
            {
                categoryName: 'category1',
                score: () => {
                    const weights = new WeightMap();
                    weights.set('match', 5);
                    return weights;
                }
            },
            {
                categoryName: 'category2',
                score: () => {
                    const weights = new WeightMap();
                    return weights; // Empty weight map has total of 0
                }
            }
        ];

        const result = classify('test input', rules);

        expect(result.length).toBe(1);
        expect(result[0].category).toBe('category1');
    });

    test('WeightMap should handle negative weights', () => {
        const weights = new WeightMap();
        weights.set('key1', -5);
        weights.set('key2', 3);

        expect(weights.get('key1')).toBe(-5);
        expect(weights.total()).toBe(-2);

        weights.add('key1', 2);  // -5 + 2 = -3
        expect(weights.get('key1')).toBe(-3);
    });

    test('WeightMap add method should work correctly', () => {
        const weights = new WeightMap();
        weights.set('key1', 5);
        weights.add('key1', 3);
        weights.add('key2', 2);  // Adding to non-existent key

        expect(weights.get('key1')).toBe(8);
        expect(weights.get('key2')).toBe(2);
    });

    test('classify should handle equal scores correctly', () => {
        const rules: WeightRule[] = [
            {
                categoryName: 'category1',
                score: () => {
                    const weights = new WeightMap();
                    weights.set('match', 5);
                    return weights;
                }
            },
            {
                categoryName: 'category2',
                score: () => {
                    const weights = new WeightMap();
                    weights.set('match', 5);  // Same score as category1
                    return weights;
                }
            }
        ];

        const result = classify('test input', rules);

        expect(result.length).toBe(2);
        expect(result[0].score.total()).toBe(result[1].score.total());
    });

    test('classify should handle edge case inputs', () => {
        const rules: WeightRule[] = [
            {
                categoryName: 'category1',
                score: (text: string) => {
                    const weights = new WeightMap();
                    weights.set('match', text.length > 0 ? 5 : 0);
                    return weights;
                }
            }
        ];

        // Test empty string
        let result = classify('', rules);
        expect(result.length).toBe(0);  // Should filter out zero scores

        // Test very long string
        const longString = 'a'.repeat(1000);
        result = classify(longString, rules);
        expect(result.length).toBe(1);
        expect(result[0].category).toBe('category1');
    });
});