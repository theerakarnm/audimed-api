import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, refreshTokenSchema } from './schema';
import { loginService, refreshService } from './service';

const authRoutes = new Hono();

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || c.req.header('x-client-ip') || c.req.header('x-forwarded') || c.req.header('forwarded-for') || c.req.header('forwarded') || c.req.header('via') || c.req.header('x-cluster-client-ip') || c.req.header('fastly-client-ip') || c.req.header('true-client-ip') || c.req.header('x-forwarded-host') || c.req.header('x-forwarded-proto') || c.req.header('x-forwarded-port') || c.req.header('x-forwarded-server') || c.req.header('x-forwarded-for') || c.req.header('x-forwarded-protocol') || c.req.header('x-forwarded-ssl') || c.req.header('x-url-scheme') || 'localhost';
  },
});

authRoutes.use('/login', limiter);
authRoutes.post('/login', zValidator('json', loginSchema), async (c: any) => {
  const body = c.req.valid('json');
  const tokens = await loginService(body);

  if (!tokens) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  return c.json(tokens);
});

authRoutes.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const body = c.req.valid('json');
  const tokens = await refreshService(body.refreshToken);

  if (!tokens) {
    return c.json({ message: 'Invalid refresh token' }, 401);
  }

  return c.json(tokens);
});

export default authRoutes;
