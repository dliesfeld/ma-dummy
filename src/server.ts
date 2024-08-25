import https from "https";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import express, { Express, Response, Request, NextFunction } from "express";

import socketServer from "./websocket/socket.server";
import startWebSocket from "./websocket/websocket.server";
import passwortPolicy from "./routes/password-policy.route";
import passwortCrypto from "./routes/password-crypto.route";
import saveBrowsing from "./routes/save-browsing.route";
import auth from "./routes/auth.route";

import logger, { httpLogger } from "./utils/logger";
import { options } from "./utils/cors";

import config from "./config.json" assert { type: "json" };

const server: Express = express();

// Database location
const dbUri = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.name}`;

// Create https server
const tlsServer = https.createServer(
  {
    key: fs.readFileSync(
      path.join(process.env.PWD || "", "certificates", "key.key"),
    ),
    cert: fs.readFileSync(
      path.join(process.env.PWD || "", "certificates", "cert.crt"),
    ),
  },
  server,
);

// Connect to database
mongoose.connect(dbUri);

// Middleware
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cookieParser());

server.options("*", cors(options));
server.use(cors(options));
server.use(httpLogger);

// Websocket entry point
const IO = socketServer(tlsServer);
startWebSocket(IO);
server.set("io", IO);

// Routes
server.use("/password-policy", passwortPolicy);
server.use("/password-list", passwortCrypto);
server.use("/save-browsing", saveBrowsing);
server.use("/auth", auth);

server.all("*", (req: Request, res: Response, next: NextFunction) => {
  return next({ status: 404, message: "Resource does not exist." });
});

// Init tls server
tlsServer.listen(config.socket.port, async () => {
  logger.info(`Server listen on port ${config.socket.port}`);
});

// Error handling
server.use(
  (
    err: { status: number; message: string },
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ) => {
    logger.error(JSON.stringify(err));
    return res.status(err.status || 500).json({
      data: {
        status: err.status || 500,
        message: err.message || "Server Error",
      },
    });
  },
);
