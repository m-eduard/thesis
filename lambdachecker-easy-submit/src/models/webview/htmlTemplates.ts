import { ProblemTest, RunOutput, SubmissionResult, TestResult } from "../api";

const styles = `
<style>
  h1 {
    font-size: 26px;
  }

  body.vscode-light {
    color: black;
  }

  body.vscode-dark {
    color: white;
  }

  code, svg, li, .highlight, p {
    font-size: 14px;
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
    font-size: 14px;
    font-weight: normal;
  }

  span {
    font-size: 14px;
  }

  code, svg, li, .highlight, p, pre {
    font-size: 14px;
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
    font-size: 26px;
  }
  .failed {
    color: #D2042D;
    font-weight: strong;
    font-size: 26px;
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
    font-size: 14px;
    padding: 8px 0px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    border-radius: 0px;

    display: inline-block;
    background-color: transparent;
  }

  .copy-code {
    float: right;
    padding: 8px 25px;
  }

  .copy-code svg {
    width: 14px;
    height: 14px;
  }

  .all-submissions {
    float: left;
  }

  .all-submissions svg {
    width: 14px;
    height: 14px;
  }

  div {
    padding-top: 5px;
    min-height: 20px;
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

const getBringCodeToEditorButton = () => {
  return `
  <button id="copy-code" class="btn copy-code" onclick="send('copy-code')">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9565 6H12.0064C12.8004 6 13.5618 6.31607 14.1232 6.87868C14.6846 7.44129 15 8.20435 15 9C15 9.79565 14.6846 10.5587 14.1232 11.1213C13.5618 11.6839 12.8004 12 12.0064 12V11C12.5357 11 13.0434 10.7893 13.4176 10.4142C13.7919 10.0391 14.0021 9.53044 14.0021 9C14.0021 8.46957 13.7919 7.96086 13.4176 7.58579C13.0434 7.21072 12.5357 7 12.0064 7H11.0924L10.9687 6.143C10.8938 5.60541 10.6456 5.10711 10.2618 4.72407C9.87801 4.34103 9.37977 4.09427 8.84303 4.02143C8.30629 3.94859 7.76051 4.05365 7.2889 4.3206C6.81729 4.58754 6.44573 5.00173 6.23087 5.5L5.89759 6.262L5.08933 6.073C4.90382 6.02699 4.71364 6.0025 4.52255 6C3.86093 6 3.22641 6.2634 2.75858 6.73224C2.29075 7.20108 2.02792 7.83696 2.02792 8.5C2.02792 9.16304 2.29075 9.79893 2.75858 10.2678C3.22641 10.7366 3.86093 11 4.52255 11H5.02148V12H4.52255C4.02745 12.0043 3.5371 11.903 3.08403 11.7029C2.63096 11.5028 2.22553 11.2084 1.89461 10.8394C1.5637 10.4703 1.31488 10.0349 1.16465 9.56211C1.01442 9.08932 0.966217 8.58992 1.02324 8.09704C1.08026 7.60416 1.24121 7.12906 1.4954 6.70326C1.74959 6.27745 2.09121 5.91068 2.49762 5.62727C2.90402 5.34385 3.36591 5.15027 3.85264 5.05937C4.33938 4.96847 4.83984 4.98232 5.32083 5.1C5.6241 4.40501 6.14511 3.82799 6.80496 3.45635C7.4648 3.08472 8.22753 2.9387 8.9776 3.04044C9.72768 3.14217 10.4242 3.4861 10.9618 4.02014C11.4993 4.55418 11.8485 5.24923 11.9565 6ZM6.70719 11.1214L8.0212 12.4354V7H9.01506V12.3992L10.2929 11.1214L11 11.8285L8.85356 13.9749H8.14645L6.00008 11.8285L6.70719 11.1214Z" fill="#C5C5C5"/>
    </svg>Bring Code To Editor</button>`;
};

const getAllSubmissionsButton = () => {
  return `
  <button id="all-submissions" class="btn all-submissions" onclick="send('all-submissions')">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.99999 3.0929L2 8.09288L2 8.79999L6.99999 13.8L7.7071 13.0929L3.56066 8.94644L14 8.94644L14 7.94644L3.56066 7.94644L7.7071 3.8L6.99999 3.0929Z" fill="#C5C5C5"/>
    </svg>All Submissions</button>`;
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

<div>
<span class="toolbar-buttons">
${getAllSubmissionsButton()}
</span>

<span class="toolbar-buttons">
${getBringCodeToEditorButton()}
</span>
</div>

<h1> <span class="failed">Compile Error</span>
  <div class="meta">Submitted on ${stringifyDate(submissionDate)}</div>
</h1>

  <div class="error">${compileError}</div>

  <script>
    const vscode = acquireVsCodeApi();

    function send(cmd) {
      vscode.postMessage({
        action: cmd,
      });
    }
  </script>

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

<div>
<span class="toolbar-buttons">
${getAllSubmissionsButton()}
</span>

<span class="toolbar-buttons">
${getBringCodeToEditorButton()}
</span>
</div>

<h1> 
<div>
<span class="${headerClass}">
  ${header}
  </span>

  <span class="normal">${
    accepted
      ? ""
      : " | " + passedTestsCount + " / " + totalTestsCount + " testcases passed"
  }</span>
</div>

  <div class="meta">Submitted on ${stringifyDate(submissionDate)}</div>
  </h1>
  
  ${testsResultsHTML}

  <script>
    const vscode = acquireVsCodeApi();

    function send(cmd) {
      vscode.postMessage({
        action: cmd,
      });
    }
  </script>
</body>
</html>`;
};
