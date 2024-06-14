import path from "path";
import * as vscode from "vscode";
import { HTTPClient, SubmissionsApiClient } from "../api";
import {
  BaseProblem,
  Contest,
  ContestSubject,
  Language,
  ProblemTest,
  RunOutput,
  SpecificProblem,
  StatusBar,
  Storage,
  SubmissionResult,
  User,
  getEphemeralSubmissionResultWebviewContent,
  getProblemWebviewContent,
  getSubmissionResultWebviewContent,
} from "../models";
import {
  getContestCreationHTML,
  getProblemCreationHTML,
  getProblemHTML,
} from "../models/webview/htmlTemplates";
import {
  ContestDataProvider,
  ProblemDataProvider,
  ProblemItem,
} from "../treeview";
import {
  ProblemSubmissionWebviewListener,
  ViewType,
  WebviewFactory,
} from "../webview";
import { CreateContestListener } from "../webview/createContestListener";
import { CreateProblemListener } from "../webview/createProblemListener";
import { ProblemWebview } from "../webview/problemWebview";

export class LambdaChecker {
  static context: vscode.ExtensionContext;
  static client: HTTPClient;
  static submissionApiClient: SubmissionsApiClient;
  static userDataCache = new Storage();
  static contestDataProvider: ContestDataProvider;
  static problemDataProvider: ProblemDataProvider;
  static users: User[] = [];
  static problems: BaseProblem[] = [];
  static allSubmissions: Map<number, SubmissionResult[]> = new Map();

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

      if (LambdaChecker.submissionApiClient === undefined) {
        LambdaChecker.submissionApiClient = new SubmissionsApiClient(
          {
            c: "aws-lambda-c-path",
            java: "aws-lambda-java-path",
          },
          "the-secret-was-removed:)"
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

      // Update the contests and problems status
      LambdaChecker.contestDataProvider.refresh();
      LambdaChecker.problemDataProvider.refresh();

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

  static async showProblem(
    problemId: number,
    contestId?: number,
    contestName?: string
  ) {
    let problem;

    try {
      problem = await LambdaChecker.client.getProblem(problemId, contestId);
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
        localResourceRoots: [
          vscode.Uri.joinPath(LambdaChecker.context.extensionUri, "resources"),
        ],
        retainContextWhenHidden: true,
      }
    );

    // Create the listener once (more efficient than creating a new
    // listener for each message received)
    const problemWebview = new ProblemWebview(problem, problemPanel);

    problemPanel.webview.onDidReceiveMessage(async (message) => {
      problemWebview.webviewListener(message);
    });

    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "problemView.js"
    );
    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "problemView.css"
    );

    problemPanel.webview.html = getProblemHTML(
      problemPanel.webview.asWebviewUri(scriptsPath),
      problemPanel.webview.asWebviewUri(stylesPath),
      problem,
      contestId,
      contestName
    );
  }

  static async showSubmissionResult(
    submissionResult: SubmissionResult | RunOutput,
    problemName: string,
    problemTests: ProblemTest[],
    problemLanguage: Language,
    ephemeralSubmission: boolean = false
  ) {
    // console.log(JSON.parse(submissionResult.run_output) as RunOutput);

    let problemId = ephemeralSubmission
      ? 0
      : (submissionResult as SubmissionResult).problem_id;

    const submissionResultPanelWrapper = WebviewFactory.createWebview(
      ViewType.UserSubmissionResult,
      `${problemId}. ${problemName}`
    );
    const submissionResultPanel = submissionResultPanelWrapper.webviewPanel;

    if (ephemeralSubmission === false) {
    // Create the listener once, and use it for each message received
    const currentProblemResultListener = new ProblemSubmissionWebviewListener(
        problemId,
      problemName,
      problemLanguage,
        (submissionResult as SubmissionResult).code,
      submissionResultPanel,
      problemTests
    );

    submissionResultPanel.webview.onDidReceiveMessage(async (message) => {
      currentProblemResultListener.webviewListener(message);
    });
    }

    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "submissionView.css"
    );

    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "submissionView.js"
    );

    if (ephemeralSubmission === false) {
    submissionResultPanel.webview.html = getSubmissionResultWebviewContent(
      submissionResultPanel.webview.asWebviewUri(stylesPath),
      submissionResultPanel.webview.asWebviewUri(scriptsPath),
        submissionResult as SubmissionResult,
        problemTests
      );
    } else {
      submissionResultPanel.webview.html =
        getEphemeralSubmissionResultWebviewContent(
          submissionResultPanel.webview.asWebviewUri(stylesPath),
          submissionResultPanel.webview.asWebviewUri(scriptsPath),
          submissionResult as RunOutput,
      problemTests
    );
    }
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
        action: "updateUsers",
        users: users.filter((user) => user.role === "teacher"),
      });
    });

    LambdaChecker.client.getProblems().then((problems) => {
      LambdaChecker.problems = problems;
      console.log("Example problem:", problems[0]);
      createContestPanel.webview.postMessage({
        action: "updateProblems",
        problems: problems,
      });
    });

    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "contestCreation.css"
    );
    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "contestCreation.js"
    );

    console.log("Showing the html");
    createContestPanel.webview.html = getContestCreationHTML(
      createContestPanel.webview.asWebviewUri(stylesPath),
      createContestPanel.webview.asWebviewUri(scriptsPath)
    );

    createContestPanel.onDidDispose(() => {
      console.log("Form disposed");
    });

    const createContestListener = new CreateContestListener(createContestPanel);
    createContestPanel.webview.onDidReceiveMessage(async (message) =>
      createContestListener.webviewListener(message)
    );
  }

  static async createProblem() {
    const createProblemPanel = vscode.window.createWebviewPanel(
      "lambdachecker.webview.create-problem",
      "Create Problem",
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

    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "problemCreation.css"
    );
    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "problemCreation.js"
    );

    createProblemPanel.webview.html = getProblemCreationHTML(
      createProblemPanel.webview.asWebviewUri(stylesPath),
      createProblemPanel.webview.asWebviewUri(scriptsPath)
    );

    const createProblemListener = new CreateProblemListener(createProblemPanel);
    createProblemPanel.webview.onDidReceiveMessage(async (message) => {
      createProblemListener.webviewListener(message);
    });
  }

  static async editProblem(problemData: SpecificProblem) {
    console.log(problemData);

    const editProblemPanel = vscode.window.createWebviewPanel(
      "lambdachecker.webview.edit-problem",
      `${problemData.id}. Edit Problem`,
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

    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "problemCreation.css"
    );
    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "problemCreation.js"
    );

    editProblemPanel.webview.html = getProblemCreationHTML(
      editProblemPanel.webview.asWebviewUri(stylesPath),
      editProblemPanel.webview.asWebviewUri(scriptsPath),
      true
    );

    // Populate the form with data
    editProblemPanel.webview.postMessage({
      action: "populateProblemForm",
      data: JSON.stringify(problemData),
    });

    const createProblemListener = new CreateProblemListener(
      editProblemPanel,
      false,
      problemData
    );
    editProblemPanel.webview.onDidReceiveMessage(async (message) => {
      createProblemListener.webviewListener(message);
    });
  }

  static async editContest(contestData: Contest) {
    console.log(contestData);

    const editContestPanel = vscode.window.createWebviewPanel(
      "lambdachecker.webview.edit-problem",
      `${contestData.id}. Edit Contest`,
      {
        viewColumn: vscode.ViewColumn.One,
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
      editContestPanel.webview.postMessage({
        action: "updateUsers",
        users: users.filter((user) => user.role === "teacher"),
      });
    });

    LambdaChecker.client.getProblems().then((problems) => {
      LambdaChecker.problems = problems;
      console.log("Example problem:", problems[0]);
      editContestPanel.webview.postMessage({
        action: "updateProblems",
        problems: problems,
      });
    });

    const stylesPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "styles",
      "contestCreation.css"
    );
    const scriptsPath = vscode.Uri.joinPath(
      LambdaChecker.context.extensionUri,
      "resources",
      "scripts",
      "contestCreation.js"
    );

    editContestPanel.webview.html = getContestCreationHTML(
      editContestPanel.webview.asWebviewUri(stylesPath),
      editContestPanel.webview.asWebviewUri(scriptsPath),
      true
    );

    // Populate the form with data
    editContestPanel.webview.postMessage({
      action: "populateContestForm",
      data: contestData,
    });

    const createContestListener = new CreateContestListener(
      editContestPanel,
      false,
      contestData.id
    );
    editContestPanel.webview.onDidReceiveMessage(async (message) => {
      createContestListener.webviewListener(message);
    });
  }
}
