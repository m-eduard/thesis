import { ProblemTest } from "../api";

export interface WebviewMessage {
  /**
   * The action sent from webview
   */
  action: string;

  /**
   * The ID of the contest where the solution
   * will be submitted
   */
  contestId?: number;

  /**
   * The tests against which the code is run
   * (only for action "run")
   */
  tests?: ProblemTest[];
}

export interface ProblemSubmissionWebviewMessage {
  action: string;
  submissionIdx?: number;
}
