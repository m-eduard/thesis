// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LambdaChecker } from "./commands";
import {
  EnrollmentStatus,
  SpecificProblem,
  StatusBar,
  Storage,
} from "./models";
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
    LambdaChecker.context = context;

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "lambdachecker.login",
        LambdaChecker.login
      ),
      vscode.commands.registerCommand(
        "lambdachecker.show-problem",
        (item: ProblemItem, contestId?: number) =>
          LambdaChecker.showProblem(item, contestId)
      ),
      vscode.commands.registerCommand(
        "lambdachecker.enroll-in-contest",
        LambdaChecker.enrollInContest
      ),
      vscode.commands.registerCommand(
        "lambdachecker.create-contest",
        LambdaChecker.createContest
      ),
      vscode.commands.registerCommand(
        "lambdachecker.create-problem",
        LambdaChecker.createProblem
      ),
      vscode.commands.registerCommand(
        "lambdachecker.edit-problem",
        (context: ProblemItem) => {
          console.log(context);
          return LambdaChecker.editProblem(
            context.props.problemMetadata as SpecificProblem
          );
        }
      )
    );
    context.subscriptions.push(StatusBar.statusBarItem);
    context.subscriptions.push(
      vscode.window.registerFileDecorationProvider({
        provideFileDecoration: (uri: vscode.Uri) => {
          if (uri.scheme !== "lambdachecker") {
            return;
          }

          console.log(uri);

          const queryParams = new URLSearchParams(uri.query);
          const isLockedContest =
            queryParams.get("status") === EnrollmentStatus.NOT_ENROLLED;

          return {
            badge: isLockedContest ? "🔒" : undefined,
            tooltip: isLockedContest ? "Locked" : undefined,
          };
        },
      })
    );

    vscode.window.registerWebviewPanelSerializer(
      "lambdachecker.webview",
      new ProblemWebviewSerializer()
    );

    const loggedInUsername = await LambdaChecker.getLoginStatus();
    if (loggedInUsername !== undefined) {
      StatusBar.updateStatus(loggedInUsername);

      const user = LambdaChecker.userDataCache.get("user") as unknown as Record<
        string,
        unknown
      >;

      // Update the role seen by the extension
      if (user["role"] === "teacher") {
        vscode.commands.executeCommand(
          "setContext",
          "lambdachecker.teacher",
          true
        );
      }

      const contestsTreeView = vscode.window.createTreeView(
        "lambdachecker.contests",
        {
          treeDataProvider: new ContestDataProvider(LambdaChecker.client),
          showCollapseAll: true,
        }
      );

      const problemsTreeView = vscode.window.createTreeView(
        "lambdachecker.problems",
        {
          treeDataProvider: new ProblemDataProvider(LambdaChecker.client),
          showCollapseAll: true,
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
