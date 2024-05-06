import * as vscode from "vscode";
import { getProblemWebviewContent } from "../models";

export class ProblemWebviewSerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    webviewPanel.webview.html = getProblemWebviewContent(state);
  }
}
