import * as vscode from "vscode";
import { LambdaChecker } from "../commands";
import { CreateProblemWebviewMessage } from "../models";
import { SubmissionFile } from "../storage";

export class CreateProblemListener {
  private submissionFile?: SubmissionFile;

  constructor(public panel: vscode.WebviewPanel) {}

  async webviewListener(message: CreateProblemWebviewMessage) {
    // const getSubmissionsSafe = async () => {
    //   return LambdaChecker.client
    //     .getSubmissions(this.problemId)
    //     .catch((error) => {
    //       vscode.window.showErrorMessage(error.message);
    //       return [] as SubmissionResult[];
    //     });
    // };

    const uploadOptions: vscode.OpenDialogOptions = {
      canSelectFiles: true,
      canSelectFolders: false,
      title: "Upload From",
    };

    switch (message.action) {
      case "uploadTestFile":
        vscode.window.showOpenDialog(uploadOptions).then(async (fileUri) => {
          if (fileUri && fileUri[0]) {
            const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);

            this.panel.webview.postMessage({
              action: "uploadTestFileResponse",
              testId: message.testId,
              data: fileContent.toString(),
            });
          }
        });
        break;
      case "openSkeletonFile":
        if (this.submissionFile === undefined) {
          this.submissionFile = new SubmissionFile(
            0,
            message.problemData!.name,
            message.problemData!.language,
            ""
          );
        }
        this.submissionFile.openInEditor();

        break;
      case "uploadSkeletonFile":
        vscode.window.showOpenDialog(uploadOptions).then(async (fileUri) => {
          if (fileUri && fileUri[0]) {
            // Read the file
            const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);

            // Return the content to the webview
            this.panel.webview.postMessage({
              action: "uploadSkeletonFileResponse",
              data: fileContent.toString(),
            });
          }
        });

        // // Second, when the current batch is ready, replace the
        // // old HTML content with this one
        // getSubmissionsSafe().then((submissions) => {
        //   this.allSubmissions = submissions;
        //   this.panel.webview.html = getSubmissionsTableHTML(
        //     this.allSubmissions,
        //     this.problemTests
        //   );
        // });

        // // First, show the old batch of submissions
        // this.panel.webview.html = getSubmissionsTableHTML(
        //   this.allSubmissions,
        //   this.problemTests
        // );

        break;
      case "sendRequestToApi":
        const { skeleton_source_is_local, ...createProblemData } =
          message.problemData!;

        if (skeleton_source_is_local === true) {
          createProblemData.skeleton =
            (await this.submissionFile?.readSubmissionFile())?.toString() || "";
        }

        console.log(createProblemData);

        this.panel.dispose();

        // try {
        //   const response = await LambdaChecker.client.createContest(
        //     message.data
        //   );

        //   LambdaChecker.contestDataProvider.refresh();

        //   vscode.window.showInformationMessage(
        //     `Successfully created Contest ${response.id}: ${message.data.name}!`
        //   );
        // } catch (error: any) {
        //   this.panel.dispose();
        //   console.log("here", error);

        //   vscode.window.showErrorMessage(error.message);
        // }

        break;
    }
  }
}
