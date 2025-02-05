import { bearerAuth } from 'hono/bearer-auth';
import { cors } from 'hono/cors';

import configureOpenAPI from '@/lib/configure_open_api';
import createApp from '@/lib/create_app';
import { ALLOWED_ROUTES, isPublicRoute, VerifyToken } from '@/middlewares/auth';
import routes from '@/routes/index.route';
import { serveStatic } from '@hono/node-server/serve-static';

import env from './env';

const app = createApp();

configureOpenAPI(app);

// ! don't put a trailing slash
export const basePath = '/v1';
const isDev = env.NODE_ENV === 'development';

// Serve static files from the 'uploads' directory
app.use('/uploads/*', serveStatic({ root: isDev ? './' : '../' }));

app.use(`${basePath}/*`, cors({
  origin: ALLOWED_ROUTES,
  maxAge: 600,
  credentials: true,
}));

if (!isDev) {
  app.use(`${basePath}/*`, async (c, next) => {
    if (isPublicRoute(c.req.path, c.req.method))
      return next();

    return bearerAuth({ verifyToken: VerifyToken })(c, next);
  });
}

routes.forEach((route) => {
  app.route(basePath, route);
});

export default app;
