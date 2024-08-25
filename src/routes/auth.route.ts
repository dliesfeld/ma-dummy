import Express, { NextFunction, Request, Response } from "express";

import config from "../config.json" assert { type: "json" };
import OAuth2Service from "../utils/OAuth2Service";

const auth = Express.Router();

auth
  .route("/go-login")
  /**
   *
   * /auth/go-login:
   * get:
   *  description: Create a link for the OAuth2 authentication. This link have to be use to create a authentication code.
   *  responses:
   *    200:
   *      description: Link was created
   *    400:
   *    description: There was something wrong in the registration process
   */
  .get((req: Request, res: Response, next: NextFunction) => {
    try {
      const oauth2 = new OAuth2Service(
        config.google.client_id,
        config.google.client_key,
        config.google.redirect_url,
      );
      return res.redirect(oauth2.getAuthUrl());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return next({
        status: 400,
        message: "Can not connect to Google OAuth2 Service",
      });
    }
  })
  .all((_req: Request, _res: Response, next: NextFunction) => {
    return next({ status: 405, message: "Methode not allowed" });
  });

auth
  /**
   *
   * /auth/redirect:
   * get:
   *  description: Redirect to the client by the given auth. code.
   *  responses:
   *    200:
   *      description: Successfully redirect
   *    400:
   *    description: No code was given
   */
  .route("/redirect")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.query;

      if (!code)
        return next({
          status: 400,
          message:
            "No code for token was given. Use the /go-login route to build a code.",
        });
      return res.redirect(`http://localhost:3000?code=${code}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return next({ status: err.code, message: err.message });
    }
  })
  .all((_req: Request, _res: Response, next: NextFunction) => {
    return next({ status: 405, message: "Methode not allowed" });
  });

export default auth;
