import * as vscode from 'vscode';
import { createHash } from 'crypto';
import { ApexChunk } from './apexChunker';

const CACHE_FILE_NAME = 'embedding-cache.json';
const CACHE_VERSION = 1;
const EMBEDDING_MODEL = 'text-embedding-3-small';

export interface EmbeddedChunk {
  chunk: ApexChunk;
  embedding: number[];
}

interface StoredEmbedding {
  embedding: number[];
  contentHash: string;
}

interface EmbeddingCacheFile {
  version: number;
  model: string;
  entries: Record<string, StoredEmbedding>;
}

function createEmptyCache(): EmbeddingCacheFile {
  return {
    version: CACHE_VERSION,
    model: EMBEDDING_MODEL,
    entries: {}
  };
}

function getChunkKey(chunk: ApexChunk): string {
  return [
    chunk.filePath,
    chunk.chunkType,
    chunk.name
  ].join('::');
}

export function createChunkHash(chunk: ApexChunk): string {
  return createHash('sha256')
    .update(chunk.content, 'utf8')
    .digest('hex');
}

async function getCacheUri(
  context: vscode.ExtensionContext
): Promise<vscode.Uri> {
  if (!context.storageUri) {
    throw new Error(
      'Embedding cache is unavailable because no workspace folder is open.'
    );
  }

  await vscode.workspace.fs.createDirectory(context.storageUri);

  return vscode.Uri.joinPath(
    context.storageUri,
    CACHE_FILE_NAME
  );
}

export async function loadEmbeddingCache(
  context: vscode.ExtensionContext
): Promise<EmbeddingCacheFile> {
  const cacheUri = await getCacheUri(context);

  try {
    const bytes = await vscode.workspace.fs.readFile(cacheUri);
    const parsed = JSON.parse(
      Buffer.from(bytes).toString('utf8')
    ) as EmbeddingCacheFile;

    if (
      parsed.version !== CACHE_VERSION ||
      parsed.model !== EMBEDDING_MODEL
    ) {
      return createEmptyCache();
    }

    return parsed;
  } catch (error) {
    if (
      error instanceof vscode.FileSystemError &&
      error.code === 'FileNotFound'
    ) {
      return createEmptyCache();
    }

    throw error;
  }
}

export async function saveEmbeddingCache(
  context: vscode.ExtensionContext,
  cache: EmbeddingCacheFile
): Promise<void> {
  const cacheUri = await getCacheUri(context);

  const contents = Buffer.from(
    JSON.stringify(cache),
    'utf8'
  );

  await vscode.workspace.fs.writeFile(cacheUri, contents);
}

export function getCachedEmbedding(
  cache: EmbeddingCacheFile,
  chunk: ApexChunk
): number[] | undefined {
  const key = getChunkKey(chunk);
  const entry = cache.entries[key];
  const currentHash = createChunkHash(chunk);

  if (!entry || entry.contentHash !== currentHash) {
    return undefined;
  }

  return entry.embedding;
}

export function setCachedEmbedding(
  cache: EmbeddingCacheFile,
  chunk: ApexChunk,
  embedding: number[]
): void {
  const key = getChunkKey(chunk);

  cache.entries[key] = {
    embedding,
    contentHash: createChunkHash(chunk)
  };
}

export async function clearEmbeddingCache(
  context: vscode.ExtensionContext
): Promise<void> {
  const cacheUri = await getCacheUri(context);

  try {
    await vscode.workspace.fs.delete(cacheUri);
  } catch (error) {
    if (
      error instanceof vscode.FileSystemError &&
      error.code === 'FileNotFound'
    ) {
      return;
    }

    throw error;
  }
}