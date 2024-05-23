import * as vscode from "vscode";

import { HTTPClient } from "../api";
import { defaultFolderIcon, fileIconMapping } from "../icons";
import { Difficulty, Language, Problem } from "../models";
import { ProblemItem } from "./problemItem";

export class ProblemDataProvider
  implements vscode.TreeDataProvider<ProblemItem>
{
  root: ProblemItem[];
  lambdacheckerClient: HTTPClient;

  constructor(client: HTTPClient) {
    this.lambdacheckerClient = client;
    this.root = Object.values(Language).map((language) => {
      const childrenItems = Object.values(Difficulty).map(
        (difficulty) =>
          new ProblemItem(difficulty, {
            type: "difficulty",
            difficulty: difficulty,
            language: language,
          })
      );

      return new ProblemItem(language, {
        type: "language",
        language: language,
        children: childrenItems,
      });
    });
  }

  async getProblemsByDifficultyAndLanguage(
    difficulty: Difficulty,
    language: Language
  ): Promise<ProblemItem[]> {
    let problems: Problem[] = [];

    try {
      problems = await this.lambdacheckerClient.getProblems();
    } catch (error: any) {
      vscode.window
        .showErrorMessage(
          "Error fetching problems. Would you like to log in again?",
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

    const contestsTreeItems = problems
      .filter(
        (problem) =>
          problem.difficulty === difficulty && problem.language === language
      )
      .map(
        (problem) =>
          new ProblemItem(`${problem.id}. ${problem.name}` as string, {
            type: "problem",
            difficulty: problem.difficulty,
            language: problem.language,
            problemMetadata: problem,
          })
      );

    return contestsTreeItems;
  }

  getChildren(element?: ProblemItem): vscode.ProviderResult<ProblemItem[]> {
    if (element === undefined) {
      return this.root;
    }

    switch (element.props.type) {
      case "language":
        return element.props.children;
      case "difficulty":
        return this.getProblemsByDifficultyAndLanguage(
          element.props.difficulty as Difficulty,
          element.props.language as Language
        );
      case "problem":
        return [];
      default:
        return [];
    }
  }

  getTreeItem(
    element: ProblemItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (element.props.type === "problem") {
      element.iconPath =
        fileIconMapping[element.props.language as Language].path;

      element.command = {
        command: "lambdachecker.show-problem",
        title: "Show Problem",
        arguments: [element],
      };
    }

    element.resourceUri = vscode.Uri.from({
      scheme: "lambdachecker",
      authority: element.props.type === "problem" ? "leaf" : "node",
    });

    return element;
  }
}
