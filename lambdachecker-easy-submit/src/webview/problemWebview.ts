import * as vscode from "vscode";
import { LambdaChecker } from "../commands";
import {
  RunOutput,
  SpecificProblem,
  SubmissionResult,
  WebviewMessage,
} from "../models";
import { SubmissionFile } from "../storage";

export class ProblemWebview {
  public submissionFile: SubmissionFile;
  private static apiCooldown = 100;
  private static maxApiConsecutiveRequests = 50;

  constructor(public problem: SpecificProblem) {
    this.submissionFile = new SubmissionFile(
      problem.id,
      problem.name,
      problem.language,
      problem.skeleton.code
    );
  }

  async waitForSubmitionProcessing(): Promise<SubmissionResult | undefined> {
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

            if (currentSubmissions.length > submissions.length) {
              clearInterval(poller);
              const lastSubmissionResult =
                currentSubmissions[currentSubmissions.length - 1];

              lastSubmissionResult.run_output = JSON.parse(
                lastSubmissionResult.run_output as unknown as string
              ) as RunOutput;

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
        console.log("Submitting from ", message.contestId);

        LambdaChecker.client.submitSolution(
          this.problem.id,
          message.contestId ? message.contestId : -1,
          await this.submissionFile.readSubmissionFile()
        );
        const submissionResult = await this.waitForSubmitionProcessing();

        console.log(this.problem.tests!);

        if (submissionResult !== undefined) {
          console.log(submissionResult);

          await LambdaChecker.showSubmissionResult(
            submissionResult,
            this.problem.name,
            this.problem.tests
          );
        }
    }
  }
}
