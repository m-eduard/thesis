import { Problem, WebviewMessage } from "../models";
import { SubmissionFile } from "../storage";

export class ProblemWebview {
  static async webviewListener(
    message: WebviewMessage,
    problem: Required<Problem>
  ) {
    switch (message.action) {
      case "code":
        const submissionFile = new SubmissionFile(
          problem.name,
          problem.language,
          problem.skeleton.code
        );

        submissionFile.openInEditor();
        break;
      case "run":
      case "submit":
    }
  }
}
