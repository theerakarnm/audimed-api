import { Hono } from 'hono'
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import routes from './routes';
import authRoutes from './auth/routes';
import { env, API_CONFIG } from './config';
import { ApiError } from './utils';
import { cors } from 'hono/cors';

const app = new Hono()

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use(
  "*",
  cors({
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    origin: process.env.CORE_ALLOW_LIST!.split(","),
    allowMethods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Mount routes
app.route('/', routes);
app.route('/api/auth', authRoutes);

// Global error handler
app.onError((error, c) => {
  console.error('Global error handler:', error);

  if (error instanceof ApiError) {
    return c.json(
      {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      },
      500
    );
  }

  return c.json(
    {
      success: false,
      error: 'Internal server error',
      statusCode: 500,
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      statusCode: 404,
    },
    404
  );
});


export default {
  port: 8000,
  fetch: app.fetch,
} 