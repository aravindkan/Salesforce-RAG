import { CopilotIntent } from "../intents/intentTypes";

export interface PromptContext {
    question: string;
    retrievedContext: string;
}

export interface PromptTemplate {
    intent: CopilotIntent;
    build(context: PromptContext): string;
}