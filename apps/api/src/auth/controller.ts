import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { loginSchema, refreshTokenSchema } from './schema';
import { loginService, refreshService } from './service';

export const loginController = new Hono().post('/', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const tokens = await loginService(body);

  if (!tokens) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  return c.json(tokens);
});

export const refreshController = new Hono().post('/', zValidator('json', refreshTokenSchema), async (c) => {
  const body = c.req.valid('json');
  const tokens = await refreshService(body.refreshToken);

  if (!tokens) {
    return c.json({ message: 'Invalid refresh token' }, 401);
  }

  return c.json(tokens);
});
