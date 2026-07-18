export type CopilotIntent =
    | "search"
    | "explain"
    | "unknown";

export interface IntentResult {
    intent: CopilotIntent;
    confidence: number;
    matchedSignals: string[];
}