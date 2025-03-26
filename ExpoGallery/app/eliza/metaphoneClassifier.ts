import * as fs from 'fs';
const { stemmer } = require('stemmer');
const { doubleMetaphone } = require('double-metaphone');

// --- Type Definitions ---

interface Rule {
    categoryName: string;
    keywords: string[];
    phrases?: string[];
    exclusions?: string[];
    keywordWeight?: number;
    phraseWeight?: number;
}

export interface ProcessedRule {
    categoryName: string;
    // Store pre-processed data for efficiency
    stemmedKeywords: Set<string>;
    metaphoneKeywords: Set<string>;
    stemmedPhrases: string[][]; // Array of stemmed word arrays
    stemmedExclusions: Set<string>;
    metaphoneExclusions: Set<string>;
    // Weights
    keywordWeight: number;
    phraseWeight: number;
}

interface ProcessedText {
    originalWords: string[];
    stemmedWords: string[];
    metaphoneCodes: Set<string>[]; // Each word maps to a Set of its metaphone codes
}

interface CategoryScores {
    [category: string]: number;
}

interface MatchResults {
    keywordMatches: number;
    phraseMatches: number;
    totalScore: number;
}

// --- Helper Functions ---

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

interface StemmedPhrase {
    original: string;
    stemmedWords: string[];
}

function processKeywords(keywords: string[]): { stemmed: Set<string>, metaphones: Set<string> } {
    const stemmedSet = new Set<string>();
    const metaphoneSet = new Set<string>();

    keywords.forEach(keyword => {
        const normalized = normalizeText(keyword);
        if (normalized) {
            const stemmed = stemmer(normalized);
            stemmedSet.add(stemmed);
            generateMetaphoneCodes(normalized).forEach(code => metaphoneSet.add(code));
        }
    });

    return { stemmed: stemmedSet, metaphones: metaphoneSet };
}

function processPhrases(phrases: string[] = []): string[][] {
    return phrases.map((phrase: string): string[] => {
        const normalized = normalizeText(phrase);
        const words = splitIntoWords(normalized);
        return words.length > 0 ? words.map(stemmer) : [];
    }).filter((stemmedPhrase: string[]): boolean => stemmedPhrase.length > 0);
}

function processExclusions(exclusions: string[] = []): { stemmed: Set<string>, metaphones: Set<string> } {
    const stemmedSet = new Set<string>();
    const metaphoneSet = new Set<string>();

    exclusions.forEach(exclusion => {
        const normalized = normalizeText(exclusion);
        if (!normalized) return;

        if (normalized.includes(' ')) {
            splitIntoWords(normalized).forEach(word =>
                stemmedSet.add(stemmer(word))
            );
        } else {
            const stemmed = stemmer(normalized);
            stemmedSet.add(stemmed);
            generateMetaphoneCodes(normalized).forEach(code =>
                metaphoneSet.add(code)
            );
        }
    });

    return { stemmed: stemmedSet, metaphones: metaphoneSet };
}

/**
 * Loads rules from JSON and preprocesses them (stemming, metaphone).
 */
export function loadAndPreprocessRules(filePath: string): ProcessedRule[] {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const rules: Rule[] = JSON.parse(rawData);

        const processedRules = rules.map(rule => {
            const keywords = processKeywords(rule.keywords);
            const phrases = processPhrases(rule.phrases);
            const exclusions = processExclusions(rule.exclusions);

            return {
                categoryName: rule.categoryName,
                stemmedKeywords: keywords.stemmed,
                metaphoneKeywords: keywords.metaphones,
                stemmedPhrases: phrases,
                stemmedExclusions: exclusions.stemmed,
                metaphoneExclusions: exclusions.metaphones,
                keywordWeight: rule.keywordWeight ?? 1.0,
                phraseWeight: rule.phraseWeight ?? (rule.keywordWeight ?? 1.0) * 2.0,
            };
        });

        console.log(`Loaded and processed ${processedRules.length} rules.`);
        return processedRules;

    } catch (error) {
        console.error(`Error loading or processing rules from ${filePath}:`, error);
        return [];
    }
}

/**
 * Preprocesses the input user request text.
 */
function preprocessText(inputText: string): ProcessedText {
    const normalized = normalizeText(inputText);
    const words = splitIntoWords(normalized);

    return {
        originalWords: words,
        stemmedWords: words.map(stemmer),
        metaphoneCodes: words.map(generateMetaphoneCodes),
    };
}

// --- Main Classification Function ---

/**
 * Classifies a user request string based on preprocessed rules.
 * @param userRequest The raw input string from the user.
 * @param classificationRules The preprocessed rules list.
 * @param minScoreThreshold Minimum score required for a category to be chosen.
 * @returns The name of the best matching category, or 'unknown'.
 */
export function classify(
    userRequest: string,
    classificationRules: ProcessedRule[],
    minScoreThreshold: number = 1.0
): string {
    if (!userRequest || classificationRules.length === 0) {
        return 'unknown';
    }

    const processedInput: ProcessedText = preprocessText(userRequest);
    const categoryScores: CategoryScores = initializeCategoryScores(classificationRules);

    for (const rule of classificationRules) {
        if (isTextExcludedByRule(processedInput, rule)) {
            continue;
        }

        const matchResults = calculateMatchScores(processedInput, rule);
        if (matchResults.keywordMatches > 0 || matchResults.phraseMatches > 0) {
            categoryScores[rule.categoryName] += matchResults.totalScore;
        }
    }

    return findBestCategory(categoryScores, minScoreThreshold);
}

function initializeCategoryScores(rules: ProcessedRule[]): CategoryScores {
    const scores: CategoryScores = {};
    rules.forEach(rule => {
        scores[rule.categoryName] = 0.0;
    });
    return scores;
}

function findBestCategory(categoryScores: CategoryScores, minScoreThreshold: number): string {
    let bestCategory = 'unknown';
    let highestScore = 0.0;

    for (const category in categoryScores) {
        if (categoryScores[category] > highestScore) {
            highestScore = categoryScores[category];
            bestCategory = category;
        }
    }

    return highestScore < minScoreThreshold ? 'unknown' : bestCategory;
}

function isTextExcludedByRule(processedInput: ProcessedText, rule: ProcessedRule): boolean {
    for (let i = 0; i < processedInput.stemmedWords.length; i++) {
        const stemmedWord = processedInput.stemmedWords[i];
        const wordMetaphones = processedInput.metaphoneCodes[i];

        if (rule.stemmedExclusions.has(stemmedWord)) {
            return true;
        }

        for (const meta of wordMetaphones) {
            if (rule.metaphoneExclusions.has(meta)) {
                return true;
            }
        }
    }
    return false;
}

function calculateMatchScores(processedInput: ProcessedText, rule: ProcessedRule): MatchResults {
    let keywordMatches = 0;
    let phraseMatches = 0;
    let totalScore = 0;

    // Score Keywords (Stemming and Metaphone)
    for (let i = 0; i < processedInput.stemmedWords.length; i++) {
        const stemmedWord = processedInput.stemmedWords[i];
        const wordMetaphones = processedInput.metaphoneCodes[i];

        if (isWordMatchingRule(stemmedWord, wordMetaphones, rule)) {
            totalScore += rule.keywordWeight;
            keywordMatches++;
        }
    }

    // Score Phrases (Stemming)
    const inputStems = processedInput.stemmedWords;
    for (const rulePhrase of rule.stemmedPhrases) {
        if (rulePhrase.length === 0 || rulePhrase.length > inputStems.length) continue;

        phraseMatches += countPhraseMatches(inputStems, rulePhrase);
    }

    totalScore += phraseMatches * rule.phraseWeight;

    return { keywordMatches, phraseMatches, totalScore };
}

function isWordMatchingRule(stemmedWord: string, wordMetaphones: Set<string>, rule: ProcessedRule): boolean {
    if (rule.stemmedKeywords.has(stemmedWord)) {
        return true;
    }

    for (const meta of wordMetaphones) {
        if (rule.metaphoneKeywords.has(meta)) {
            return true;
        }
    }

    return false;
}

function countPhraseMatches(inputStems: string[], rulePhrase: string[]): number {
    let matches = 0;
    for (let i = 0; i <= inputStems.length - rulePhrase.length; i++) {
        if (isPhraseMatchAtPosition(inputStems, rulePhrase, i)) {
            matches++;
        }
    }
    return matches;
}

function isPhraseMatchAtPosition(inputStems: string[], rulePhrase: string[], startIndex: number): boolean {
    for (let j = 0; j < rulePhrase.length; j++) {
        if (inputStems[startIndex + j] !== rulePhrase[j]) {
            return false;
        }
    }
    return true;
}