import path from "path";
import * as vscode from "vscode";
import { Difficulty, Language, Subject } from "../../constants";
import { defaultFolderIcon, fileIconMapping } from "../../icons";
import { HTTPClient } from "../../lambdachecker/http";
import ContestItem from "./contestItem";
import ProblemItem from "./problemItem";

export default class ProblemDataProvider
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

    console.log(this.root);
  }

  async getProblemsByDifficultyAndLanguage(
    difficulty: Difficulty,
    language: Language
  ): Promise<ProblemItem[]> {
    const problems = await this.lambdacheckerClient.getProblems();

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
      element.iconPath = {
        light: fileIconMapping[element.props.language as Language].path,
        dark: fileIconMapping[element.props.language as Language].path,
      };
    } else {
      element.iconPath = {
        light: defaultFolderIcon.path,
        dark: defaultFolderIcon.path,
      };
    }

    return element;
  }
}
