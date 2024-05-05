import * as vscode from "vscode";
import { HTTPClient } from "../api";
import { Contest, ContestItem, ContestSubject } from "../models";

export class ContestDataProvider
  implements vscode.TreeDataProvider<ContestItem>
{
  onDidChangeTreeData?:
    | vscode.Event<ContestItem | null | undefined>
    | undefined;

  root: ContestItem[];
  lambdacheckerClient: HTTPClient;

  constructor(client: HTTPClient) {
    this.lambdacheckerClient = client;
    this.root = Object.values(ContestSubject).map(
      (label) => new ContestItem(label, "subject")
    );
  }

  async getContestsBySubject(subject: ContestSubject): Promise<ContestItem[]> {
    let contests: Contest[] = [];

    try {
      contests = await this.lambdacheckerClient.getActiveContests();
      contests.push(...(await this.lambdacheckerClient.getPastContests()));
    } catch (error: any) {
      vscode.window
        .showErrorMessage(
          "Error fetching contests. Would you like to log in again?",
          error.message,
          "No"
        )
        .then((selection) => {
          if (selection !== "No") {
            vscode.commands.executeCommand("lambdachecker.login");
          }
        });
      return [];
    }

    const contestsTreeItems = contests
      .filter((contest) => contest.subject_abbreviation === subject)
      .map((contest) => new ContestItem(contest["name"] as string, "contest"));

    return contestsTreeItems;
  }

  getChildren(element?: ContestItem): vscode.ProviderResult<ContestItem[]> {
    if (element === undefined) {
      return this.root;
    }

    switch (element.type) {
      case "subject":
        // todo: improve so you don't make 2 calls for the contests
        // use element.label for filtering
        return this.getContestsBySubject(element.label as ContestSubject);
      case "problem":
        return [];
      default:
        return [];
    }
  }

  getTreeItem(
    element: ContestItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    // element.label = "haha" + element.label;

    return element;
  }
}
