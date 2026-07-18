import { CopilotIntent } from "../intents/intentTypes";
import { SearchPrompt, ExplainPrompt } from "./promptTemplates";
import { PromptContext } from "./promptTypes";

export function buildIntentPrompt(
    intent: CopilotIntent,
    context: PromptContext
): string {

    switch (intent) {

        case "search":
            return SearchPrompt.build(context);

        case "explain":
            return ExplainPrompt.build(context);

        default:
            return ExplainPrompt.build(context);
    }
}