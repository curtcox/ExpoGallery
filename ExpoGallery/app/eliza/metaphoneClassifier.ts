const { stemmer } = require('stemmer');
const { doubleMetaphone } = require('double-metaphone');

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

export class Rule {
    categoryName: string;
    phrases: WeightMap;
    exclusions: WeightMap;
    constructor(categoryName: string, phrases: WeightMap, exclusions: WeightMap) {
        this.categoryName = categoryName;
        this.phrases = phrases;
        this.exclusions = exclusions;
    }

    phraseScores(words: string[]): WeightMap {
        const calculated = new WeightMap();
        for (let index = 0; index < words.length; index++) {
            for (const phrase of this.phrases.keys()) {
                const score = phraseMatchScore(words, phrase, index);
                calculated.add(phrase, score);
            }
        }
        return calculated;
    }

    exclusionScores(words: string[]): WeightMap {
        const calculated = new WeightMap();
        for (let index = 0; index < words.length; index++) {
            for (const exclusion of this.exclusions.keys()) {
                const score = wordMatchScore(words[index], exclusion);
                calculated.add(exclusion, -score);
            }
        }
        return calculated;
    }

    score(text: string): WeightMap {
        const words = splitIntoWords(text);
        const weights = new WeightMap();
        weights.addAll(this.phraseScores(words));
        weights.addAll(this.exclusionScores(words));
        return weights
    }
}

function wordMatchScore(word: string, keyword: string): number {
    return word.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0;
}

function phraseMatchScore(words: string[], phrase: string, index: number): number {
    return words.slice(index, index + phrase.length).join(' ') === phrase ? 1 : 0;
}

export interface RankedCategory {
    category: string;
    score: WeightMap;
}

export function classify(
    userRequest: string,
    classificationRules: Rule[]
): RankedCategory[] {
    const rankedCategories: RankedCategory[] = [];

    for (const rule of classificationRules) {
        const score = rule.score(userRequest);
        rankedCategories.push({ category: rule.categoryName, score });
    }
    return rankedCategories.filter(c => c.score.total() > 0).sort((a, b) => b.score.total() - a.score.total());
}

/**
 * Normalizes text: lowercase and removes basic punctuation.
 * More robust implementations might handle punctuation better.
 */
function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[.,!?;:"']/g, '');
}

/**
 * Tokenizes text into words.
 */
function splitIntoWords(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
}

/**
 * Generates primary and secondary metaphone codes for a word.
 */
function generateMetaphoneCodes(word: string): Set<string> {
    const codes = doubleMetaphone(word);
    return new Set(codes.filter((code: string) => code));
}

function stemmed(keywords: string[]): Set<string> {
    const set = new Set<string>();

    keywords.forEach(keyword => {
        const normalized = normalizeText(keyword);
        if (normalized) {
            const stemmed = stemmer(normalized);
            set.add(stemmed);
        }
    });

    return set;
}

function metaphones(keywords: string[]): Set<string> {
    const set = new Set<string>();

    keywords.forEach(keyword => {
        const normalized = normalizeText(keyword);
        if (normalized) {
            generateMetaphoneCodes(normalized).forEach(code => set.add(code));
        }
    });

    return set;
}
