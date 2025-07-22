import { db } from "../utils/db";
import { users } from "../utils/db/schema";
import { hashPassword } from "../auth/utils/bcrypt";

(async () => {
  // read credentials from JSON file
  const credentials = require("./credentials.json");

  await db.insert(users).values({
    username: credentials.username,
    password: await hashPassword(credentials.password),
  });
})();