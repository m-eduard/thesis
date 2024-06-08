import path from "path";
import * as vscode from "vscode";
import { HTTPClient } from "../api";
import {
  BaseProblem,
  ContestSubject,
  Language,
  ProblemTest,
  RunOutput,
  SpecificProblem,
  StatusBar,
  Storage,
  SubmissionResult,
  User,
  getProblemWebviewContent,
  getSubmissionResultWebviewContent,
} from "../models";
import {
  getContestCreationHTML,
  getProblemHTML,
} from "../models/webview/htmlTemplates";
import { ContestDataProvider, ProblemItem } from "../treeview";
import { ProblemEditor, ProblemSubmissionWebviewListener } from "../webview";
import { ProblemWebview } from "../webview/problemWebview";

export class LambdaChecker {
  static context: vscode.ExtensionContext;
  static client: HTTPClient;
  static userDataCache = new Storage();
  static contestDataProvider: ContestDataProvider;
  static users: User[] = [];
  static problems: BaseProblem[] = [];

  static {
    // LambdaChecker.client.getUsers().then((users) => {
    //   LambdaChecker.users = users;
    // });
  }

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

      // Update the role seen by the extension
      if (
        (response["user"] as unknown as Record<string, unknown>)["role"] ===
        "teacher"
      ) {
        vscode.commands.executeCommand(
          "setContext",
          "lambdachecker.teacher",
          true
        );
      } else {
        vscode.commands.executeCommand(
          "setContext",
          "lambdachecker.teacher",
          false
        );
      }

      // Update the current user's id (used to allow assistants
      // to edit contests/problems in Treeview)
      vscode.commands.executeCommand(
        "setContext",
        "lambdachecker.id",
        (response["user"] as unknown as Record<string, unknown>)["id"]
      );

      // Update the contests status
      LambdaChecker.contestDataProvider.refresh();

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

    // Create the listener once (more efficient than creating a new
    // listener for each message received)
    const problemWebview = new ProblemWebview(problem, problemPanel);

    problemPanel.webview.onDidReceiveMessage(async (message) => {
      problemWebview.webviewListener(message);
    });
    problemPanel.webview.html = getProblemHTML(problem, contestId);
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
      submissionResult.problem_id,
      problemName,
      problemLanguage,
      submissionResult.code,
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

  static async createContest() {
    const createContestPanel = vscode.window.createWebviewPanel(
      "lambdachecker.webview.create-contest",
      "Create Contest",
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: false,
      },
      {
        enableScripts: true,
        enableFindWidget: true,
        localResourceRoots: [
          vscode.Uri.joinPath(LambdaChecker.context.extensionUri, "resources"),
        ],
        retainContextWhenHidden: true,
      }
    );

    LambdaChecker.client.getUsers().then((users) => {
      LambdaChecker.users = users;
      console.log("Sent the fresh data to html");
      console.log("Example user:", users[0]);
      createContestPanel.webview.postMessage({
        users: users.filter((user) => user.role === "teacher"),
      });
    });

    LambdaChecker.client.getProblems().then((problems) => {
      LambdaChecker.problems = problems;
      console.log("Example problem:", problems[0]);
      createContestPanel.webview.postMessage({
        problems: problems,
      });
    });

    const revealPassswordPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "contestCreation.js"
    );
    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "contestCreation.css"
    );

    console.log("Showing the html");
    createContestPanel.webview.html = getContestCreationHTML(
      createContestPanel.webview.asWebviewUri(revealPassswordPath),
      createContestPanel.webview.asWebviewUri(stylesPath)
    );

    createContestPanel.onDidChangeViewState((event) => {
      console.log("Form was submitted and state changed:", event);
    });

    createContestPanel.onDidDispose(() => {
      console.log("Form disposed");
    });

    createContestPanel.webview.onDidReceiveMessage(async (message) => {
      if (message.state === "submitted") {
        createContestPanel.dispose();

        console.log("Data is:", message.data);

        try {
          const response = await LambdaChecker.client.createContest(
            message.data
          );

          LambdaChecker.contestDataProvider.refresh();

          vscode.window.showInformationMessage(
            `Successfully created Contest ${response.id}: ${message.data.name}!`
          );
        } catch (error: any) {
          console.log("here", error);

          vscode.window
            .showErrorMessage(error.message, "Try again")
            .then((selection) => {
              if (selection === "Try again") {
                // vscode.commands.executeCommand(
                //   "lambdachecker.enroll-in-contest",
                //   contestId,
                //   hasPassword,
                //   contestDataProvider
                // );
              }
            });
        }
      }
    });
  }
}
