import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

type LLMProvider = 'openai' | 'claude';

const provider: LLMProvider =
  (process.env.SF_RAG_LLM_PROVIDER as LLMProvider) || 'openai';

export function getLLMProvider(): string {
  return provider;
}

export async function askLLM(prompt: string): Promise<string> {
  if (provider === 'claude') {
    return askClaude(prompt);
  }

  return askOpenAI(prompt);
}

async function askOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'Missing OPENAI_API_KEY environment variable.';
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt
  });

  return response.output_text;
}

async function askClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return 'Missing ANTHROPIC_API_KEY environment variable.';
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');
}