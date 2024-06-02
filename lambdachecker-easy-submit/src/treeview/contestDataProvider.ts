import * as vscode from "vscode";
import { HTTPClient } from "../api";
import { defaultFolderIcon, fileIconMapping } from "../icons";
import {
  Contest,
  ContestSubject,
  Language,
  languageIdMapping,
} from "../models";
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
  contestsPromises: Map<ContestSubject, Promise<ContestItem[]>> = new Map();

  constructor(client: HTTPClient) {
    this.lambdacheckerClient = client;
    this.root = Object.values(ContestSubject).map(
      (label) => new ContestItem(label, "subject")
    );

    // Create a promise for each subject for fetching contests
    Object.values(ContestSubject).forEach((subject) => {
      this.contestsPromises.set(subject, this.getContestsBySubject(subject));
    });
  }

  async getContestsBySubject(subject: ContestSubject): Promise<ContestItem[]> {
    let contests: Contest[] = [];

    try {
      const start = performance.now();

      const contestsPromises = [
        this.lambdacheckerClient.getActiveContests(subject),
        this.lambdacheckerClient.getPastContests(subject),
      ];

      contests = await Promise.all(contestsPromises).then((values) => {
        return values.flat();
      });

      console.log(contests);
      const end = performance.now();
      console.log("Time taken: ", end - start, " | ", start, end);
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

    const contestsTreeItems = contests.map(
      (contest) =>
        new ContestItem(
          contest["name"] as string,
          "contest",
          contest["problems"],
          contest.id
        )
    );

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
        return this.contestsPromises.get(element.label as ContestSubject);
      case "contest":
        return element.problems!.map(
          (problem) =>
            new ProblemItem(`${problem.id}. ${problem.name}` as string, {
              type: "problem",
              difficulty: problem.difficulty,
              language: languageIdMapping[problem.language_id],
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
      element.iconPath =
        fileIconMapping[element.props.language as Language].path;

      element.command = {
        command: "lambdachecker.show-problem",
        title: "Show Problem",
        arguments: [element, element.props.contestId],
      };
    }

    element.resourceUri = vscode.Uri.from({
      scheme: "lambdachecker",
    });

    return element;
  }
}
