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

  constructor(
    public submissionResult: SubmissionResult,
    problemName: string,
    problemLanguage: Language,
    public panel: vscode.WebviewPanel,
    public problemTests: ProblemTest[]
  ) {
    this.submissionFile = new SubmissionFile(
      submissionResult.problem_id,
      problemName,
      problemLanguage,
      submissionResult.code
    );
  }

  async webviewListener(message: ProblemSubmissionWebviewMessage) {
    const getSubmissionsSafe = async () => {
      return LambdaChecker.client
        .getSubmissions(this.submissionResult.problem_id)
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
