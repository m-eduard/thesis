import { Problem } from "../api";

export const getProblemWebviewContent = (problemData: Required<Problem>) => {
  const title = `${problemData.id}. ${problemData.name}`;

  return `
<!DOCTYPE html>
<html lang="en">
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
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
      .btn {
        font-size: 15px;
        padding: 10px 25px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        border-radius: 3px;
      }
      .buttons::after {
        content: "";
        display: table;
        clear: both;
      }
      .solve {
        background-color: #D6B1FF;
      }
      .solve:hover {
        background-color: #A660F3;
        transition: 0.1s;
      }
      .run {
        float: right;
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
        background-color: #b680f3;
      }
      .submit:hover {
        background-color: #8c30f5;
        transition: 0.1s;
      }
      .submit:active {
        transform: translateY(4px); 
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>

    <p>${problemData.description}</p>

    <h2>Exemplu:</h2>
    <h3>Input:</h3>
    <pre>${problemData.example.input}</pre>

    <h3>Output:</h3>
    <pre>${problemData.example.output}</pre>


    <div class="buttons">
      <button id="solve" class="btn solve" onclick="solve()">Solve</button>
      <button id="submit" class="btn submit" onclick="execute('submit')">
        Submit
      </button>
      <button id="run" class="btn run" onclick="execute('run')">Run</button>
    </div>

    <script>
      let openCodeEditorsCount = 0;
      const vscode = acquireVsCodeApi();

      vscode.setState(${JSON.stringify(problemData)});

      function solve() {
        vscode.postMessage({
          event: "solve",
          challengeSlug: "<xxx>",
        });
      }

      function execute(type) {
        vscode.postMessage({
          event: type,
          challengeSlug: "<xxx>",
        });
      }
    </script>
  </body>
</html>
`;
};
