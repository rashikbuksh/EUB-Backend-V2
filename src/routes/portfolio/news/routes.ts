import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.news'];

export const list = createRoute({
  path: '/portfolio/news',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of news',
    ),
  },
  request: {
    query: z.object({
      department_name: z.string().optional(),
      latest: z.string().optional(),
      limit: z.string().optional(),
      page: z.string().optional(),
      q: z.string().optional(),
      sort: z.string().optional(),
      orderby: z.string().optional(),
      is_pagination: z.string().optional(),
    }),
  },
});

export const create = createRoute({
  path: '/portfolio/news',
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
      'The created news',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/news/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested news',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'news not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/news/{uuid}',
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
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated news',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'news not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/news/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'news deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'news not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getNewsAndNewsEntryDetailsByNewsUuid = createRoute({
  path: '/portfolio/news-and-news-entry-details/by/news-uuid/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The requested news'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'news not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getLatestNews = createRoute({
  path: '/portfolio/news/latest',
  method: 'get',
  tags,
  request: {
    query: z.object({
      department_name: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The latest news',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type GetNewsAndNewsEntryDetailsByNewsUuidRoute = typeof getNewsAndNewsEntryDetailsByNewsUuid;
export type GetLatestNewsRoute = typeof getLatestNews;
