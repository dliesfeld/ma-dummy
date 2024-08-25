/**
 * This file contains functions to build a connection to the gmail imap service.
 */
import { gmail_v1, google } from "googleapis";
import { Socket } from "socket.io";
import { OAuth2Client } from "google-auth-library";

import OAuth2Service from "../utils/OAuth2Service";
import logger from "../utils/logger";

import { createResponse, destructMail } from "../utils/urlValidator";

import config from "../config.json" assert { type: "json" };

/**
 * Red the newest unread gmail emails between a given time and now,
 * @param socket Socket event system to forward mail messages
 * @param gmail gmail api client
 * @param receivedMail array where the id of all new messages stored
 * @returns null if there is no new message.
 */
const readMails = async (
  socket: Socket,
  gmail: gmail_v1.Gmail,
  receivedMail: string[],
) => {
  const res = await gmail.users.messages.list({
    userId: "me",
    //maxResults: 10
    q: `is:unread after:${Math.floor(new Date().getTime() / 1000)}`,
  });
  const messages = res.data.messages;

  if (!messages || messages.length === 0) {
    return;
  }

  // Contains all new messages // TODO: Kann das Modifiziert werden, weil ich ja jetzt das datum angepasst habe?
  const newMessages = messages.filter((data: gmail_v1.Schema$Message) => {
    if (data.id) {
      if (!receivedMail.includes(data.id)) {
        receivedMail.push(data.id);
        return true;
      }
      return false;
    }
    return false;
  });

  for await (const message of newMessages) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { htmlMessage, attachment } = destructMail(msg);
    if (htmlMessage || attachment) {
      const { response, error } = await createResponse(htmlMessage, attachment);

      if (error) {
        logger.error(`An error was occurred: ${JSON.stringify(error)}`);
      }

      if (response.hasAttachment || response.hasWeblink) {
        socket.emit("message", JSON.stringify(response));

        setTimeout(() => {
          logger.info("waiting for new messages");
        }, 7200000);
      }
    }
  }
};

/**
 * create an listener on a gmail account for incomming messages by a given oauth2 client
 * @param socket Is used to inform the client about the gmail, mail status
 * @param oauth2 oauth2 Client
 */
const startGMailService = (socket: Socket, oauth2: OAuth2Client) => {
  const gmail = google.gmail({ version: "v1", auth: oauth2 });
  const receivedMail: string[] = [];

  logger.info("Connected to GMail");
  setInterval(() => readMails(socket, gmail, receivedMail), 60000);
};

/**
 * Create a gmail connection by a given code. The code is created by google.
 * This function is used if the user login this first time.
 * @param socket Is used to inform the client about the gmail, mail status
 * @param data login information.
 * @param data.code a generated gmail code form the user. This code is used to login into the oauth2 service
 */
const onFirstTimeGmailLogin = async (
  socket: Socket,
  data: { code: string },
) => {
  try {
    const oauth2 = new OAuth2Service(
      config.google.client_id,
      config.google.client_key,
      config.google.redirect_url,
    );
    const { tokens } = await oauth2.getLoginTokens(data.code);
    if (!tokens || !tokens.refresh_token) {
      throw new Error("Can not set access token");
    }

    // TODO Hier habe ich kein Refresh token, ob wohl ich mich das erste mal anmelde, Sind noch Parameter falsch oder habe ich welche vergessen?
    oauth2.setCredentials(tokens);
    socket.emit("login_succeeded", { refresh_token: tokens.refresh_token });
    // regenerate access token if the token is expired after 1 hour
    oauth2.auth.on("tokens", () => {
      logger.info("generate new access token");
    });
    startGMailService(socket, oauth2.auth);

    socket.on("logout", () => {
      logger.info("gmail logout");
      socket.disconnect();
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    logger.error(err.message);
    socket.emit("onError", { message: err.message });
  }
};

/**
 * Create a gmail connection by a given refresh_token. The token is generated at the first login {@link onFirstTimeGmailLogin}
 * After the first login the cleint can use the refresh_token to create a connection.
 * @param socket Is used to inform the client about the gmail, mail status
 * @param data login information.
 * @param data.refresh_token use the refresh for login and create every hour a new access token
 */
const onGmailLogin = async (
  socket: Socket,
  data: { refresh_token: string },
) => {
  try {
    const oauth2 = new OAuth2Service(
      config.google.client_id,
      config.google.client_key,
      config.google.redirect_url,
    );

    const { refresh_token } = data;

    if (!refresh_token) {
      throw new Error("Can not set access token");
    }
    oauth2.setCredentials({ refresh_token });
    logger.info("login succeeded");
    socket.emit("login_succeeded");

    startGMailService(socket, oauth2.auth);

    socket.on("logout", () => {
      logger.info("gmail logout");
      socket.disconnect();
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    logger.error(err.message);
    socket.emit("onError", { message: err.message });
  }
};

export { onFirstTimeGmailLogin, onGmailLogin };
