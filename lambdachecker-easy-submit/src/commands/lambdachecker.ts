import * as vscode from "vscode";
import { HTTPClient } from "../api";
import {
  Language,
  ProblemTest,
  RunOutput,
  StatusBar,
  Storage,
  SubmissionResult,
  getProblemWebviewContent,
  getSubmissionResultWebviewContent,
} from "../models";
import { ContestDataProvider, ProblemItem } from "../treeview";
import { ProblemEditor, ProblemSubmissionWebviewListener } from "../webview";
import { ProblemWebview } from "../webview/problemWebview";

export class LambdaChecker {
  static client: HTTPClient;
  static userDataCache = new Storage();

  static async getLoginStatus(): Promise<string | undefined> {
    const loggedIn =
      LambdaChecker.userDataCache.get("token", true) !== undefined;

    if (loggedIn) {
      if (LambdaChecker.client === undefined) {
        LambdaChecker.client = new HTTPClient(
          LambdaChecker.userDataCache.get("token") as string
        );
      }

      const user = LambdaChecker.userDataCache.get(
        "user",
        true
      ) as unknown as Record<string, unknown>;
      return user["username"] as string;
    }

    LambdaChecker.client = new HTTPClient();
    return undefined;
  }

  static async login() {
    const status = await LambdaChecker.getLoginStatus();

    const email = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your email",
      title: "LambdaChecker Login",

      value: "@stud.acs.upb.ro",
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

      LambdaChecker.userDataCache.put("user", response["user"] as string);
      LambdaChecker.userDataCache.put("token", response["token"] as string);
      StatusBar.updateStatus(await LambdaChecker.getLoginStatus());

      // save the data retrieved from api regarding the current user
      // the user data, token and enrolled contests
    } catch (error: any) {
      vscode.window
        .showErrorMessage(error.message, "Try again")
        .then((selection) => {
          if (selection === "Try again") {
            vscode.commands.executeCommand("lambdachecker.login");
          }
        });
    }
  }

  // create a thread which manages the token in order to refresh it
  // (I suspect that we don't have a refresh token on the backend)

  static async showProblem(problemItem: ProblemItem, contestId?: number) {
    let problem;

    try {
      problem = await LambdaChecker.client.getProblem(
        problemItem.props.problemMetadata!.id,
        contestId
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(error.message);
      return;
    }

    const problemPanel = vscode.window.createWebviewPanel(
      "lambdachecker.webview",
      `${problem.id}. ${problem.name}`,
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: false,
      },
      {
        enableScripts: true,
        enableFindWidget: true,
      }
    );

    problemPanel.webview.onDidReceiveMessage(async (message) => {
      const problemWebview = new ProblemWebview(problem);
      problemWebview.webviewListener(message);
    });
    problemPanel.webview.html = getProblemWebviewContent(problem, contestId);
  }

  static async showSubmissionResult(
    submissionResult: SubmissionResult,
    problemName: string,
    problemTests: ProblemTest[],
    problemLanguage: Language
  ) {
    // console.log(JSON.parse(submissionResult.run_output) as RunOutput);

    const problemPanel = vscode.window.createWebviewPanel(
      "lambdachecker.webview.results",
      `${submissionResult.problem_id}. ${problemName}`,
      {
        viewColumn: vscode.ViewColumn.Two,
        preserveFocus: false,
      },
      {
        enableScripts: true,
        enableFindWidget: true,
      }
    );

    // Create the listener once, and use it for each message received
    const currentProblemResultListener = new ProblemSubmissionWebviewListener(
      submissionResult,
      problemName,
      problemLanguage,
      problemPanel,
      problemTests
    );

    problemPanel.webview.onDidReceiveMessage(async (message) => {
      currentProblemResultListener.webviewListener(message);
    });

    problemPanel.webview.html = getSubmissionResultWebviewContent(
      submissionResult,
      problemTests
    );
  }

  static async enrollInContest(
    contestId: number,
    hasPassword: boolean,
    contestDataProvider: ContestDataProvider
  ) {
    let password = "";

    if (hasPassword) {
      const passwordRaw = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        prompt: "Enter your password",
        title: `Unlock contest ${contestId}`,
        placeHolder: "Enter your password",
        password: true,
      });

      if (passwordRaw === undefined) {
        return;
      } else {
        password = passwordRaw;
      }
    }

    try {
      const response = await LambdaChecker.client.enrollParticipant(
        contestId,
        password
      );

      contestDataProvider.refresh(contestId);
    } catch (error: any) {
      console.log("here", error);

      vscode.window
        .showErrorMessage(error.message, "Try again")
        .then((selection) => {
          if (selection === "Try again") {
            vscode.commands.executeCommand(
              "lambdachecker.enroll-in-contest",
              contestId,
              hasPassword,
              contestDataProvider
            );
          }
        });
    }
  }
}
