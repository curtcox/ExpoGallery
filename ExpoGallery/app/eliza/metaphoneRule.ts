const { stemmer } = require('stemmer');
const { doubleMetaphone } = require('double-metaphone');
import { WeightMap, WeightRule } from './weightedClassifier';

export class MetaphoneRule implements WeightRule {
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
                const score = phraseMatchScore(words, phrase.split(' '), index);
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
        return weights;
    }
}

const EXACT_MATCH = 1.0;
const CASELESS_MATCH = 0.9;
const STEM_MATCH = 0.7;
const METHAPHONE_MATCH = 0.5;
const NO_MATCH = 0;

export function wordMatchScore(word: string, keyword: string): number {
    if (word === keyword) {
        return EXACT_MATCH;
    }
    return inexactMatchScore(normalizeText(word), normalizeText(keyword));
}

function inexactMatchScore(word: string, keyword: string): number {
    if (word === keyword)              return CASELESS_MATCH;
    if (stemMatch(word, keyword))      return STEM_MATCH;
    if (metaphoneMatch(word, keyword)) return METHAPHONE_MATCH;
    return NO_MATCH;
}

function stemMatch(word: string, keyword: string): boolean {
    const wordStem = stemmer(word);
    const keywordStem = stemmer(keyword);
    return wordStem === keywordStem;
}

function metaphoneMatch(word: string, keyword: string): boolean {
    const wordCodes = generateMetaphoneCodes(word);
    const keywordCodes = generateMetaphoneCodes(keyword);
    return Array.from(wordCodes).some(code => keywordCodes.has(code));
}

export function phraseMatchScore(words: string[], phrase: string[], index: number): number {
    let total = 0;
    for (let i = 0; i < phrase.length; i++) {
        if (index + i < words.length) {
            total += wordMatchScore(words[index + i], phrase[i]);
        }
    }

    return total / phrase.length;
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

export function stemmed(keywords: string[]): Set<string> {
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

export function metaphones(keywords: string[]): Set<string> {
    const set = new Set<string>();

    keywords.forEach(keyword => {
        const normalized = normalizeText(keyword);
        if (normalized) {
            generateMetaphoneCodes(normalized).forEach(code => set.add(code));
        }
    });

    return set;
}
