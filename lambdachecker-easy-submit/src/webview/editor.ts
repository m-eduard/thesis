import * as vscode from "vscode";

export class ProblemEditor {
  static cnt = 0;

  static async open() {
    console.log(
      vscode.workspace
        .getConfiguration("lambdachecker")
        .get<string>("workspaceFolder", "")
    );

    // // dafault folder
    // os.homedir;

    this.cnt += 1;

    const codeEditor = vscode.window.showTextDocument(
      this.cnt % 2 === 0
        ? vscode.Uri.file(
            vscode.workspace.workspaceFolders![0].uri.path + "/README.md"
          )
        : vscode.Uri.file(
            vscode.workspace.workspaceFolders![0].uri.path + "/makefile"
          ),
      {
        preview: false,
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside,
      }
    );
  }
}
