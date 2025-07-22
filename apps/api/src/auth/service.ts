import { db } from '../utils/db';
import { users } from '../utils/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from './utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyToken } from './utils/jwt';

export const loginService = async (body: any) => {
  const [user] = await db.select().from(users).where(eq(users.username, body.username)).limit(1);

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

export const refreshService = async (refreshToken: string) => {
  const decoded = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

  if (!decoded) {
    return null;
  }

  const accessToken = await signAccessToken({ id: decoded.id });

  return { accessToken };
};
