import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.contact_us'];

export const list = createRoute({
  path: '/portfolio/contact-us',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of contact-us',
    ),
  },
});

export const create = createRoute({
  path: '/portfolio/contact-us',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The contact-us to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created contact-us',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/contact-us/{id}',
  method: 'get',
  request: {
    params: param.id,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested contact-us',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'contact-us not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.id),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/contact-us/{id}',
  method: 'patch',
  request: {
    params: param.id,
    body: jsonContentRequired(
      patchSchema,
      'The contact-us updates',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated contact-us',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'contact-us not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.id)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/contact-us/{id}',
  method: 'delete',
  request: {
    params: param.id,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'contact-us deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'contact-us not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.id),
      'Invalid id error',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
