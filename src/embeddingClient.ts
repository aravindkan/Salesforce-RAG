import OpenAI from 'openai';
import { getApiKey } from './credentialManager';
const EMBEDDING_MODEL = 'text-embedding-3-small';

export async function createEmbedding(text: string): Promise<number[]> {
  const apiKey = await getApiKey('openai');

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Set it in Salesforce RAG settings.');
  }

  const openai = new OpenAI({ apiKey });

  const normalizedText = text.replace(/\s+/g, ' ').trim();

  if (!normalizedText) {
    throw new Error('Cannot create an embedding for empty text.');
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalizedText,
    encoding_format: 'float'
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error('OpenAI did not return an embedding.');
  }

  return embedding;
}

export async function createEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const apiKey = await getApiKey('openai');

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Set it in Salesforce RAG settings.');
  }

  const normalizedTexts = texts.map(text => text.replace(/\s+/g, ' ').trim());

  if (normalizedTexts.some(text => !text)) {
    throw new Error('Cannot create embeddings for empty text.');
  }

  const openai = new OpenAI({ apiKey });

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalizedTexts,
    encoding_format: 'float'
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map(item => item.embedding);
}