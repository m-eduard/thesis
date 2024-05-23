import { ProblemTest, RunOutput, SubmissionResult } from "../api";
import {
  getExecutionResultHTML,
  getFailedCompilationHTML,
} from "./htmlTemplates";

export const getSubmissionResultWebviewContent = (
  submissionResult: SubmissionResult,
  tests: ProblemTest[]
) => {
  let failedCompilationMsg = "";

  if (submissionResult.run_output.compiled === false) {
    return getFailedCompilationHTML(
      submissionResult.compilation_result,
      submissionResult.date
    );
  }

  return getExecutionResultHTML(
    submissionResult.run_output.results!,
    submissionResult.date,
    tests
  );

  // table
  // Status                   Contest
  // ------------------------- ----------------
  // Accepted/Rejected        "SD Partial" / ...
  // date
  // ------------------------- ----------------

  // View for singular submission
  // Status (Accepted/Wrong Answer/ Compilation Failed) | 7/32 testcases passed
  // Input
  // textbox
  // Output
  // textbox
  // Expected
  // textbox si highlight pe diff
  // Code (hiighlighted using the syntax of the programming language)

  // button copy to editor

  return `
<!DOCTYPE html>
<html lang="en">
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Submission Result</title>
    <style>
      body {
        border-left: 3px solid #8c30f5;
      }
      h1 {
        font-size: 30px;
      }
      code, svg, li, .highlight, p, pre {
        font-size: 16px;
      }
      meta {
        font-size: 16px;
        font-weight: normal;
      }
      span {
        font-size: 16px;
        color: white;
      }
      li {
        margin: 5px 0;
      }
      pre {
        background-color: rgba(0, 0, 0, 0.4);
        padding: 10px;
        border-radius: 10px;
      }
      h1, h2, h3, h4, h5, h6, p, code, svg, li, .highlight, pre {
        color: white;
      }
      p, li {
        line-height: 1.7;
      }
      .accepted {
        color: #0BDA51;
      }
      .failed {
        color: #D2042D;
      }
    </style>
  </head>
  <body>
    
  </body>
</html>
`;
};
