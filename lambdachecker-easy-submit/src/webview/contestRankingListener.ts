import * as vscode from "vscode";
import { LambdaChecker } from "../commands";
import { Contest, ContestRankingWebviewMessage } from "../models";

export class ContestRankingListener {
  private stylesUri: vscode.Uri;
  private scriptsUri: vscode.Uri;

  constructor(
    public contestMetadata: Contest,
    public panel: vscode.WebviewPanel
  ) {
    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "contestRanking.css"
    );

    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "contestRanking.js"
    );

    this.stylesUri = this.panel.webview.asWebviewUri(stylesPath);
    this.scriptsUri = this.panel.webview.asWebviewUri(scriptsPath);
  }

  async webviewListener(message: ContestRankingWebviewMessage) {
    switch (message.action) {
      case "show-problem":
        LambdaChecker.showProblem(message.problemId!, this.contestMetadata);
        break;
    }
    //       case "view-all-submissions":
    //         // Second, when the current batch is ready, replace the
    //         // old HTML content with this one
    //         getSubmissionsSafe().then((submissions) => {
    //           LambdaChecker.allSubmissions.set(this.problemId, submissions);
    //           this.panel.webview.html = getSubmissionsTableHTML(
    //             submissions,
    //             this.problemTests
    //           );
    //         });
    //         // First, show the old batch of submissions
    //         this.panel.webview.html = getSubmissionsTableHTML(
    //           LambdaChecker.allSubmissions.get(this.problemId) || [],
    //           this.problemTests
    //         );
    //         break;
    //       case "view-submission":
    //         const selectedSubmission = LambdaChecker.allSubmissions.get(
    //           this.problemId
    //         )![message.submissionIdx!];
    //         this.panel.webview.html = getSubmissionResultWebviewContent(
    //           this.stylesUri,
    //           this.scriptsUri,
    //           selectedSubmission,
    //           this.problemTests
    //         );
    //         this.panel.webview.postMessage({ command: "reset-cursor" });
    //         // Update the code stored for the current submission
    //         this.submissionFile.problemSkel = selectedSubmission.code;
    //         break;
    //     }
  }
}
