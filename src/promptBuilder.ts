import { ApexChunk } from './apexChunker';

export function buildPrompt(question: string, matches: ApexChunk[]): string {
  const context = matches
    .map((chunk, index) => {
      return [
        `SOURCE ${index + 1}`,
        `Name: ${chunk.name}`,
        `File: ${chunk.fileName}`,
        `Type: ${chunk.chunkType}`,
        'Code:',
        chunk.content
      ].join('\n');
    })
    .join('\n\n---\n\n');

  return [
    'You are a Salesforce Apex code assistant.',
    'Answer the user question using only the provided Apex code context.',
    'If the answer is not clear from the context, say that the provided code does not show enough information.',
    '',
    `User question: ${question}`,
    '',
    'Apex code context:',
    context
  ].join('\n');
}