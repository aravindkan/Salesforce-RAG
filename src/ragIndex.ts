import { ApexChunk } from './apexChunker';

let index: ApexChunk[] = [];

export function buildIndex(chunks: ApexChunk[]): void {
  index = chunks;
}

export function getIndex(): ApexChunk[] {
  return index;
}

export function searchIndex(query: string, limit = 5): ApexChunk[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  return index
    .map(chunk => ({
      chunk,
      score: scoreChunk(chunk, words)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);
}

function scoreChunk(chunk: ApexChunk, words: string[]): number {
  let score = 0;

  const name = chunk.name.toLowerCase();
  const parentName = chunk.parentName?.toLowerCase() ?? '';
  const signature = chunk.signature?.toLowerCase() ?? '';
  const fileName = chunk.fileName.toLowerCase();
  const content = chunk.content.toLowerCase();

  for (const word of words) {
    if (name.includes(word)) {
      score += 10;
    }

    if (parentName.includes(word)) {
      score += 8;
    }

    if (signature.includes(word)) {
      score += 6;
    }

    if (fileName.includes(word)) {
      score += 5;
    }

    if (content.includes(word)) {
      score += 2;
    }
  }

  if (chunk.chunkType === 'method') {
    score += 3;
  }

  if (chunk.chunkType === 'trigger') {
    score += 2;
  }

  return score;
}