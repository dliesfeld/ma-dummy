/**
 * Use the ./component/mail.client.ts file and Socket.Io to create a bidirectional connection
 * between the imap service and the client.
 * This file will listen and forward login and disconnect events.
 */

import { Socket } from "socket.io";
import MailClient, { connectionStatus } from "../components/mail.client";
import { createResponse } from "../utils/urlValidator";
import logger from "../utils/logger";

/**
 * Create Socket.Io login process
 * @param socket Socket.IO
 * @param data login information
 * @param data.password the user password
 * @param data.username the user email
 * @param data.username the email host
 */
const onImapLogin = (
  socket: Socket,
  data: {
    username?: string;
    password?: string;
    accessToken?: string;
    host: string;
  },
) => {
  const mailClient = new MailClient(data);

  socket.on("logout", async () => {
    mailClient.mailListener.stop();
    socket.disconnect();
  });

  mailClient.login((status: connectionStatus) => {
    if (status === connectionStatus.CONNECTED) {
      socket.emit("login_succeeded");
    }
  });

  mailClient.mailListener.on("error", function (err: Error) {
    logger.error(JSON.stringify(err));
    socket.emit("onError", { message: err.message });
  });

  mailClient.mailListener.on(
    "mail",
    async function (mail: {
      attachments: [];
      textAsHtml: string;
      from: { value: [{ address: string }] };
    }) {
      const { response, error } = await createResponse(
        mail.textAsHtml,
        mail.attachments.length > 0,
      );

      if (error) {
        logger.error(`Error in imap.service: ${JSON.stringify(error)}`);
      }

      if (response.hasAttachment || response.hasWeblink) {
        socket.emit("message", JSON.stringify(response));
      }
    },
  );
};

export default onImapLogin;
