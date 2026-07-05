import { SalesforceDocument } from './salesforceScanner';

export type ApexChunk = {
  fileName: string;
  filePath: string;
  metadataType: string;
  chunkType: 'file' | 'class' | 'method' | 'trigger';
  name: string;
  content: string;
};

export function chunkApexDocuments(docs: SalesforceDocument[]): ApexChunk[] {
  const chunks: ApexChunk[] = [];

  for (const doc of docs) {
    if (doc.metadataType === 'Apex Trigger') {
      chunks.push({
        fileName: doc.fileName,
        filePath: doc.filePath,
        metadataType: doc.metadataType,
        chunkType: 'trigger',
        name: doc.fileName.replace(/\.trigger$/i, ''),
        content: doc.content
      });
      continue;
    }

    chunks.push(...chunkApexClass(doc));
  }

  return chunks;
}

function chunkApexClass(doc: SalesforceDocument): ApexChunk[] {
  const chunks: ApexChunk[] = [];
  const className = doc.fileName.replace(/\.cls$/i, '');

  chunks.push({
    fileName: doc.fileName,
    filePath: doc.filePath,
    metadataType: doc.metadataType,
    chunkType: 'class',
    name: className,
    content: getClassHeader(doc.content)
  });

  const methodRegex =
    /(?:public|private|protected|global)\s+(?:static\s+)?[\w<>,\s\[\]]+\s+(\w+)\s*\([^)]*\)\s*\{/g;

  let match: RegExpExecArray | null;

  while ((match = methodRegex.exec(doc.content)) !== null) {
    const methodName = match[1];
    const startIndex = match.index;
    const endIndex = findMatchingBrace(doc.content, doc.content.indexOf('{', startIndex));

    if (endIndex > startIndex) {
      chunks.push({
        fileName: doc.fileName,
        filePath: doc.filePath,
        metadataType: doc.metadataType,
        chunkType: 'method',
        name: `${className}.${methodName}`,
        content: doc.content.substring(startIndex, endIndex + 1)
      });
    }
  }

  return chunks;
}

function getClassHeader(content: string): string {
  const firstBrace = content.indexOf('{');
  return firstBrace >= 0 ? content.substring(0, firstBrace + 1) : content.substring(0, 500);
}

function findMatchingBrace(content: string, openBraceIndex: number): number {
  let depth = 0;

  for (let i = openBraceIndex; i < content.length; i++) {
    if (content[i] === '{') {
      depth++;
    } else if (content[i] === '}') {
      depth--;

      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}