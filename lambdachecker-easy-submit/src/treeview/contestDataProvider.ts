import * as vscode from "vscode";
import { HTTPClient } from "../api";
import { defaultFolderIcon, fileIconMapping } from "../icons";
import {
  Contest,
  ContestSubject,
  Language,
  getAcademicYearsRange,
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
  archivedContestsPromises: Map<string, Promise<ContestItem[]>> = new Map();

  constructor(client: HTTPClient) {
    this.lambdacheckerClient = client;

    // Create a subroot for each subject and for
    // the archived academical years
    this.root = Object.values(ContestSubject).map((subject) => {
      const childrenItems = getAcademicYearsRange().map(
        (year) =>
          new ContestItem(year, {
            type: "academic_year",
            subject: subject,
          })
      );

      return new ContestItem(subject, {
        type: "subject",
        children: childrenItems,
      });
    });

    // Create a promise for each subject for fetching contests
    Object.values(ContestSubject).forEach((subject) => {
      this.contestsPromises.set(subject, this.getContestsBySubject(subject));

      getAcademicYearsRange().forEach((year) => {
        this.archivedContestsPromises.set(
          subject + year,
          this.getContestsBySubject(subject, true, year)
        );
      });
    });
  }

  async getContestsBySubject(
    subject: ContestSubject,
    archived: boolean = false,
    academic_year?: string
  ): Promise<ContestItem[]> {
    let contests: Contest[] = [];

    try {
      const contestsPromises = archived
        ? [
            this.lambdacheckerClient.getArchivedContests(
              academic_year!,
              subject
            ),
          ]
        : [
            this.lambdacheckerClient.getActiveContests(subject),
            this.lambdacheckerClient.getPastContests(subject),
          ];

      contests = await Promise.all(contestsPromises).then((values) => {
        return values.flat();
      });
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
        new ContestItem(contest["name"] as string, {
          type: "contest",
          problems: contest["problems"],
          contestId: contest.id,
        })
    );

    return contestsTreeItems;
  }

  getChildren(
    element?: ContestItem
  ): vscode.ProviderResult<ContestItem[] | ProblemItem[]> {
    if (element === undefined) {
      return this.root;
    }

    switch (element.props.type) {
      case "subject":
        // Concatenate the contests of the current year
        // with new items, one for each archived academic year
        return this.contestsPromises
          .get(element.label as ContestSubject)
          ?.then((contests) => [...contests, ...element.props.children!]);
      case "academic_year":
        // Retrieve the archived contests for a specific academic year
        return this.archivedContestsPromises.get(
          (element.props.subject! + element.label) as string
        );
      case "contest":
        return element.props.problems!.map(
          (problem) =>
            new ProblemItem(`${problem.id}. ${problem.name}` as string, {
              type: "problem",
              difficulty: problem.difficulty,
              language: languageIdMapping[problem.language_id],
              problemMetadata: problem,
              contestId: element.props.contestId,
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
