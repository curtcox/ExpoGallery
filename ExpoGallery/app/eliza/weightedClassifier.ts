export class WeightMap {
    private weights: { [key: string]: number } = {};
    keys(): string[] { return Object.keys(this.weights); }
    get(key: string): number { return this.weights[key] || 0; }
    set(key: string, value: number): void {
        if (value == 0) {
            delete this.weights[key];
        } else {
            this.weights[key] = value;
        }
    }
    add(key: string, value: number): void { this.set(key, this.get(key) + value); }
    addAll(weights: WeightMap): void {
        for (const key in weights.weights) {
            this.add(key, weights.get(key));
        }
    }
    total(): number { return Object.values(this.weights).reduce((acc, val) => acc + val, 0); }
}

export interface RankedCategory {
    category: string;
    score: WeightMap;
}

export interface WeightRule {
    categoryName: string;
    score(text: string): WeightMap;
}

function ranked(
    userRequest: string,
    classificationRules: WeightRule[]
): RankedCategory[] {
    const categories: RankedCategory[] = [];

    for (const rule of classificationRules) {
        const score = rule.score(userRequest);
        categories.push({ category: rule.categoryName, score });
    }

    return categories;
}

function top(rankedCategories: RankedCategory[]): RankedCategory[] {
    return rankedCategories.filter(c => c.score.total() > 0).sort((a, b) => b.score.total() - a.score.total());
}

export const classify = (userRequest: string, classificationRules: WeightRule[]): RankedCategory[] =>
    top(ranked(userRequest, classificationRules));
