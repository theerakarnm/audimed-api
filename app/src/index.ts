import { Hono } from 'hono'
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import routes from './routes';
import { env, API_CONFIG } from './config';
import { ApiError } from './utils';

const app = new Hono()

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());

// Mount routes
app.route('/', routes);

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