import * as vscode from 'vscode';
import { ApexChunk } from './apexChunker';

const CACHE_KEY = 'salesforceRag.indexCache.v2';

export interface CachedIndex {
  createdAt: string;
  workspaceName: string;
  chunks: ApexChunk[];
}

export async function saveIndexCache(
  context: vscode.ExtensionContext,
  chunks: ApexChunk[]
): Promise<void> {
  const cache: CachedIndex = {
    createdAt: new Date().toISOString(),
    workspaceName: vscode.workspace.name || 'unknown',
    chunks
  };

  await context.workspaceState.update(CACHE_KEY, cache);
}

export function loadIndexCache(
  context: vscode.ExtensionContext
): CachedIndex | undefined {
  return context.workspaceState.get<CachedIndex>(CACHE_KEY);
}

export async function clearIndexCache(
  context: vscode.ExtensionContext
): Promise<void> {
  await context.workspaceState.update(CACHE_KEY, undefined);
}