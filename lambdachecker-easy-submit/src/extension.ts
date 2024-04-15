// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface ProblemProps {
	title: string;
	description: string,
	skel: string
}

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "lambdachecker-easy-submit" is now active!');

	let disposable = vscode.commands.registerCommand('lambdachecker-easy-submit.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from LambdaChecker!');

		vscode.window.registerFileDecorationProvider({
			provideFileDecoration: (uri: vscode.Uri) => {
				const isFile = uri.scheme === 'file';
				return {
					badge: isFile ? '📁' : undefined,
					tooltip: isFile ? 'File' : undefined
				};
			}
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
