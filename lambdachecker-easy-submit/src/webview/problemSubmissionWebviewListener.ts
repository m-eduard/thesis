import {
  Language,
  ProblemSubmissionWebviewMessage,
  SubmissionResult,
} from "../models";
import { SubmissionFile } from "../storage";

export class ProblemSubmissionWebviewListener {
  public submissionFile: SubmissionFile;

  constructor(
    public submissionResult: SubmissionResult,
    problemName: string,
    problemLanguage: Language
  ) {
    this.submissionFile = new SubmissionFile(
      submissionResult.problem_id,
      problemName,
      problemLanguage,
      submissionResult.code
    );
  }

  async webviewListener(message: ProblemSubmissionWebviewMessage) {
    switch (message.action) {
      case "copy-code":
        this.submissionFile.openInEditor(true);
        break;
      case "view-all-submissions":
        break;
    }
  }
}
