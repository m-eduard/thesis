import * as vscode from "vscode";
import { HTTPClient } from "./lambdachecker/http";
import { Storage } from "./storage";


export class LambdaChecker {
  static readonly client = new HTTPClient();
  static userDataCache = new Storage();

  static async getLoginStatus(): Promise<string | undefined> {
    const loggedIn = this.userDataCache.get("token", true) !== undefined;

    if (loggedIn) {
      const user = this.userDataCache.get("user", true) as unknown as Record<string, unknown>;
      return user["username"] as string;
    }

    return undefined;
  }

  // Test creds
  // "test1@gmail.com", "TestTestTest!"
  static async loginUi() {
    if (await this.getLoginStatus() !== undefined) {
      return;
    }

    const email = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your email",
      title: "LambdaChecker Login",

      value: "@acs.upb.ro",
      valueSelection: [0, 0],
    });
    vscode.window.showInformationMessage(`Got: ${email}`);

    const password = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your password",
      placeHolder: "Enter your password",
      password: true,
    });

    const response = await LambdaChecker.client.login(email as string, password as string);
    console.log(response);

    if (response["status"] === "Failed") {
      vscode.window.showErrorMessage(response["message"] as string);
    } else {
      vscode.window.showInformationMessage(
        "Successfully logged into you LambdaChecker account!"
      );

      this.userDataCache.put("user", response["user"] as string);
      this.userDataCache.put("token", response["token"] as string);


      // save the data retrieved from api regarding the current user
      // the user data, token and enrolled contests
    }
  }

  // add problem to cache

  // flush problem cache

  // add user <email, token> in persistent storage

  // storte user data and contests where he is enrolled
  // (which are received when logging into Lambda CHECKER)

  // create a thread which manages the token in order to refresh it
  // (I suspect that we don't have a refresh token on the backend)
}
