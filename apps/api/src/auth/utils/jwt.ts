import { sign, verify } from 'hono/jwt';

export const signAccessToken = async (payload: any) => {
  return await sign(payload, process.env.ACCESS_TOKEN_SECRET!, 'HS256');
};

export const signRefreshToken = async (payload: any) => {
  return await sign({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }, process.env.REFRESH_TOKEN_SECRET!, 'HS256');
};

export const verifyToken = async (token: string, secret: string) => {
  try {
    return await verify(token, secret, 'HS256');
  } catch (error) {
    return null;
  }
};
