import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.feature'];

export const list = createRoute({
  path: '/portfolio/feature',
  method: 'get',
  request: {
    query: z.object({
      limit: z.string().optional(),
      page: z.string().optional(),
      q: z.string().optional(),
      sort: z.string().optional(),
      orderby: z.string().optional(),
      is_pagination: z.string().optional(),
      field_name: z.string().optional(),
      field_value: z.string().optional(),
      feature_type: z.string().optional(),
      is_active: z.string().optional(),
    }),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(z.array(selectSchema), 'The list of feature'),
  },
});

export const create = createRoute({
  path: '/portfolio/feature',
  method: 'post',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            ...insertSchema,
          },
        },
      },
    },
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created feature',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/feature/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The requested feature'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'feature not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/feature/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            ...patchSchema,
          },
        },
      },
    },
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The updated feature'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'feature not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema).or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/feature/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'feature deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'feature not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
