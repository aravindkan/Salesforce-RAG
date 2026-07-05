import * as vscode from 'vscode';

export type SalesforceDocument = {
  fileName: string;
  filePath: string;
  metadataType: string;
  content: string;
};

export async function scanSalesforceProject(): Promise<SalesforceDocument[]> {
  const files = await vscode.workspace.findFiles(
    '**/force-app/main/default/{classes,triggers}/*.{cls,trigger}',
    '**/node_modules/**'
  );

  const docs: SalesforceDocument[] = [];

  for (const file of files) {
    const bytes = await vscode.workspace.fs.readFile(file);
    const content = Buffer.from(bytes).toString('utf8');

    docs.push({
      fileName: file.path.split('/').pop() ?? 'Unknown',
      filePath: file.fsPath,
      metadataType: file.path.endsWith('.trigger') ? 'Apex Trigger' : 'Apex Class',
      content
    });
  }

  return docs;
}