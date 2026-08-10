import { ApexChunk } from './apexChunker';
import { searchIndexWithScores } from './ragIndex';
import { SemanticMatch } from './semanticSearch';

export interface HybridMatch {
  chunk: ApexChunk;
  semanticScore: number;
  keywordScore: number;
  hybridScore: number;
}

export function hybridSearch(
  query: string,
  semanticMatches: SemanticMatch[],
  limit = 5
): HybridMatch[] {
  const keywordMatches = searchIndexWithScores(query, 20);

  const keywordScoreMap = new Map<string, number>();

  for (const match of keywordMatches) {
    keywordScoreMap.set(
      createChunkKey(match.chunk),
      match.score
    );
  }

  const maxKeywordScore = Math.max(
    ...keywordMatches.map(match => match.score),
    1
  );

  return semanticMatches
    .map(match => {
      const key = createChunkKey(match.chunk);

      const rawKeywordScore =
        keywordScoreMap.get(key) ?? 0;

      const normalizedKeywordScore =
        rawKeywordScore / maxKeywordScore;

      const normalizedSemanticScore =
        normalizeSemanticScore(match.score);

      const hybridScore =
        (normalizedSemanticScore * 0.7) +
        (normalizedKeywordScore * 0.3);

      return {
        chunk: match.chunk,
        semanticScore: match.score,
        keywordScore: rawKeywordScore,
        hybridScore
      };
    })
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, limit);
}

function normalizeSemanticScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}

function createChunkKey(chunk: ApexChunk): string {
  return [
    chunk.filePath,
    chunk.chunkType,
    chunk.name
  ].join('::');
}