import * as vscode from "vscode";
import {
  BaseProblem,
  Contest,
  ContestSubject,
  SpecificProblem,
  SubmissionResult,
} from "../models";

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

  async getActiveContests(subject?: ContestSubject): Promise<Contest[]> {
    const response = await this.request(
      new Route(
        "GET",
        `/contests/index_active${
          subject !== undefined ? "?subject_abbreviation=" + subject : ""
        }`
      )
      // new Route("GET", "/contests/index_archived?academic_year=2022-2023")
    );

    const contestsData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    if (contestsData["contests"] !== undefined) {
      return contestsData["contests"] as Contest[];
    }

    throw new Error(contestsData["message"] as string);
  }

  async getPastContests(subject?: ContestSubject): Promise<Contest[]> {
    const response = await this.request(
      new Route(
        "GET",
        `/contests/index_past${
          subject !== undefined ? "?subject_abbreviation=" + subject : ""
        }`
      )
    );

    const contestsData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    return contestsData["contests"] as Contest[];
  }

  async getArchivedContests(
    academic_year: string,
    subject?: ContestSubject
  ): Promise<Contest[]> {
    const response = await this.request(
      new Route(
        "GET",
        `/contests/index_archived?academic_year=${academic_year}${
          subject !== undefined ? "&subject_abbreviation=" + subject : ""
        }`
      )
    );

    const contestsData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    return contestsData["contests"] as Contest[];
  }

  async getProblems(): Promise<BaseProblem[]> {
    const response = await this.request(
      new Route("GET", "/problems/index_privileged")
    );

    const problemsData: Record<string, unknown> =
      (await response.json()) as Record<string, unknown>;

    if (problemsData["problems"] !== undefined) {
      return problemsData["problems"] as BaseProblem[];
    }

    throw new Error(problemsData["message"] as string);
  }

  /**
   *
   * @param problemId The ID of the problem to get.
   * @param contestId Get the problem in context of a certain contest.
   */
  async getProblem(
    problemId: number,
    contestId?: number
  ): Promise<SpecificProblem> {
    const path = `/problems/${problemId}?${
      contestId !== undefined ? "contest_id=" + contestId : ""
    }`;

    console.log(path);

    const response = await this.request(new Route("GET", path));
    const problemData = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `${response.statusText}: ${
          (problemData as Record<string, unknown>)["error"]
        }`
      );
    }

    return problemData as SpecificProblem;
  }

  async submitSolution(
    problemId: number,
    contestId: number,
    solution: Uint8Array
  ): Promise<void> {
    const response = await this.request(
      new Route("POST", "/submissions"),
      JSON.stringify({
        code: solution.toString(),
        contest_id: contestId,
        problem_id: problemId,
      })
    );
    console.log(response);
    const submissionData = await response.json();

    console.log(JSON.stringify(submissionData));

    if (response.status !== 200) {
      throw new Error(
        `${response.statusText}: ${
          (submissionData as Record<string, unknown>)["message"]
        }`
      );
    }
  }

  async getSubmissions(problemId: number): Promise<SubmissionResult[]> {
    const response = await this.request(
      new Route("GET", `/user-problem-submissions?problem_id=${problemId}`)
    );

    const submissionsData = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `${response.statusText}: ${
          (submissionsData as Record<string, unknown>)["message"]
        }`
      );
    }

    return submissionsData as SubmissionResult[];
  }

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
