// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { scanSalesforceProject } from './salesforceScanner';
import { chunkApexDocuments } from './apexChunker';
import { buildIndex, searchIndex } from './ragIndex';
import { extractKeywords } from "./questionParser";
import { buildIntentPrompt } from './prompts/promptFactory';
import { askLLM, getLLMProvider } from './llmClient';
import { buildEmbeddings } from './embeddingService';
import { semanticSearch } from './semanticSearch';
import { classifyIntent } from './intents/intentClassifier';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "salesforce-rag-agent-v2" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const output = vscode.window.createOutputChannel('Salesforce RAG v2');
	context.subscriptions.push(output);
	const disposable = vscode.commands.registerCommand('salesforce-rag-agent-v2.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const docs = await scanSalesforceProject();
		const chunks = chunkApexDocuments(docs);
		buildIndex(chunks);

		const question = await vscode.window.showInputBox({
    		prompt: "Ask a Salesforce question"
		});
		if (!question) {
    		return;
		}
		const intentResult = classifyIntent(question);
		output.clear();
		output.appendLine(`Question: ${question}`);
		output.appendLine('');
		output.appendLine(`Intent: ${intentResult.intent}`);
		output.appendLine(`Intent confidence: ${intentResult.confidence.toFixed(2)}`);
		output.appendLine(
    		`Matched signals: ${intentResult.matchedSignals.join(', ') || 'none'}`
		);
		output.appendLine('');
		output.appendLine('Preparing semantic index...');
		output.show();

		const embeddingResult = await buildEmbeddings(context, chunks);

		output.appendLine(
		`Embeddings: ${embeddingResult.cachedCount} cached, ` +
		`${embeddingResult.generatedCount} generated.`
		);
		output.appendLine('');
		output.appendLine('Searching semantically...');
		output.show();

		const semanticMatches = await semanticSearch(
		question,
		embeddingResult.embeddedChunks,
		5
		);

		let matches = semanticMatches.map(match => match.chunk);

		if (matches.length === 0) {
			const keywords = extractKeywords(question);
			matches = searchIndex(keywords.join(' '), 5);
		}
		const retrievedContext = matches
		.map(match => {
			return [
				`Source: ${match.name}`,
				`Type: ${match.chunkType}`,
				`File: ${match.fileName}`,
				match.content
			].join('\n');
		})
		.join('\n\n---\n\n');
		const prompt = buildIntentPrompt(intentResult.intent, {
			question,
			retrievedContext
		});

		output.clear();
		output.appendLine(`Question: ${question}`);
		output.appendLine('');
		output.appendLine(`Intent: ${intentResult.intent}`);
		output.appendLine(`Intent confidence: ${intentResult.confidence.toFixed(2)}`);
		output.appendLine(
    		`Matched signals: ${intentResult.matchedSignals.join(', ') || 'none'}`
		);
		output.appendLine('');
		output.appendLine('Thinking...');
		output.show();
		output.appendLine('');
		output.appendLine('Semantic matches:');
		for (const match of semanticMatches) {
			output.appendLine(
				`• ${match.chunk.name} — score ${match.score.toFixed(4)}`
			);
		}
		output.appendLine('');
		output.appendLine('Generating AI answer...');
		output.show();
		const response = await askLLM(prompt);
		output.clear();
		output.appendLine(`Question: ${question}`);
		output.appendLine('');
		output.appendLine(`Intent: ${intentResult.intent}`);
		output.appendLine(`Intent confidence: ${intentResult.confidence.toFixed(2)}`);
		output.appendLine(
    		`Matched signals: ${intentResult.matchedSignals.join(', ') || 'none'}`
		);
		output.appendLine('');
		output.appendLine(`Provider: ${getLLMProvider()}`);
		output.appendLine('');
		output.appendLine(`Embeddings: ${embeddingResult.cachedCount} cached, ` +
  			`${embeddingResult.generatedCount} generated`);
		output.appendLine('Semantic matches:');
		for (const match of semanticMatches) {
			output.appendLine(
				`• ${match.chunk.name} — ${match.score.toFixed(4)}`
			);
		}	
		output.appendLine('');
		output.appendLine('AI Answer:');
		output.appendLine(response);
		output.appendLine('');
		output.appendLine('Sources:');
		for (const match of matches) {
			output.appendLine(`• ${match.name} (${match.chunkType}) - ${match.fileName}`);
		}
		if (matches.length > 0) {
  			await openSource(matches[0]);
		}
		output.show();
	});

	context.subscriptions.push(disposable);
}
async function openSource(chunk: { filePath: string; content: string }) {
  const document = await vscode.workspace.openTextDocument(chunk.filePath);
  const editor = await vscode.window.showTextDocument(document);

  const firstLine = chunk.content.split('\n')[0].trim();
  const text = document.getText();
  const offset = text.indexOf(firstLine);

  if (offset >= 0) {
    const position = document.positionAt(offset);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
      new vscode.Range(position, position),
      vscode.TextEditorRevealType.InCenter
    );
  }
}
// This method is called when your extension is deactivated
export function deactivate() {}
