declare module "mail-listener5" {
  import { logger } from "../utils/logger";
  interface MailListenerObject {
    username?: string;
    password?: string;
    host: string;
    port: number;
    xoauth2?: string;
    tls: boolean;
    connTimeout: number;
    authTimeout: number;
    debug: logger.debug;
    autotls: string;
    tlsOptions?: { rejectUnauthorized: boolean; servername: string };
    mailbox: string;
    searchFilter: [string];
    markSeen: boolean;
    fetchUnreadOnStart?: boolean;
    attachments: boolean;
    attachmentOptions: { directory: string };
    start: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, callback: (...args: any) => void): () => void;
    stop: () => void;
  }
  export interface MailListenerInterface {
    new (options: {
      username?: string;
      password?: string;
      host: string;
      port: number; // imap port
      xoauth2?: string;
      tls: boolean;
      connTimeout: number; // Default by node-imap
      authTimeout: number; // Default by node-imap,
      debug: () => void; // Or your custom function with only one incoming argument. Default: null
      autotls: string; // default by node-imap
      tlsOptions?: { rejectUnauthorized: boolean; servername: string };
      mailbox: string; // mailbox to monitor
      searchFilter: [string]; // the search filter being used after an IDLE notification has been retrieved
      markSeen: boolean; // all fetched email willbe marked as seen and not fetched next time
      fetchUnreadOnStart: boolean; // use it only if you want to get all unread email on lib start. Default is `false`,
      attachments: boolean; // download attachments as they are encountered to the project directory
      attachmentOptions: { directory: string };
    }): MailListenerObject;
  }

  export const MailListener: MailListenerInterface;
}
