import * as vscode from "vscode";
import { BaseProblem, Difficulty, Language, SpecificProblem } from "../models";

export interface ProblemItemProps {
  type: string;
  difficulty?: Difficulty;
  language?: Language;
  problemMetadata?: BaseProblem | SpecificProblem;
  children?: ProblemItem[];
  contestId?: number;
  contestName?: string;
}

export class ProblemItem extends vscode.TreeItem {
  props: ProblemItemProps;

  constructor(
    label: string,
    props: ProblemItemProps,
    public partialPath?: string
  ) {
    let collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

    if (props.type === "problem") {
      collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    super(label, collapsibleState);
    this.props = props;
  }
}
