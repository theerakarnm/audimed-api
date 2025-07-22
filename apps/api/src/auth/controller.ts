import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { loginSchema } from './schema';
import { loginService } from './service';

export const loginController = new Hono().post('/', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const tokens = await loginService(body);

  if (!tokens) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  return c.json(tokens);
});
