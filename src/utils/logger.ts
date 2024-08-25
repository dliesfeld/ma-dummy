/**
 * A file contains a logger to log server relevant events likes error or server connection status
 * The default console.log is unreliable by perform asynchronous actions like working with *
 * promises, callback function or async and await.
 */

import pino from "pino";
import PinoHttp from "pino-http";

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

/**
 * Create et every api call a log about the status of the call
 */
const httpLogger = PinoHttp({
  logger: logger,
  serializers: {
    req: function customReqSerializer(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
  },
});

export default logger;
export { httpLogger };
