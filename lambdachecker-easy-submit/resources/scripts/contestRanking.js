const vscode = acquireVsCodeApi();

function showProblem(problemId) {
  console.log("Received the message here");

  vscode.postMessage({
    action: 'show-problem',
    problemId: problemId,
  });
}
