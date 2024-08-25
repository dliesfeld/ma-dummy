/**
 * A class to request a data from another host.
 */
class HTTPService {
  #baseUrl: string;

  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  /**
   * Perform a HTML GET request to an extern api.
   * @param subUrl utl to the extern api
   * @returns the result of the request
   */
  async get(subUrl: string) {
    return await fetch(`${this.#baseUrl}/${subUrl}`).then((res) => res.text());
  }

  /**
   * Perform a HTML POST request to an extern api.
   * @param subUrl utl to the extern api
   * @param body contains the body infomration of the POST
   * @returns the result of the request
   */
  async postJSON(url: string, body: object) {
    url = this.#baseUrl + url;
    return await fetch(url, {
      credentials: "include",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  }
}

export default HTTPService;
