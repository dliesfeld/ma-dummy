/**
 * This filer use the websocket instance in socket.server,ts to create sockets events for
 * login
 */

import { Server, Socket } from "socket.io";

import {
  LoginEvents,
  ServerToExtensionEvent,
  InterServerEvents,
  SocketData,
} from "../types/socket.io";
import logger from "../utils/logger";
import {
  onFirstTimeGmailLogin,
  onGmailLogin,
} from "../services/google.service";
import onImapLogin from "../services/imap.service";

const startWebSocket = (
  io: Server<
    LoginEvents,
    ServerToExtensionEvent,
    InterServerEvents,
    SocketData
  >,
) => {
  // Create connection
  io.on("connection", (socket: Socket) => {
    logger.info("start socket io server");
    // Event for the imap login without google
    socket.on("login", (data) => {
      try {
        onImapLogin(socket, data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        logger.error(err.message);
      }
    });
    // Login for gmail (first time)
    socket.on("onFirstTimeGmailLogin", (date) => {
      try {
        onFirstTimeGmailLogin(socket, date);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        logger.error(err.message);
        socket.emit("onError", { message: err.message });
      }
    });
    // Login for gmail (all other logins); data contains the refresh_token
    socket.on("onGmailLogin", (date) => {
      try {
        onGmailLogin(socket, date);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        logger.error(err.message);
        socket.emit("onError", { message: err.message });
      }
    });
  });
};

export default startWebSocket;
