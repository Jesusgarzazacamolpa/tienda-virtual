import type { DatabaseSync } from 'node:sqlite';

import express from 'express';
import { createYoga } from 'graphql-yoga';

import { createGraphQLSchema } from './graphql/schema.js';
import { getAdminToken, isAuthorized } from './services/auth.js';

export interface AppOptions {
  adminToken?: string;
  allowedOrigin?: string;
}

export function createApp(db: DatabaseSync, options: AppOptions = {}) {
  const adminToken = options.adminToken ?? getAdminToken();
  const allowedOrigin =
    options.allowedOrigin ?? process.env['ADMIN_ORIGIN'] ?? 'http://localhost:4501';

  const yoga = createYoga({
    schema: createGraphQLSchema(),
    graphqlEndpoint: '/graphql',
    graphiql: true,
    landingPage: false,
    cors: { origin: allowedOrigin, credentials: false },
    context: ({ request }) => ({
      db,
      authenticated: isAuthorized(request.headers.get('authorization'), adminToken)
    })
  });

  const app = express();
  app.disable('x-powered-by');

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use(yoga.graphqlEndpoint, yoga);

  return app;
}
