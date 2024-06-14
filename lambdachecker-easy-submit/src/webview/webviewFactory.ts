import * as vscode from "vscode";
import { Webview } from "../models";

export enum ViewType {
  UserAllSubmissions = "lambdachecker.webview.user-all-submissions",
  UserSubmissionResult = "lambdachecker-webview.user-submission-result",
}

/**
 * Class used for tracking the active Webviews and listeners
 */
export class WebviewFactory {
  static openWebviews: Map<string, Map<string, Webview>> = new Map();

  static async showWebview(title: string) {
    if (this.openWebviews.has(title)) {
    }
  }

  static createWebview(viewType: ViewType, title: string): Webview {
    if (!Object.values(ViewType).includes(viewType)) {
      throw new Error("Invalid viewType");
    }

    const newWebview = new Webview(
      viewType,
      title,
      viewType === ViewType.UserAllSubmissions
        ? {
            viewColumn: vscode.ViewColumn.Two,
            preserveFocus: false,
          }
        : viewType === ViewType.UserSubmissionResult
        ? {
            viewColumn: vscode.ViewColumn.Two,
            preserveFocus: false,
          }
        : {
            viewColumn: vscode.ViewColumn.Three,
            preserveFocus: false,
          },
      viewType === ViewType.UserAllSubmissions
        ? {
            enableScripts: true,
            enableFindWidget: true,
          }
        : viewType === ViewType.UserSubmissionResult
        ? {
            enableScripts: true,
            enableFindWidget: true,
          }
        : {
            enableScripts: true,
            enableFindWidget: true,
          }
    );

    if (!this.openWebviews.has(viewType)) {
      this.openWebviews.set(viewType, new Map<string, Webview>());
    }

    this.openWebviews.get(viewType)!.set(title, newWebview);
    return newWebview;
  }

  static addListenerForWebview(
    viewType: string,
    title: string,
    listener: vscode.Disposable
  ) {
    if (!this.openWebviews.has(viewType)) {
      this.openWebviews.set(viewType, new Map<string, Webview>());
    }

    this.openWebviews.get(viewType)!.get(title)?.addListener(listener);
  }

  static disposeListenersForWebview(viewType: string, title: string) {
    console.log("Disposing all the listeners for", title, viewType);

    if (!this.openWebviews.has(viewType)) {
      this.openWebviews.set(viewType, new Map<string, Webview>());
    }

    this.openWebviews.get(viewType)!.get(title)?.disposeListeners();
  }
}
