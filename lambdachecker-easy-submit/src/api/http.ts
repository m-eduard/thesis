import * as vscode from "vscode";
import { Contest, Problem } from "../models";

/**
 * An HTTP client sending HTTP requests to the LambdaChecker API.
 */
export class HTTPClient {
  constructor(private token?: string) {}

  async request(route: Route, body?: string): Promise<Response> {
    let headers: { [key: string]: string } = {
      "Content-Type": "application/json",
    };

    if (this.token !== undefined) {
      headers["Authorization"] = "Bearer " + this.token;
    }

    return fetch(route.url, {
      method: route.method,
      headers: headers,
      body: body,
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<Record<string, unknown>> {
    const response = await this.request(
      new Route("POST", "/users/login"),
      JSON.stringify({
        email: email,
        password: password,
      })
    );

    const responseData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    if (responseData["token"] !== undefined) {
      this.token = responseData["token"] as string;
      return responseData;
    }

    throw new Error(responseData["message"] as string);
  }

  async getActiveContests(): Promise<Contest[]> {
    const response = await this.request(
      new Route("GET", "/contests/index_active")
    );

    const contestsData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    if (contestsData["contests"] !== undefined) {
      return contestsData["contests"] as Contest[];
    }

    throw new Error(contestsData["message"] as string);
  }

  async getPastContests(): Promise<Contest[]> {
    const response = await this.request(
      new Route("GET", "/contests/index_past")
    );

    const contestsData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    return contestsData["contests"] as Contest[];
  }

  async getProblems(): Promise<Problem[]> {
    const response = await this.request(
      new Route("GET", "/problems/index_privileged")
    );

    const problemsData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    if (problemsData["problems"] !== undefined) {
      return problemsData["problems"] as Problem[];
    }

    throw new Error(problemsData["message"] as string);
  }

  // async submitSolution(problemId: string, solution: string) {
  // }

  async getUserRank(): Promise<Record<string, unknown>> {
    const response = await this.request(new Route("GET", "/get_user_rank"));

    const userRankData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    if (userRankData["user_rank"] !== undefined) {
      return userRankData;
    }

    throw new Error(userRankData["message"] as string);
  }

  async checkTokenValidity(): Promise<boolean> {
    try {
      await this.getUserRank();
      return true;
    } catch (error: any) {
      return false;
    }
  }
}

class Route {
  private static readonly base = "https://apibeta.lambdachecker.io";

  public method: string;
  public url: string;

  constructor(method: string, path: string) {
    this.method = method;
    this.url = Route.base + path;
  }
}
