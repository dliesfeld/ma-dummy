import type { IncomingMessage } from "http";
import type { SessionData } from "express-session";
import type { Socket } from "socket.io";

export declare module "express-session" {
  interface SessionData {
    isSet: boolean;
  }
}
interface SessionIncomingMessage extends IncomingMessage {
  session: SessionData;
}

export interface SessionSocket extends Socket {
  request: SessionIncomingMessage;
}
declare module "https" {
  interface IncomingMessage {
    cookieHolder?: string;
    session: Session & Partial<session.SessionData>;
  }
}
