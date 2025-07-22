import { db } from '../utils/db';
import { users } from '../utils/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from './utils/bcrypt';
import { signAccessToken, signRefreshToken } from './utils/jwt';

export const loginService = async (body: any) => {
  const user = await db.select().from(users).where(eq(users.username, body.username)).get();

  if (!user) {
    return null;
  }

  const isPasswordValid = await comparePassword(body.password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  const accessToken = await signAccessToken({ id: user.id });
  const refreshToken = await signRefreshToken({ id: user.id });

  return { accessToken, refreshToken };
};
