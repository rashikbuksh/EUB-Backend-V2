import { createRouter } from '@/lib/create_app';
import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createMessageObjectSchema } from 'stoker/openapi/schemas';

import commercial from './commercial';
import hr from './hr';

const router = createRouter()
  .openapi(
    createRoute({
      tags: ['Index'],
      method: 'get',
      path: '/',
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema('FZL API'),
          'FZL API Index',
        ),
      },
    }),
    (c) => {
      return c.json({
        message: 'FZL API',
      }, HttpStatusCodes.OK);
    },
  );

const routes = [
  router,
  ...hr,
  ...commercial,
] as const;

export default routes;
