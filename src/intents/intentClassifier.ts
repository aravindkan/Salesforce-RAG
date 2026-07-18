import { IntentResult } from "./intentTypes";

const SEARCH_SIGNALS = [
    "where",
    "find",
    "locate",
    "which class",
    "which method",
    "which file",
    "references",
    "used in"
];

const EXPLAIN_SIGNALS = [
    "explain",
    "how does",
    "how is",
    "what does",
    "why does",
    "describe",
    "walk me through"
];

function findMatchedSignals(
    question: string,
    signals: string[]
): string[] {
    return signals.filter((signal) => question.includes(signal));
}

export function classifyIntent(question: string): IntentResult {
    const normalizedQuestion = question
        .toLowerCase()
        .trim();

    const searchMatches = findMatchedSignals(
        normalizedQuestion,
        SEARCH_SIGNALS
    );

    const explainMatches = findMatchedSignals(
        normalizedQuestion,
        EXPLAIN_SIGNALS
    );

    if (searchMatches.length > explainMatches.length) {
        return {
            intent: "search",
            confidence: calculateConfidence(searchMatches.length),
            matchedSignals: searchMatches
        };
    }

    if (explainMatches.length > searchMatches.length) {
        return {
            intent: "explain",
            confidence: calculateConfidence(explainMatches.length),
            matchedSignals: explainMatches
        };
    }

    if (searchMatches.length > 0) {
        return {
            intent: "search",
            confidence: 0.6,
            matchedSignals: searchMatches
        };
    }

    return {
        intent: "unknown",
        confidence: 0,
        matchedSignals: []
    };
}

function calculateConfidence(matchCount: number): number {
    return Math.min(0.6 + matchCount * 0.15, 0.95);
}