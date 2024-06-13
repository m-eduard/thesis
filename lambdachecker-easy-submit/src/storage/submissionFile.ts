import * as os from "os";
import path from "path";
import * as vscode from "vscode";
import { Language, languageExtensions } from "../models";
import { ProblemEditor } from "../webview";

export class SubmissionFile {
  private fileUri: vscode.Uri;

  constructor(
    public problemId: number,
    public problemName: string,
    public problemLanguage: Language,
    public problemSkel: string
  ) {
    this.fileUri = vscode.Uri.file(this.getSubmissionPath());
  }

  public get Uri(): vscode.Uri {
    return this.fileUri;
  }

  static getSubmissionsFolderPath(): string {
    let submissionsFolderPath = vscode.workspace
      .getConfiguration("lambdaChecker")
      .get<string>("submissionsFolder", "");

    if (submissionsFolderPath === "") {
      submissionsFolderPath = path.join(os.homedir(), "lambdachecker");
    }

    return submissionsFolderPath;
  }

  getSubmissionPath(): string {
    return path.join(
      SubmissionFile.getSubmissionsFolderPath(),
      `${this.problemId}_${this.problemName.trim().replaceAll(" ", "_")}${
        languageExtensions[this.problemLanguage] || ".tmp"
      }`
    );
  }

  private async fileExists(): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(this.fileUri);
      return true;
    } catch {}

    return false;
  }

  /**
   * Creates a file with the skeleton code, if it does not exist
   */
  async createSubmissionFile(override: boolean = false): Promise<void> {
    if (!(await this.fileExists()) || override) {
      await vscode.workspace.fs.writeFile(
        this.fileUri,
        Buffer.from(this.problemSkel)
      );
    }
  }

  async openInEditor(override: boolean = false): Promise<void> {
    await this.createSubmissionFile(override);
    ProblemEditor.show(this);
  }

  async readSubmissionFile(): Promise<Uint8Array> {
    await this.createSubmissionFile();
    return await vscode.workspace.fs.readFile(this.fileUri);
  }
}
