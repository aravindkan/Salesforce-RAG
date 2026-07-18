import { PromptTemplate } from "./promptTypes";

export const SearchPrompt: PromptTemplate = {
    intent: "search",

    build(context) {
        return `
You are an expert Salesforce software engineer.

Your goal is to locate where the requested functionality exists.

User Question:
${context.question}

Relevant Code:
${context.retrievedContext}

Instructions:

- Identify the most relevant class or trigger.
- Mention important methods.
- Keep the answer concise.
- Do not speculate beyond the retrieved context.
`;
    }
};

export const ExplainPrompt: PromptTemplate = {
    intent: "explain",

    build(context) {
        return `
You are an expert Salesforce software engineer.

Your goal is to explain how the retrieved code works.

User Question:
${context.question}

Relevant Code:
${context.retrievedContext}

Instructions:

- Explain the execution flow.
- Describe important methods.
- Explain business logic.
- Mention relationships between classes.
- Avoid speculation.
`;
    }
};