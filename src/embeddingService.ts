import * as vscode from 'vscode';
import { ApexChunk } from './apexChunker';
import { createEmbeddings } from './embeddingClient';
import {
  EmbeddedChunk,
  getCachedEmbedding,
  loadEmbeddingCache,
  saveEmbeddingCache,
  setCachedEmbedding
} from './embeddingCache';

const EMBEDDING_BATCH_SIZE = 50;

export interface EmbeddingBuildResult {
  embeddedChunks: EmbeddedChunk[];
  cachedCount: number;
  generatedCount: number;
}

export async function buildEmbeddings(
  context: vscode.ExtensionContext,
  chunks: ApexChunk[]
): Promise<EmbeddingBuildResult> {
  const cache = await loadEmbeddingCache(context);

  const embeddedChunks: EmbeddedChunk[] = [];
  const uncachedChunks: ApexChunk[] = [];

  for (const chunk of chunks) {
    const cachedEmbedding = getCachedEmbedding(cache, chunk);

    if (cachedEmbedding) {
      embeddedChunks.push({
        chunk,
        embedding: cachedEmbedding
      });
    } else {
      uncachedChunks.push(chunk);
    }
  }

  for (
    let start = 0;
    start < uncachedChunks.length;
    start += EMBEDDING_BATCH_SIZE
  ) {
    const batch = uncachedChunks.slice(
      start,
      start + EMBEDDING_BATCH_SIZE
    );

    const embeddings = await createEmbeddings(
      batch.map(chunk => buildEmbeddingText(chunk))
    );

    if (embeddings.length !== batch.length) {
      throw new Error(
        `Expected ${batch.length} embeddings but received ${embeddings.length}.`
      );
    }

    batch.forEach((chunk, index) => {
      const embedding = embeddings[index];

      if (!embedding) {
        throw new Error(`Missing embedding for ${chunk.name}.`);
      }

      setCachedEmbedding(cache, chunk, embedding);

      embeddedChunks.push({
        chunk,
        embedding
      });
    });
  }

  if (uncachedChunks.length > 0) {
    await saveEmbeddingCache(context, cache);
  }

  return {
    embeddedChunks,
    cachedCount: chunks.length - uncachedChunks.length,
    generatedCount: uncachedChunks.length
  };
}

function buildEmbeddingText(chunk: ApexChunk): string {
  return [
    `Name: ${chunk.name}`,
    `File: ${chunk.fileName}`,
    `Type: ${chunk.chunkType}`,
    '',
    chunk.content
  ].join('\n');
}