import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

import { createRouter } from '@/lib/create_app';
import { createRoute } from '@hono/zod-openapi';

import hr from './hr';
import portfolio from './portfolio';

const router = createRouter()
  .openapi(
    createRoute({
      tags: ['Index'],
      method: 'get',
      path: '/',
      responses: {
        [HSCode.OK]: jsonContent(
          createMessageObjectSchema('FZL API'),
          'FZL API Index',
        ),
      },
    }),
    (c) => {
      return c.json({
        message: 'FZL API',
      }, HSCode.OK);
    },
  );

const routes = [
  router,
  ...hr,
  ...portfolio,
] as const;

export default routes;
