import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['journal.articles'];

export const list = createRoute({
  path: '/journal/articles',
  method: 'get',
  tags,
  request: {
    query: z.object({
      volume_uuid: z.string().optional(),
      redirect_query: z.string().optional(),
      is_pagination: z.string().optional(),
      field_name: z.string().optional(),
      field_value: z.string().optional(),
      q: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      orderby: z.string().optional(),
      volume_id: z.string().optional(),
      article_value: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(
        selectSchema.extend({
          authors: z.array(z.string()).optional(),
          keywords: z.array(z.string()).optional(),
          images: z.array(z.string()).optional(),
        }),
      ),
      'The list of product variants',
    ),
  },
});

export const create = createRoute({
  path: '/journal/articles',
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
      'The created product variant',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/journal/articles/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema.extend({
        authors: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
      }),
      'The requested product variant',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'product variant not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/journal/articles/{uuid}',
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
      'The updated product variant',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'product variant not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/journal/articles/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'The product variant was deleted successfully',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'product variant not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getOneByRedirectQuery = createRoute({
  path: '/journal/articles/redirect/{redirect_query}',
  method: 'get',
  request: {
    params: z.object({
      redirect_query: z.string(),
    }),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema.extend({
        authors: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
      }),
      'The requested product variant',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'product variant not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(z.object({
        redirect_query: z.string(),
      })),
      'Invalid redirect query error',
    ),
  },
});

export const getByAuthorId = createRoute({
  path: '/journal/articles/author/{author_id}',
  method: 'get',
  request: {
    params: z.object({
      author_id: z.string(),
    }),
    query: z.object({
      is_pagination: z.string().optional(),
      field_name: z.string().optional(),
      field_value: z.string().optional(),
      q: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      orderby: z.string().optional(),
    }),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema.extend({
        authors: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
      }),
      'The requested product variant',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'product variant not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(z.object({
        author_id: z.string(),
      })),
      'Invalid author id error',
    ),
  },
});

export const getByKeywordId = createRoute({
  path: '/journal/articles/keyword/{keyword_id}',
  method: 'get',
  request: {
    params: z.object({
      keyword_id: z.string(),
    }),
    query: z.object({
      is_pagination: z.string().optional(),
      field_name: z.string().optional(),
      field_value: z.string().optional(),
      q: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      orderby: z.string().optional(),
    }),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema.extend({
        authors: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
      }),
      'The requested product variant',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'product variant not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(z.object({
        keyword_id: z.string(),
      })),
      'Invalid keyword id error',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type GetOneByRedirectQueryRoute = typeof getOneByRedirectQuery;
export type GetByAuthorIdRoute = typeof getByAuthorId;
export type GetByKeywordIdRoute = typeof getByKeywordId;
