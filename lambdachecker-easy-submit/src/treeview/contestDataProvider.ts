import * as vscode from "vscode";
import { HTTPClient } from "../api";
import { defaultFolderIcon, fileIconMapping } from "../icons";
import { Contest, ContestSubject, Language } from "../models";
import { ContestItem } from "./contestItem";
import { ProblemItem } from "./problemItem";

export class ContestDataProvider
  implements vscode.TreeDataProvider<ContestItem | ProblemItem>
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

  async getContestsBySubject(
    subject: ContestSubject
  ): Promise<ContestItem[] | ProblemItem[]> {
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
      .map(
        (contest) =>
          new ContestItem(
            contest["name"] as string,
            "contest",
            contest["problems"],
            contest.id
          )
      );

    console.log(contestsTreeItems);

    return contestsTreeItems;
  }

  getChildren(
    element?: ContestItem
  ): vscode.ProviderResult<ContestItem[] | ProblemItem[]> {
    if (element === undefined) {
      return this.root;
    }

    switch (element.type) {
      case "subject":
        return this.getContestsBySubject(element.label as ContestSubject);
      case "contest":
        return element.problems!.map(
          (problem) =>
            new ProblemItem(`${problem.id}. ${problem.name}` as string, {
              type: "problem",
              difficulty: problem.difficulty,
              language: problem.language_id! === 1 ? Language.Java : Language.C,
              problemMetadata: problem,
              contestId: element.contestId,
            })
        );
      case "problem":
        return [];
      default:
        return [];
    }
  }

  getTreeItem(
    element: ContestItem | ProblemItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (element instanceof ProblemItem) {
      console.log(element);
      console.log((element as ProblemItem).props.language);

      element.iconPath =
        fileIconMapping[element.props.language as Language].path;
      // element.iconPath = {
      //   light: fileIconMapping[element.props.language as Language].path,
      //   dark: fileIconMapping[element.props.language as Language].path,
      // };

      console.log("Here is ", element.props.contestId);

      element.command = {
        command: "lambdachecker.show-problem",
        title: "Show Problem",
        arguments: [element, element.props.contestId],
      };
    }
    // else {
    //   element.iconPath = {
    //     light: defaultFolderIcon.path,
    //     dark: defaultFolderIcon.path,
    //   };
    // }

    element.resourceUri = vscode.Uri.from({
      scheme: "lambdachecker",
    });

    return element;
  }
}
