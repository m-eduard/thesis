export interface WebviewMessage {
  /**
   * The action sent from webview
   */
  action: string;
  contestId?: number;
}

export interface ProblemSubmissionWebviewMessage {
  action: string;
}
