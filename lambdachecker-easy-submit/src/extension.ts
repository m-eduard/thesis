// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LambdaChecker } from "./commands";
import { StatusBar, Storage } from "./models";
import {
  ContestDataProvider,
  ProblemDataProvider,
  ProblemItem,
} from "./treeview";
import { ProblemWebviewSerializer } from "./webview";

interface ProblemProps {
  title: string;
  description: string;
  skel: string;
}

export async function activate(context: vscode.ExtensionContext) {
  try {
    Storage.setContext(context);

    let disposable = vscode.commands.registerCommand(
      "lambdachecker-easy-submit.helloWorld",
      () => {
        vscode.window.showInformationMessage("Hello World from LambdaChecker!");

        vscode.window.registerFileDecorationProvider({
          provideFileDecoration: (uri: vscode.Uri) => {
            const isFile = uri.scheme === "file";
            return {
              badge: isFile ? "📁" : undefined,
              tooltip: isFile ? "File" : undefined,
            };
          },
        });
      }
    );
    context.subscriptions.push(disposable);

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "lambdachecker.login",
        LambdaChecker.login
      ),
      vscode.commands.registerCommand(
        "lambdachecker.view-problem",
        (item: ProblemItem) => LambdaChecker.viewProblem(item)
      )
    );
    context.subscriptions.push(StatusBar.statusBarItem);

    vscode.window.registerWebviewPanelSerializer(
      "lambdachecker.webview",
      new ProblemWebviewSerializer()
    );

    const loggedInUsername = await LambdaChecker.getLoginStatus();
    if (loggedInUsername !== undefined) {
      StatusBar.updateStatus(loggedInUsername);

      const contestsTreeView = vscode.window.createTreeView(
        "lambdachecker.contests",
        {
          treeDataProvider: new ContestDataProvider(LambdaChecker.client),
        }
      );

      const problemsTreeView = vscode.window.createTreeView(
        "lambdachecker.problems",
        {
          treeDataProvider: new ProblemDataProvider(LambdaChecker.client),
        }
      );
    } else {
      StatusBar.updateStatus();
    }
  } catch (error) {
    console.error(error);
  }
}

export function deactivate() {}
