import * as vscode from "vscode";
import { HTTPClient } from "../api";
import { Storage, getProblemWebviewContent } from "../models";
import { ProblemItem } from "../treeview";
import { ProblemEditor } from "../webview";

export class LambdaChecker {
  static client: HTTPClient;
  static userDataCache = new Storage();

  static async getLoginStatus(): Promise<string | undefined> {
    const loggedIn = this.userDataCache.get("token", true) !== undefined;

    if (loggedIn) {
      if (this.client === undefined) {
        this.client = new HTTPClient(this.userDataCache.get("token") as string);
      }

      const user = this.userDataCache.get("user", true) as unknown as Record<
        string,
        unknown
      >;
      return user["username"] as string;
    }

    this.client = new HTTPClient();
    return undefined;
  }

  // Test creds
  // "test1@gmail.com", "TestTestTest!"
  static async login() {
    const email = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your email",
      title: "LambdaChecker Login",

      value: "@acs.upb.ro",
      valueSelection: [0, 0],
    });

    const password = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your password",
      placeHolder: "Enter your password",
      password: true,
    });

    try {
      const response = await LambdaChecker.client.login(
        email as string,
        password as string
      );

      vscode.window.showInformationMessage(
        "Successfully logged into you LambdaChecker account!"
      );

      this.userDataCache.put("user", response["user"] as string);
      this.userDataCache.put("token", response["token"] as string);

      // save the data retrieved from api regarding the current user
      // the user data, token and enrolled contests
    } catch (error: any) {
      vscode.window.showErrorMessage(error.message, "Try again").then(() => {
        vscode.commands.executeCommand("lambdachecker.login");
      });
    }
  }

  // add problem to cache

  // flush problem cache

  // add user <email, token> in persistent storage

  // storte user data and contests where he is enrolled
  // (which are received when logging into Lambda CHECKER)

  // create a thread which manages the token in order to refresh it
  // (I suspect that we don't have a refresh token on the backend)

  static async viewProblem(problemItem: ProblemItem) {
    let problem;

    try {
      problem = await LambdaChecker.client.getProblem(
        problemItem.props.problemMetadata!.id
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(error.message);
      return;
    }

    // vscode.TabInputWebview

    const problemPanel = vscode.window.createWebviewPanel(
      "lambdachecker.webview",
      problem.name,
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: false,
      },
      {
        enableScripts: true,
        enableFindWidget: true,
      }
    );

    problemPanel.iconPath = vscode.Uri.file(problemItem.iconPath as string);

    ProblemEditor.open();
    problemPanel.webview.html = getProblemWebviewContent(problem);
  }
}
