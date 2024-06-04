import * as vscode from "vscode";
import { SpecificProblem, getProblemWebviewContent } from "../models";
import { getProblemHTML } from "../models/webview/htmlTemplates";
import { ProblemWebview } from "./problemWebview";

export class ProblemWebviewSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const problem: SpecificProblem = state;

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      const problemWebview = new ProblemWebview(problem, webviewPanel);
      problemWebview.webviewListener(message);
    });
    webviewPanel.webview.html = getProblemHTML(problem);
  }
}
