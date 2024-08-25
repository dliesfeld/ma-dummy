/**
 * @author Dominik Liesfeld
 * @version 1.0
 *
 * This file contains the have I been pwned model. The model as a password and called attribut.
 * Called is the number of a specific password found is leaks.
 * The database stored the 1001 most passwords by https://haveibeenpwned.com/.
 */

import mongoose from "mongoose";

const HaveIBeenPwnedSchema = mongoose.Schema;

const haveIBeenPwned = new HaveIBeenPwnedSchema({
  password: {
    type: String,
    required: true,
    unique: true,
  },
  called: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("HaveIBeenPwned", haveIBeenPwned);
