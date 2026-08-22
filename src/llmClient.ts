import * as vscode from 'vscode';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getApiKey } from './credentialManager';

type LLMProvider = 'openai' | 'claude';

export function getLLMProvider(): LLMProvider {
  return vscode.workspace
    .getConfiguration('salesforceRag')
    .get<LLMProvider>('llmProvider', 'openai');
}

export async function askLLM(prompt: string): Promise<string> {
  const provider = getLLMProvider();

  if (provider === 'claude') {
    return askClaude(prompt);
  }

  return askOpenAI(prompt);
}

async function askOpenAI(prompt: string): Promise<string> {
  const apiKey = await getApiKey('openai');

  if (!apiKey) {
    throw new Error(
      'OpenAI API key is not configured. Set it in Salesforce RAG settings.'
    );
  }

  const openai = new OpenAI({
    apiKey
  });

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt
  });

  return response.output_text;
}

async function askClaude(prompt: string): Promise<string> {
  const apiKey = await getApiKey('claude');

  if (!apiKey) {
    throw new Error(
      'Anthropic API key is not configured. Set it in Salesforce RAG settings.'
    );
  }

  const anthropic = new Anthropic({
    apiKey
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');
}