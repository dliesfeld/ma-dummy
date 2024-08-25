import { Server } from "socket.io";
import https from "http";
import {
  LoginEvents,
  ServerToExtensionEvent,
  InterServerEvents,
  SocketData,
} from "../types/socket.io";

import config from "../config.json" assert { type: "json" };

/**
 *
 * @param server Setup Socket IO connection
 * @returns Socket IO instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const socketServer = (server: https.Server) => {
  const io = new Server<
    LoginEvents,
    ServerToExtensionEvent,
    InterServerEvents,
    SocketData
  >(server, {
    cors: config.socket.corsOptions,
  });
  io.setMaxListeners(120);
  return io;
};

export default socketServer;
