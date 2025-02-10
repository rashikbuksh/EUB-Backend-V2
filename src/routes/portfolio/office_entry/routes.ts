import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.office_entry'];

export const list = createRoute({
  path: '/portfolio/office-entry',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(z.array(selectSchema), 'The list of office-entry'),
  },
  request: {
    query: z.object({
      category: z.string().optional(),
    }),
  },
});

export const create = createRoute({
  path: '/portfolio/office-entry',
  method: 'post',
  request: {
    body: jsonContentRequired(insertSchema, 'The office-entry to create'),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The created office-entry'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/office-entry/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The requested office-entry'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'office-entry not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/office-entry/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(patchSchema, 'The office-entry updates'),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(selectSchema, 'The updated office-entry'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'office-entry not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema).or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/office-entry/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'office-entry deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'office-entry not found'),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const getByOfficeUuid = createRoute({
  path: '/portfolio/office-entry/by/office-uuid/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(z.array(selectSchema), 'The list of office-entry'),
    [HSCode.NOT_FOUND]: jsonContent(notFoundSchema, 'office-entry not found'),
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
export type GetByOfficeUuidRoute = typeof getByOfficeUuid;
