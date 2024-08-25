import Express, { NextFunction, Request, Response } from "express";

import validateHTTP from "../utils/urlValidator";

const saveBrowsing = Express.Router();

saveBrowsing
  .route("/")
  /**
   *
   * /save-browsing:
   * post:
   *  description: Use the body parameter urls as array to check if the urls are phishing links.
   *  responses:
   *    200:
   *      description: List all URLs they were found
   *    400:
   *    description: The urls parameter was missing
   */
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      body: { urls },
    } = req;

    if (!urls) {
      return next({ status: 400, message: "No data was given" });
    }

    const { result, err } = await validateHTTP(urls);

    return err ? next(err) : res.status(200).json(result);
  })
  .all((_req: Request, _res: Response, next: NextFunction) => {
    return next({ status: 405, message: "Methode not allowed" });
  });

export default saveBrowsing;
