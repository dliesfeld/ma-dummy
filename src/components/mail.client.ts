import { MailListener } from "mail-listener5";

import logger from "../utils/logger";
export enum connectionStatus {
  CONNECTED,
  CONNECTION_FAILS,
}

export type LoginOptions = {
  host: string;
  username?: string;
  password?: string;
  isGoogle?: boolean;
  accessToken?: string;
};

/**
 * This prototype create a connection via IMAP between client and e-Mail Server.
 * It can be use to get Information about incoming email messages.
 * By default it create a connection to the LMU LRZ Imap service studlmu.lrz.de
 */
export default class MailClient {
  // socket.request.session.save();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #mailListener: any;

  constructor(params: LoginOptions) {
    if (params.username && params.password) {
      this.#init(params.username, params.password, params.host);
    } else {
      throw new Error("Cannot create MailClient, parameter not valid");
    }
  }

  /**
   * Declare  the connection to the imap service
   * @param username email dress of the user
   * @param password password of the user
   * @param host the host to connect to
   */
  #init(username: string, password: string, host?: string) {
    this.#mailListener = new MailListener({
      username,
      password,
      host: host || "studlmu.lrz.de",
      port: 993, // imap port
      tls: true,
      connTimeout: 10000, // Default by node-imap
      authTimeout: 5000, // Default by node-imap,
      // eslint-disable-next-line no-console
      debug: () => logger.debug, // Or your custom function with only one incoming argument. Default: null
      autotls: "never", // default by node-imap
      mailbox: "INBOX", // mailbox to monitor
      searchFilter: ["NEW"],
      markSeen: true, // all fetched email willbe marked as seen and not fetched next time
      fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
      attachments: false, // download attachments as they are encountered to the project directory
      attachmentOptions: { directory: "attachments/" }, // specify a download directory for attachments
    });
  }

  /**
   * Initialize a connection and start the login process
   * @param callback function to react on a successful connection
   */
  login(callback: (status: connectionStatus) => void) {
    this.#mailListener.start();

    this.#mailListener.on("server:connected", function () {
      logger.info("Connected to LMU IMAP");
      callback(connectionStatus.CONNECTED);
    });

    // listen on in comming messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.#mailListener.on("mailbox", function (mailbox: any) {
      logger.info("Total number of mails: ", mailbox.messages.total); // this field in mailbox gives the total number of emails
    });

    // listen on disconnect when the client close the connection
    this.#mailListener.on("server:disconnected", function () {
      logger.info("imapDisconnected");
    });
  }

  /**
   * Return an instance of the imap connection
   */
  get mailListener() {
    return this.#mailListener;
  }
}
