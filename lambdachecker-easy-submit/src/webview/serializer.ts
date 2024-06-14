import * as vscode from "vscode";
import { LambdaChecker } from "../commands";
import { SpecificProblem, getProblemWebviewContent } from "../models";
import { getProblemHTML } from "../models/webview/htmlTemplates";
import { ProblemWebview } from "./problemWebview";

export class ProblemWebviewSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const problem: SpecificProblem = state.problem;
    const contestId: number | undefined = state.contestId;
    const contestName: string | undefined = state.contestName;

    const problemWebview = new ProblemWebview(problem, webviewPanel);

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      problemWebview.webviewListener(message);
    });

    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "problemView.js"
    );
    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "problemView.css"
    );

    webviewPanel.webview.html = getProblemHTML(
      webviewPanel.webview.asWebviewUri(scriptsPath),
      webviewPanel.webview.asWebviewUri(stylesPath),
      problem,
      contestId,
      contestName
    );
  }
}
