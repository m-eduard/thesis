import * as vscode from "vscode";
import { Problem, getProblemWebviewContent } from "../models";
import { ProblemWebview } from "./problemWebview";

export class ProblemWebviewSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const problem: Required<Problem> = state;

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      const problemWebview = new ProblemWebview(problem);
      problemWebview.webviewListener(message);
    });
    webviewPanel.webview.html = getProblemWebviewContent(problem);
  }
}
