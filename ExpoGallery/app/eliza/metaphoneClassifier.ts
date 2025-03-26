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
function tokenize(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0); // Split by whitespace and remove empty strings
}

/**
 * Generates primary and secondary metaphone codes for a word.
 */
function getMetaphoneSet(word: string): Set<string> {
    const codes = doubleMetaphone(word);
    return new Set(codes.filter((code: string) => code)); // Filter out potential empty strings/nulls
}


/**
 * Loads rules from JSON and preprocesses them (stemming, metaphone).
 */
function loadAndPreprocessRules(filePath: string): ProcessedRule[] {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const rules: Rule[] = JSON.parse(rawData);
        const processedRules: ProcessedRule[] = [];

        for (const rule of rules) {
            const stemmedKeywords = new Set<string>();
            const metaphoneKeywords = new Set<string>();
            rule.keywords.forEach(kw => {
                const normalizedKw = normalizeText(kw);
                if (normalizedKw) {
                    const stemmed = stemmer(normalizedKw);
                    stemmedKeywords.add(stemmed);
                    getMetaphoneSet(normalizedKw).forEach(code => metaphoneKeywords.add(code));
                }
            });

            const stemmedPhrases: string[][] = [];
            (rule.phrases ?? []).forEach(phrase => {
                const normalizedPhrase = normalizeText(phrase);
                const words = tokenize(normalizedPhrase);
                if (words.length > 0) {
                    stemmedPhrases.push(words.map(stemmer));
                }
            });

            const stemmedExclusions = new Set<string>();
            const metaphoneExclusions = new Set<string>();
            (rule.exclusions ?? []).forEach(ex => {
                 const normalizedEx = normalizeText(ex);
                 if (normalizedEx) {
                     // Check if it's a multi-word exclusion (phrase) - simple check for space
                     if (normalizedEx.includes(' ')) {
                         // For simplicity, treat multi-word exclusions like phrases - stem words
                         // A more complex system could handle phrase exclusions differently
                         tokenize(normalizedEx).forEach(word => stemmedExclusions.add(stemmer(word)));
                     } else {
                         // Single word exclusion
                         const stemmed = stemmer(normalizedEx);
                         stemmedExclusions.add(stemmed);
                         getMetaphoneSet(normalizedEx).forEach(code => metaphoneExclusions.add(code));
                     }
                 }
            });


            processedRules.push({
                categoryName: rule.categoryName,
                stemmedKeywords: stemmedKeywords,
                metaphoneKeywords: metaphoneKeywords,
                stemmedPhrases: stemmedPhrases,
                stemmedExclusions: stemmedExclusions,
                metaphoneExclusions: metaphoneExclusions,
                keywordWeight: rule.keywordWeight ?? 1.0, // Default weight
                phraseWeight: rule.phraseWeight ?? (rule.keywordWeight ?? 1.0) * 2.0, // Default phrase weight (e.g., 2x keyword weight)
            });
        }
        console.log(`Loaded and processed ${processedRules.length} rules.`);
        return processedRules;

    } catch (error) {
        console.error(`Error loading or processing rules from ${filePath}:`, error);
        return []; // Return empty array on error
    }
}


/**
 * Preprocesses the input user request text.
 */
function preprocessText(inputText: string): ProcessedText {
    const normalized = normalizeText(inputText);
    const words = tokenize(normalized);
    const stemmedWords: string[] = [];
    const metaphoneCodes: Set<string>[] = [];

    words.forEach(word => {
        stemmedWords.push(stemmer(word));
        metaphoneCodes.push(getMetaphoneSet(word));
    });

    return {
        originalWords: words,
        stemmedWords: stemmedWords,
        metaphoneCodes: metaphoneCodes,
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

    // 1. Preprocess input
    const processedInput: ProcessedText = preprocessText(userRequest);

    // 2. Initialize scores
    const categoryScores: CategoryScores = {};
    classificationRules.forEach(rule => {
        categoryScores[rule.categoryName] = 0.0;
    });

    // 3. Calculate scores
    for (const rule of classificationRules) {
        let currentScore = 0.0;
        let isExcluded = false;

        // Check Exclusions
        // Simple exclusion: if any input word matches an exclusion term (stemmed or metaphone)
        for (let i = 0; i < processedInput.stemmedWords.length; i++) {
            const stemmedWord = processedInput.stemmedWords[i];
            const wordMetaphones = processedInput.metaphoneCodes[i];

            if (rule.stemmedExclusions.has(stemmedWord)) {
                isExcluded = true;
                break;
            }
            for (const meta of wordMetaphones) {
                if (rule.metaphoneExclusions.has(meta)) {
                    isExcluded = true;
                    break;
                }
            }
            if (isExcluded) break;
        }
         // Note: Phrase exclusions are partly handled by stemming individual words above.
         // A more robust check could look for the exact stemmed exclusion phrase sequence.

        // Calculate score if not excluded
        if (!isExcluded) {
            let keywordMatches = 0;
            // Score Keywords (Stemming and Metaphone)
            for (let i = 0; i < processedInput.stemmedWords.length; i++) {
                const stemmedWord = processedInput.stemmedWords[i];
                const wordMetaphones = processedInput.metaphoneCodes[i];
                let wordMatched = false;

                if (rule.stemmedKeywords.has(stemmedWord)) {
                    wordMatched = true;
                } else {
                    for (const meta of wordMetaphones) {
                        if (rule.metaphoneKeywords.has(meta)) {
                            wordMatched = true;
                            break;
                        }
                    }
                }

                if (wordMatched) {
                    currentScore += (1.0 * rule.keywordWeight);
                    keywordMatches++;
                }
            }

            // Score Phrases (Stemming)
            let phraseMatches = 0;
            const inputStems = processedInput.stemmedWords;
            for (const rulePhrase of rule.stemmedPhrases) {
                if (rulePhrase.length === 0 || rulePhrase.length > inputStems.length) continue;

                for (let i = 0; i <= inputStems.length - rulePhrase.length; i++) {
                    let match = true;
                    for (let j = 0; j < rulePhrase.length; j++) {
                        if (inputStems[i + j] !== rulePhrase[j]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        currentScore += (1.0 * rule.phraseWeight);
                        phraseMatches++;
                        // Optional: break after first match of this phrase? Or allow multiple?
                        // Current allows multiple occurrences of the same phrase to score.
                        // Break here if only one match per phrase type should count:
                        // break;
                    }
                }
            }
             // Add score to the category (only if there were matches)
            if(keywordMatches > 0 || phraseMatches > 0) {
                 categoryScores[rule.categoryName] += currentScore;
            }
        }
    }

    // 4. Determine best category
    let bestCategory = 'unknown';
    let highestScore = 0.0; // Use 0 as initial highest score

    for (const category in categoryScores) {
        if (categoryScores[category] > highestScore) {
            highestScore = categoryScores[category];
            bestCategory = category;
        }
    }

    // 5. Apply threshold
    if (highestScore < minScoreThreshold) {
        return 'unknown';
    } else {
        return bestCategory;
    }
}