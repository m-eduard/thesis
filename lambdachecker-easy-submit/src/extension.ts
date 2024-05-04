// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LambdaChecker } from "./lambdaChecker";
import { Storage } from "./storage";
import StatusBar from "./ui/statusBar";
import ContestDataProvider from "./ui/fileSystem/contestDataProvider";
import ProblemDataProvider from "./ui/fileSystem/problemDataProvider";

interface ProblemProps {
  title: string;
  description: string;
  skel: string;
}

export async function activate(context: vscode.ExtensionContext) {
  Storage.setContext(context);

  console.log(
    'Congratulations, your extension "lambdachecker-easy-submit" is now active!'
  );

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

  let submitCmd = vscode.commands.registerCommand(
    "lambdachecker.submit",
    () => {
      vscode.window.showInformationMessage("Submitting the problem!");
    }
  );

  context.subscriptions.push(submitCmd);

  context.subscriptions.push(
    vscode.commands.registerCommand("lambdachecker.login", () => {
      LambdaChecker.loginUi();
      LambdaChecker.contestsUi();
    })
  );

  context.subscriptions.push(StatusBar.statusBarItem);
  StatusBar.updateStatus();

  const loggedInUsername = await LambdaChecker.getLoginStatus();

  if (loggedInUsername !== undefined) {
    vscode.window.showInformationMessage("Already logged in!");
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
  }
}

export function deactivate() {}
