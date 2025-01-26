import { bearerAuth } from 'hono/bearer-auth';
import { cors } from 'hono/cors';

import configureOpenAPI from '@/lib/configure_open_api';
import createApp from '@/lib/create_app';
import { VerifyToken } from '@/middlewares/auth';
import routes from '@/routes/index.route';

const app = createApp();

configureOpenAPI(app);

// ! don't put a trailing slash
export const basePath = '/v1';

app.use(`${basePath}/*`, cors({
  origin: ['http://localhost:3005', 'http://localhost:3000'],
  maxAge: 600,
  credentials: true,
}));

app.use(`${basePath}/*`, bearerAuth({
  verifyToken: VerifyToken,
}));

routes.forEach((route) => {
  app.route(basePath, route);
});

export type AppType = typeof routes[number];

export default app;
