import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
