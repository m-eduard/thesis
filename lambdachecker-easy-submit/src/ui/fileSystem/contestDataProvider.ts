import * as vscode from "vscode";
import ContestItem from "./contestItem";
import { Subject } from "../../constants";
import { HTTPClient } from "../../lambdachecker/http";

export default class ContestDataProvider
  implements vscode.TreeDataProvider<ContestItem>
{
  onDidChangeTreeData?:
    | vscode.Event<ContestItem | null | undefined>
    | undefined;

  root: ContestItem[];
  lambdacheckerClient: HTTPClient;

  constructor(client: HTTPClient) {
    this.lambdacheckerClient = client;
    this.root = Object.values(Subject).map(
      (label) => new ContestItem(label, "subject")
    );

    console.log(this.root);
  }

  async getContestsBySubject(subject: Subject): Promise<ContestItem[]> {
    const contests = await this.lambdacheckerClient.getActiveContests();
    contests.push(...(await this.lambdacheckerClient.getPastContests()));

    contests.forEach((contest) => {
      console.log(contest.subject_abbreviation);
    });

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
        return this.getContestsBySubject(element.label as Subject);
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
