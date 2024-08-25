// TODO: check password if compromised
// https://haveibeenpwned.com/API/v3#PwnedPasswords (SHA-1)

import Express, { NextFunction, Request, Response } from "express";

const POLICY = {
  SHORT_COMPLEX: {
    MIN_LENGTH: 8,
    REGEX: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z]).{8,}$",
  },
  LONG_SIMPLE: {
    MIN_LENGTH: 20,
    REGEX: `^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\\d]{20,}|^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{20,}|^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{20,}|(?=.*[\\w])(?=.*[\\W])[\\w\\W]{20,}`,
  },
};

const passwortPolicy = Express.Router();

passwortPolicy
  .route("/")
  /**
   *
   * /password-policy:
   * get:
   *  description: Return the BSI conform password policy.
   *    Use this link for more information https://www.bsi.bund.de/EN/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Accountschutz/Sichere-Passwoerter-erstellen/sichere-passwoerter-erstellen_node.html
   *  responses:
   *    200:
   *      description: Return the Policy
   */
  .get((_req: Request, res: Response) => {
    return res.status(200).json(POLICY);
  })
  .all((_req: Request, _res: Response, next: NextFunction) => {
    return next({ status: 405, message: "Methode not allowed" });
  });

export default passwortPolicy;
