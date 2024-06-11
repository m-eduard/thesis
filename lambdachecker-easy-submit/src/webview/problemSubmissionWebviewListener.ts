import * as vscode from "vscode";
import { LambdaChecker } from "../commands";
import {
  Language,
  ProblemSubmissionWebviewMessage,
  ProblemTest,
  SubmissionResult,
  getSubmissionResultWebviewContent,
} from "../models";
import { getSubmissionsTableHTML } from "../models/webview/htmlTemplates";
import { SubmissionFile } from "../storage";

export class ProblemSubmissionWebviewListener {
  public submissionFile: SubmissionFile;
  public allSubmissions: SubmissionResult[] = [];
  private stylesUri: vscode.Uri;
  private scriptsUri: vscode.Uri;

  constructor(
    public problemId: number,
    problemName: string,
    problemLanguage: Language,
    problemCode: string,
    public panel: vscode.WebviewPanel,
    public problemTests: ProblemTest[]
  ) {
    this.submissionFile = new SubmissionFile(
      problemId,
      problemName,
      problemLanguage,
      problemCode
    );

    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "submissionView.css"
    );

    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "submissionView.js"
    );

    this.stylesUri = this.panel.webview.asWebviewUri(stylesPath);
    this.scriptsUri = this.panel.webview.asWebviewUri(scriptsPath);
  }

  async webviewListener(message: ProblemSubmissionWebviewMessage) {
    const getSubmissionsSafe = async () => {
      return LambdaChecker.client
        .getSubmissions(this.problemId)
        .catch((error) => {
          vscode.window.showErrorMessage(error.message);
          return [] as SubmissionResult[];
        });
    };

    switch (message.action) {
      case "copy-code":
        this.submissionFile.openInEditor(true);
        break;
      case "view-all-submissions":
        // Second, when the current batch is ready, replace the
        // old HTML content with this one
        getSubmissionsSafe().then((submissions) => {
          this.allSubmissions = submissions;
          this.panel.webview.html = getSubmissionsTableHTML(
            this.allSubmissions,
            this.problemTests
          );
        });

        // First, show the old batch of submissions
        this.panel.webview.html = getSubmissionsTableHTML(
          this.allSubmissions,
          this.problemTests
        );

        break;
      case "view-submission":
        this.panel.webview.html = getSubmissionResultWebviewContent(
          this.stylesUri,
          this.scriptsUri,
          this.allSubmissions[message.submissionIdx!],
          this.problemTests
        );
        this.panel.webview.postMessage({ command: "reset-cursor" });

        // Update the code stored for the current submission
        this.submissionFile.problemSkel =
          this.allSubmissions[message.submissionIdx!].code;

        break;
    }
  }
}
