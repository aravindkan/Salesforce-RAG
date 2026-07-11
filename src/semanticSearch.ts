import { ApexChunk } from './apexChunker';
import { createEmbedding } from './embeddingClient';
import { EmbeddedChunk } from './embeddingCache';

export interface SemanticMatch {
  chunk: ApexChunk;
  score: number;
}

export async function semanticSearch(
  question: string,
  embeddedChunks: EmbeddedChunk[],
  limit = 5
): Promise<SemanticMatch[]> {
  if (!question.trim() || embeddedChunks.length === 0) {
    return [];
  }

  const questionEmbedding = await createEmbedding(question);

  return embeddedChunks
    .map(item => ({
      chunk: item.chunk,
      score: cosineSimilarity(questionEmbedding, item.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error('Embedding vectors must have the same non-zero length.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index++) {
    const valueA = vectorA[index] ?? 0;
    const valueB = vectorB[index] ?? 0;

    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  return denominator === 0 ? 0 : dotProduct / denominator;
}