const saltRounds = 12;

import bcrypt from "bcryptjs";

/**
 *
 * @returns {typeof bcrypt}
 */
function hashing() {
  if (typeof bcrypt.compare === "function") {
    return bcrypt;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (bcrypt as any).dcodeIO.bcrypt as typeof bcrypt;
}

export default hashing;


export const hashPassword = async (password: string) => {
  return await hashing().hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
  return await hashing().compare(password, hash);
};
