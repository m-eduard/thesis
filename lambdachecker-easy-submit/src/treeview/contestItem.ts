import * as vscode from "vscode";
import {
  ContestSubject,
  EnrollmentStatus,
  ProblemMetadataContestContext,
} from "../models";
import { ProblemItem, ProblemItemProps } from "./problemItem";

export interface ContestItemProps {
  type: string;
  subject?: ContestSubject;
  problems?: ProblemMetadataContestContext[];
  contestId?: number;
  children?: ContestItem[];
  startDate?: string;
  status?: EnrollmentStatus;
  hasPassword?: boolean;
  userId?: number;
  collabId?: number;
}

export class ContestItem extends vscode.TreeItem {
  props: ContestItemProps;

  constructor(
    label: string,
    props: ContestItemProps,
    public partialPath: string
  ) {
    let collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

    if (props.type === "problem") {
      collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    super(label, collapsibleState);
    this.props = props;
  }
}
