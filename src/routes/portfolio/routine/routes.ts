import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.routine'];

export const list = createRoute({
  path: '/portfolio/routine',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of routine',
    ),
  },
  request: {
    query: z.object({
      portfolio_department: z.string().optional(),
      program: z.string().optional(),
      type: z.string().optional(),
    }),
  },
});

export const create = createRoute({
  path: '/portfolio/routine',
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
      'The created routine',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/routine/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested routine',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'The routine was not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getOneDepartment = createRoute({
  path: '/portfolio/routine/department/{name}',
  method: 'get',
  request: {
    params: z.object({
      name: z.string().min(1),
    }),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested routine',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'The routine was not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.name),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/routine/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The routine to update',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated routine',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'The routine was not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/routine/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The deleted routine',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'The routine was not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },

});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type GetOneDepartmentRoute = typeof getOneDepartment;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
