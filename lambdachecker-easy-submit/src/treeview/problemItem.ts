import * as vscode from "vscode";
import { Difficulty, Language, Problem } from "../models";

export interface ProblemItemProps {
  type: string;
  difficulty?: Difficulty;
  language?: Language;
  problemMetadata?: Problem;
  children?: ProblemItem[];
}

export class ProblemItem extends vscode.TreeItem {
  props: ProblemItemProps;

  constructor(label: string, props: ProblemItemProps) {
    let collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

    if (props.type === "problem") {
      collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    super(label, collapsibleState);
    this.props = props;
  }
}
