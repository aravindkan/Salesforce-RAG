import * as vscode from 'vscode';

export type CredentialProvider = 'openai' | 'claude';

const OPENAI_SECRET_KEY = 'salesforceRag.openaiApiKey';
const ANTHROPIC_SECRET_KEY = 'salesforceRag.anthropicApiKey';

let secretStorage: vscode.SecretStorage | undefined;

export function initializeCredentialManager(
  context: vscode.ExtensionContext
): void {
  secretStorage = context.secrets;
}

export async function getApiKey(
  provider: CredentialProvider
): Promise<string | undefined> {
  const storage = getSecretStorage();

  if (provider === 'openai') {
    return storage.get(OPENAI_SECRET_KEY);
  }

  return storage.get(ANTHROPIC_SECRET_KEY);
}

export async function saveApiKey(
  provider: CredentialProvider,
  apiKey: string
): Promise<void> {
  const storage = getSecretStorage();

  const normalizedKey = apiKey.trim();

  if (!normalizedKey) {
    throw new Error('API key cannot be empty.');
  }

  const key =
    provider === 'openai'
      ? OPENAI_SECRET_KEY
      : ANTHROPIC_SECRET_KEY;

  await storage.store(key, normalizedKey);
}

export async function deleteApiKey(
  provider: CredentialProvider
): Promise<void> {
  const storage = getSecretStorage();

  const key =
    provider === 'openai'
      ? OPENAI_SECRET_KEY
      : ANTHROPIC_SECRET_KEY;

  await storage.delete(key);
}

export async function hasStoredApiKey(
  provider: CredentialProvider
): Promise<boolean> {
  const storage = getSecretStorage();

  const key =
    provider === 'openai'
      ? OPENAI_SECRET_KEY
      : ANTHROPIC_SECRET_KEY;

  return Boolean(await storage.get(key));
}

function getSecretStorage(): vscode.SecretStorage {
  if (!secretStorage) {
    throw new Error(
      'Credential manager has not been initialized.'
    );
  }

  return secretStorage;
}