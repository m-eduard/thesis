import * as vscode from "vscode";
import { LambdaChecker } from "../commands";
import {
  RunOutput,
  SpecificProblem,
  SubmissionResult,
  WebviewMessage,
} from "../models";
import { getProblemHTML } from "../models/webview/htmlTemplates";
import { SubmissionFile } from "../storage";
import { ProblemSubmissionWebviewListener } from "./problemSubmissionWebviewListener";

export class ProblemWebview {
  public submissionFile: SubmissionFile;
  private static apiCooldown = 100;
  private static maxApiConsecutiveRequests = 50;
  private createdWebview = false;
  private submissionsPanel?: vscode.WebviewPanel;
  private submissionsListener?: ProblemSubmissionWebviewListener;

  constructor(
    public problem: SpecificProblem,
    public panel: vscode.WebviewPanel
  ) {
    this.submissionFile = new SubmissionFile(
      problem.id,
      problem.name,
      problem.language,
      problem.skeleton.code
    );
  }

  async waitForSubmitionProcessing(
    contestId?: number
  ): Promise<SubmissionResult | undefined> {
    let stopPolling = false;

    LambdaChecker.client
      .submitSolution(
        this.problem.id,
        contestId ? contestId : -1,
        await this.submissionFile.readSubmissionFile()
      )
      .catch((error) => {
        stopPolling = true;
        vscode.window.showErrorMessage(error.message);
      });

    const getSubmissionsSafe = async () => {
      return LambdaChecker.client
        .getSubmissions(this.problem.id)
        .catch((error) => {
          vscode.window.showErrorMessage(error.message);
          return [] as SubmissionResult[];
        });
    };
    const submissions = await getSubmissionsSafe();

    let currentCooldown = 0;
    let iterations = 0;

    const res = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Compiling and running your source code...",
        cancellable: false,
      },
      (progress) => {
        return new Promise<SubmissionResult | undefined>((resolve) => {
          let poller = setTimeout(async function loop() {
            const currentSubmissions = await getSubmissionsSafe();

            if (currentSubmissions.length > submissions.length || stopPolling) {
              clearInterval(poller);
              const lastSubmissionResult =
                currentSubmissions[currentSubmissions.length - 1];

              resolve(lastSubmissionResult);
              return;
            }

            if (iterations === ProblemWebview.maxApiConsecutiveRequests) {
              clearInterval(poller);
              vscode.window.showErrorMessage(
                "Submission is taking too long to load, try again in a few seconds"
              );
              resolve(undefined);
              return;
            }

            iterations += 1;
            currentCooldown += ProblemWebview.apiCooldown;

            poller = setTimeout(loop, currentCooldown);
          }, currentCooldown);
        });
      }
    );

    return res;
  }

  async webviewListener(message: WebviewMessage) {
    switch (message.action) {
      case "code":
        this.submissionFile.openInEditor();
        break;
      case "run":
        break;
      case "submit":
        const submissionResult = await this.waitForSubmitionProcessing(
          message.contestId
        );

        if (submissionResult !== undefined) {
          await LambdaChecker.showSubmissionResult(
            submissionResult,
            this.problem.name,
            this.problem.tests,
            this.problem.language
          );
        }
        break;
      case "view-description":
        this.panel.webview.html = getProblemHTML(
          this.problem,
          message.contestId
        );
        break;
      case "view-submissions":
        if (this.createdWebview === false) {
          this.createdWebview = true;

          // Create a new webview panel for the submissions status
          this.submissionsPanel = vscode.window.createWebviewPanel(
            "lambdachecker.webview.results",
            `${this.problem.id}. ${this.problem.name}`,
            {
              viewColumn: vscode.ViewColumn.Two,
              preserveFocus: false,
            },
            {
              enableScripts: true,
              enableFindWidget: true,
            }
          );

          this.submissionsListener = new ProblemSubmissionWebviewListener(
            this.problem.id,
            this.problem.name,
            this.problem.language,
            "",
            this.submissionsPanel,
            this.problem.tests
          );

          this.submissionsPanel.webview.onDidReceiveMessage(async (message) => {
            this.submissionsListener!.webviewListener(message);
          });

          this.submissionsPanel.onDidDispose(() => {
            this.createdWebview = false;
          });

          // Message sent by postMessage doesn't reach
          // otherwise the submissionPanelListener
          const bounceOffDummyHTML = `
          <html>
            <script>
            const vscode = acquireVsCodeApi();

            window.addEventListener('message', event => {
              vscode.postMessage({
                action: "view-all-submissions",
              });
            });
            </script>
          </html>
          `;

          this.submissionsPanel!.webview.html = bounceOffDummyHTML;
          this.submissionsPanel!.webview.postMessage({});
        } else {
          this.submissionsPanel!.reveal();
        }

        break;
    }
  }
}
