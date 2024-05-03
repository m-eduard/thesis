import * as vscode from 'vscode';

export default class ContestItem extends vscode.TreeItem {
    children: ContestItem[] | undefined;
    type: string;

    constructor(label: string, type: string) {
        let collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

        if (type === 'problem') {
            collapsibleState = vscode.TreeItemCollapsibleState.None;
        }

        super(label, collapsibleState);

        this.type = type;
    }
}
