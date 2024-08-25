import { createHash, randomBytes } from "crypto";

/**
 * Create a SHA-256 Hash by a given input
 * @param password Input to be hashed
 * @returns SHA-256 Hash
 */
const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest().toString("hex");

/**
 * Create a random String im hex format
 * @returns random string
 */
const getSecret = () => randomBytes(256).toString("hex");

export { getSecret };

export default hashPassword;
