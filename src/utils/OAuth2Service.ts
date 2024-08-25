import { google } from "googleapis";
import { OAuth2Client, Credentials } from "google-auth-library";
import { getSecret } from "./crypto";

/**
 * This prototype create perform a oauth2 authentication with google
 */
export default class OAuth2Service {
  #authClient: OAuth2Client;

  constructor(clientId: string, clientKey: string, redirectUrl: string) {
    const OAuth2 = google.auth.OAuth2;
    this.#authClient = new OAuth2(clientId, clientKey, redirectUrl);
  }

  get auth() {
    return this.#authClient;
  }

  /**
   * Create a loin link to authenticate the client at the google service
   * @returns web link to the google service
   */
  getAuthUrl() {
    return this.#authClient.generateAuthUrl({
      access_type: "offline",
      scope: "https://mail.google.com",
      include_granted_scopes: true,
      state: getSecret(),
    });
  }
  /** Return tokens id_token, access_token, refresh_token
   * @param code Code the client get after the authentication process
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getLoginTokens(code: any) {
    const { tokens } = await this.#authClient.getToken(code);
    return {
      tokens,
    };
  }

  /**
   * Use the  refresh token to skip the login process
   * after the client sign in the first time.
   * @param refreshToken the refresh_token
   */
  setCredentials(refreshToken: Credentials) {
    this.#authClient.setCredentials(refreshToken);
  }
}
