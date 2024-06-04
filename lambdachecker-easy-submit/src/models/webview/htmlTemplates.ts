import {
  ProblemTest,
  RunOutput,
  SpecificProblem,
  SubmissionResult,
  TestResult,
} from "../api";

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

  .accepted-normal {
    color: #0BDA51;
    font-weight: strong;
  }

  .failed-normal {
    color: #D2042D;
    font-weight: strong;
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
    margin-right: 5px;
  }

  .all-submissions {
    float: left;
  }

  .all-submissions svg {
    width: 14px;
    height: 14px;
    margin-right: 5px;
  }

  div {
    padding-top: 5px;
    min-height: 20px;
  }

  .submissions-table {
    width: 100%;
    border-collapse: collapse;
  }

  .submissions-table th, .submissions-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid white;
    font-size: 14px;
  }

  .submissions-table tr:nth-child(even) {
    background-color: var(--vscode-inlineChat-background);
  }

  .submissions-table tr:nth-child(odd) {
    background-color: var(--vscode-editor-background);
  }

  .submissions-table tr {
    border: none;
    cursor: pointer;
    border-radius: 0px;
  }

  .bottom-btn {
    font-size: 15px;
    padding: 10px 25px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    border-radius: 3px;
  }

</style>`;

const problemButtonsStyle = `
<style>
.code {
  color: black;
  background-color: #b680f3;
}
.code:hover {
  background-color: #8c30f5;
  transition: 0.1s;
}
.code:active {
  transform: translateY(4px); 
}
.run {
  float: right;
  color: black;
  background-color: #f4f4f5;
  margin-right: 10px;
}
.run:hover {
  background-color: #8C30F5;
  transition: 0.1s;
}
.run:active {
  transform: translateY(4px); 
}
.submit {
  float: right;
  color: black;
  background-color: #b680f3;
}
.submit:hover {
  background-color: #8c30f5;
  transition: 0.1s;
}
.submit:active {
  transform: translateY(4px); 
}

.button-container {
  display: flex;
  align-items: center;
}

.separator {
  margin: 0 10px;
  font-size: 18px;
  color: #333;
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
    hourCycle: "h23",
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
  <button id="all-submissions" class="btn all-submissions" onclick="send('view-all-submissions')">
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
  const grade = testResult.status === "PASSED" ? test.grade : 0;

  return `
<h2> <span class=${
    testResult.status === "PASSED" ? "accepted" : "failed"
  }>Case ${testNo} </span> <span class="normal">|  ${grade} / ${
    test.grade
  } pts</span>
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

    window.addEventListener('message', event => {
      const message = event.data;

      switch (message.command) {
        case 'reset-cursor':
          window.scrollTo(0, 0);
          break;
      }
    });
  </script>
</body>
</html>`;
};

const getSubmissionsTableEntryHTML = (
  submissionResult: SubmissionResult,
  tests: ProblemTest[],
  submissionIdx: number
) => {
  const passedTestsCount = submissionResult.run_output.results?.filter(
    (result) => result.status === "PASSED"
  ).length;
  const totalTestsCount = submissionResult.run_output.results?.length;
  let accepted = totalTestsCount === passedTestsCount;

  let status = "Accepted";
  if (submissionResult.run_output.compiled === false) {
    status = "Compilation Error";
    accepted = false;
  } else if (!accepted) {
    status = "Wrong Answer";
  }

  const headerClass = accepted ? "accepted-normal" : "failed-normal";

  return `
<tr onclick='send("view-submission", ${submissionIdx})'>
  <td>Submission ${submissionIdx}</td>
  <td> <span class="${headerClass}"><b>${status}</b></span> <div class="meta">${stringifyDate(
    submissionResult.date
  )}</div></td>
  <td>${
    passedTestsCount !== undefined
      ? passedTestsCount + " / " + totalTestsCount
      : "-"
  }</td>
  <td>${
    submissionResult.grade +
    " / " +
    tests.map((x) => x.grade).reduce((acc, x) => acc + x)
  }</td>
</tr>`;
};

export const getSubmissionsTableHTML = (
  submissionResults: SubmissionResult[],
  tests: ProblemTest[]
) => {
  const submissionsData = submissionResults
    .map((submissionResult, idx) =>
      getSubmissionsTableEntryHTML(submissionResult, tests, idx)
    )
    .reverse()
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<html>
  ${head}
  <body>
  <h1>Submissions</h1>
    <table class="submissions-table">
      <thead>
          <tr>
              <th>Index</th>
              <th>Status</th>
              <th>Tests Passed</th>
              <th>Points</th>
          </tr>
      </thead>
      <tbody>
          ${submissionsData}
      </tbody>
    </table>

    <script>
      const vscode = acquireVsCodeApi();

      function send(cmd, submissionIdx) {
        vscode.postMessage({
          action: cmd,
          submissionIdx: submissionIdx
        });
      }
    </script>
  </body>
</html>
`;
};

const getDescriptionButton = () => {
  return `
<button id="description" class="btn" onclick="send('view-description')">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.57 1.14L13.85 4.44L14 4.8V14.5L13.5 15H2.5L2 14.5V1.5L2.5 1H10.22L10.57 1.14ZM10 5H13L10 2V5ZM3 2V14H13V6H9.5L9 5.5V2H3ZM11 7H5V8H11V7ZM5 9H11V10H5V9ZM11 11H5V12H11V11Z" fill="#C5C5C5"/>
  </svg> Description
</button>`;
};

const getSubmissionsButton = () => {
  return `
<button id="submissions" class="btn all-submissions" onclick="send('view-submissions')">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 0H8.5L7 1.5V6H2.5L1 7.5V22.5699L2.5 24H14.5699L16 22.5699V18H20.7L22 16.5699V4.5L17.5 0ZM17.5 2.12L19.88 4.5H17.5V2.12ZM14.5 22.5H2.5V7.5H7V16.5699L8.5 18H14.5V22.5ZM20.5 16.5H8.5V1.5H16V6H20.5V16.5Z" fill="#C5C5C5"/>
  </svg> Submissions
</buton>`;
};

export const getProblemHTML = (
  problemData: SpecificProblem,
  contestId?: number
) => {
  const title = `${problemData.id}. ${problemData.name}`;

  console.log("Registered contest id", contestId);

  return `
<!DOCTYPE html>
<html lang="en">
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${styles}
    <style>
      body {
        border-left: 3px solid #8c30f5;
      }
    </style>

    ${problemButtonsStyle}
      
    <style>
      .header-btn {
        font-size: 14px;
        padding: 8px 0px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        border-radius: 0px;
    
        display: inline-block;
        background-color: transparent;
      }

      .all-submissions {
        float: left;
      }
    
      .all-submissions svg {
        width: 14px;
        height: 14px;
        margin-right: 3px;
      }
    </style>
  </head>
  <body>
    <div class="button-container">
      ${getDescriptionButton()}
      <span class="separator">|</span>
      ${getSubmissionsButton()}
    </div>

    <h1>${title}</h1>
    <p>${problemData.description}</p>

    <h2>Exemplu:</h2>
    <h3>Input:</h3>
    <pre>${problemData.example.input}</pre>

    <h3>Output:</h3>
    <pre>${problemData.example.output}</pre>

    <div class="buttons">
      <button id="submit" class="bottom-btn submit" onclick="send('submit')">Submit</button>
      <button id="run" class="bottom-btn run" onclick="send('run')">Run</button>
      <button id="code" class="bottom-btn code" onclick="send('code')">Code</button>
    </div>

    <script>
      const vscode = acquireVsCodeApi();

      vscode.setState(${JSON.stringify(problemData)});

      function send(cmd) {
        vscode.postMessage({
          action: cmd,
          contestId: ${contestId},
        });
      }
    </script>
  </body>
</html>
`;
};
