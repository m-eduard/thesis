import User from "./types/user";

/**
 * An HTTP client sending HTTP requests to the LambdaChecker API.
 */
export class HTTPClient {
  constructor(private token?: string) {}

  async request(route: Route, body: string): Promise<Response> {
    let headers: {[key: string]: string} = {
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

  async login(email: string, password: string) : Promise<Record<string, unknown>> {
    const response = await this.request(
      new Route("POST", "/users/login"),
      JSON.stringify({
        email: email,
        password: password,
      })
    );

    const responseData: Record<string, unknown> =
        await response.json() as Record<string, unknown>;
    
    if (responseData["token"] !== undefined) {
      this.token = responseData["token"] as string;
    }

    return responseData;
  }

  async getActiveContests() {

  }

  async getPastContests() {
    
  }

  async getProblems() {

  }

  // async submitSolution(problemId: string, solution: string) {
  // }
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
