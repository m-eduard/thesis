import * as vscode from "vscode";
import { ProblemMetadataContestContext } from "../models";
import { ProblemItem, ProblemItemProps } from "./problemItem";

export class ContestItem extends vscode.TreeItem {
  type: string;
  problems?: ProblemMetadataContestContext[];
  problemProps?: ProblemItemProps;
  contestId?: number;

  constructor(
    label: string,
    type: string,
    problems?: ProblemMetadataContestContext[],
    contestId?: number
  ) {
    let collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

    if (type === "problem") {
      collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    super(label, collapsibleState);

    this.type = type;
    this.problems = problems;
    this.contestId = contestId;
  }
}
