import Express, { NextFunction, Request, Response } from "express";
import haveIBeenPwned from "../models/haveIbBeenPwned.models";

const passwortCrypto = Express.Router();

passwortCrypto
  .route("/")
  /**
   *
   * /password-list:
   * post:
   *  tags:
   *    - expenses
   *  description: Check by a given password if the password listed at the top 1000 compromised passwords.
   *  responses:
   *    '200':
   *      description: Return true if password was found in the list and false if the password was not inside the list
   *    '400':
   *      description: There was no password given as parameter
   */
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      body: { password },
    } = req;

    if (!password || password.length === 0)
      return next({ status: 400, message: "The query hash was not found." });

    try {
      const result = await haveIBeenPwned.findOne({ password });

      if (result && result.password) {
        return res.status(200).json({ result: true });
      }

      return res.status(200).json({ result: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return next({ status: err.status, message: err.message });
    }
  });

export default passwortCrypto;
