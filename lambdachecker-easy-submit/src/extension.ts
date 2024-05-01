// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LambdaChecker } from './lambdaChecker';
import { Storage } from './storage';
import StatusBar from './ui/statusBar';

interface ProblemProps {
	title: string;
	description: string,
	skel: string
}

export async function activate(context: vscode.ExtensionContext) {
	Storage.setContext(context);

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

	let submitCmd = vscode.commands.registerCommand('lambdachecker.submit', () => {
		vscode.window.showInformationMessage('Submitting the problem!');
	});

	context.subscriptions.push(submitCmd);

	context.subscriptions.push(
		vscode.commands.registerCommand('lambdachecker.login', () => {
			LambdaChecker.loginUi();
		})
	);

	context.subscriptions.push(StatusBar.statusBarItem);
	StatusBar.updateStatus();

	const loggedInUsername = await LambdaChecker.getLoginStatus();

	if (loggedInUsername !== undefined) {
		vscode.window.showInformationMessage("Already logged in!");
		vscode.window.registerTreeDataProvider('lambdachecker.problems', new TreeDataProvider());

		StatusBar.updateStatus(loggedInUsername);
	}
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
	onDidChangeTreeData?: vscode.Event<TreeItem|null|undefined>|undefined;
  
	data: TreeItem[];
  
	constructor() {
	  this.data = [new TreeItem('cars', [
		new TreeItem(
			'Ford', [new TreeItem('Fiesta'), new TreeItem('Focus'), new TreeItem('Mustang')]),
		new TreeItem(
			'BMW', [new TreeItem('320'), new TreeItem('X3'), new TreeItem('X5')])
	  ])];
	}
  
	getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
	  return element;
	}
  
	getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
	  if (element === undefined) {
		return this.data;
	  }
	  return element.children;
	}
  }
  
  class TreeItem extends vscode.TreeItem {
	children: TreeItem[]|undefined;
  
	constructor(label: string, children?: TreeItem[]) {
	  super(
		  label,
		  children === undefined ? vscode.TreeItemCollapsibleState.None :
								   vscode.TreeItemCollapsibleState.Expanded);
	  this.children = children;
	}
  }

// This method is called when your extension is deactivated
export function deactivate() {}
