import { ProblemTest, RunOutput, SubmissionResult, TestResult } from "../api";

const styles = `
<style>
  h1 {
    font-size: 30px;
  }

  body.vscode-light {
    color: black;
  }

  body.vscode-dark {
    color: white;
  }

  code, svg, li, .highlight, p {
    font-size: 16px;
  }
  .error {
    font-size: 14px;
    word-break: break-all;
    display: block;
    font-family: monospace;
    white-space: pre-wrap;
  }

  .meta {
    font-size: 12px;
    font-weight: normal;
  }

  .normal {
    font-size: 16px;
    font-weight: normal;
  }

  span {
    font-size: 16px;
  }

  code, svg, li, .highlight, p, pre {
    font-size: 16px;
  }

  pre {
    background-color: rgba(0, 0, 0, 0.4);
    padding: 10px;
    border-radius: 10px;
  }
  .error {
    background-color: rgba(0, 0, 0, 0.4);
    padding: 10px;
    border-radius: 10px;
  }

  p, li {
    line-height: 1.7;
  }
  .accepted {
    color: #0BDA51;
    font-weight: strong;
    font-size: 30px;
  }
  .failed {
    color: #D2042D;
    font-weight: strong;
    font-size: 30px;
  }

  .buttons::after {
    content: "";
    display: table;
    clear: both;
  }

  button {
    color: inherit;
  }

  .btn {
    font-size: 12px;
    padding: 8px 25px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    border-radius: 0px;

    display: inline-block;
    background-color: transparent;
  }

  .code {
    float: right;
  }

  .code svg {
    width: 16px;
    height: 16px;
  }
</style>`;

const head = `
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Submission Result</title>

  ${styles}
  
</head>`;

const stringifyDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
};

export const getFailedCompilationHTML = (
  compileError: string,
  submissionDate: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<html>
${head}
<body>
<h1> <span class="failed">Compile Error</span>
  <div class="meta">Submitted on ${stringifyDate(submissionDate)}</div>
</h1>

  <div class="error">${compileError}</div>

</body>
</html>`;
};

const getTestResultHTML = (
  testNo: number,
  testResult: TestResult,
  test: ProblemTest
) => {
  return `
<h2> <span class=${
    testResult.status === "PASSED" ? "accepted" : "failed"
  }>Case ${testNo} </span> <span class="normal">| ${test.grade} pts</span>
</h2>
<h3>Input:</h3>
<pre>${test.input}</pre>
<h3>Output:</h3>
<pre>${testResult.out}</pre>
<h3>Expected:</h3>
<pre>${testResult.ref}</pre>
<hr>
`;
};

export const getExecutionResultHTML = (
  testsResults: TestResult[],
  submissionDate: string,
  tests: ProblemTest[]
) => {
  // Possible states are PASSED, FAILED, RUNTIME_ERROR
  const passedTestsCount = testsResults.filter(
    (result) => result.status === "PASSED"
  ).length;
  const totalTestsCount = testsResults.length;
  const accepted = totalTestsCount === passedTestsCount;

  const header = accepted ? "Accepted" : "Wrong Answer";
  const headerClass = accepted ? "accepted" : "failed";
  const testsResultsHTML = testsResults
    .map((testResult, idx) => getTestResultHTML(idx, testResult, tests[idx]))
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<html>
${head}
<body>
<h1> <span class="${headerClass}">
  ${header}
  </span>

  <span class="normal">${
    accepted
      ? ""
      : " | " + passedTestsCount + " / " + totalTestsCount + " testcases passed"
  }</span>

  <div class="meta">Submitted on ${stringifyDate(submissionDate)}</div>
  </h1>
  
  ${testsResultsHTML}
</body>
</html>`;
};
