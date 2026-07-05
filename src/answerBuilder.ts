import { ApexChunk } from './apexChunker';

export function buildAnswer(question: string, matches: ApexChunk[]): string {
  if (matches.length === 0) {
    return `No matching Apex chunks found for: ${question}`;
  }

  const lines: string[] = [];

  lines.push(`Question: ${question}`);
  lines.push('');
  lines.push(`Found ${matches.length} relevant Apex chunks:`);
  lines.push('');

  matches.forEach((match, index) => {
    lines.push(`${index + 1}. ${match.name}`);
    lines.push(`   Type: ${match.chunkType}`);
    lines.push(`   File: ${match.fileName}`);
    lines.push(`   Characters: ${match.content.length}`);
    lines.push('');
  });

  return lines.join('\n');
}