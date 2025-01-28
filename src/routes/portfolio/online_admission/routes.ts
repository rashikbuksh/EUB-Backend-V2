import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.online_admission'];

export const list = createRoute({
    path: '/portfolio/online-admission',
    method: 'get',
    tags,
    responses: {
        [HSCode.OK]: jsonContent(
            z.array(selectSchema),
            'The list of online admission',
        ),
    },
});

export const create = createRoute({
    path: '/portfolio/online-admission',
    method: 'post',
    request: {
        body: jsonContentRequired(
            insertSchema,
            'The online admission to create',
        ),
    },
    tags,
    responses: {
        [HSCode.OK]: jsonContent(
            selectSchema,
            'The created online admission',
        ),
        [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertSchema),
            'The validation error(s)',
        ),
    },
});

export const getOne = createRoute({
    path: '/portfolio/online-admission/{uuid}',
    method: 'get',
    request: {
        params: param.uuid,
    },
    tags,
    responses: {
        [HSCode.OK]: jsonContent(
            selectSchema,
            'The requested online admission',
        ),
        [HSCode.NOT_FOUND]: jsonContent(
            notFoundSchema,
            'The online admission was not found',
        ),
        [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
              createErrorSchema(param.uuid),
              'Invalid id error',
            ),
    },
});

export const patch = createRoute({
    path: '/portfolio/online-admission/{uuid}',
    method: 'patch',
    request: {
        params: param.uuid,
        body: jsonContentRequired(
            patchSchema,
            'The online admission to patch',
        ),
    },
    tags,
    responses: {
        [HSCode.OK]: jsonContent(
            selectSchema,
            'The patched online admission',
        ),
        [HSCode.NOT_FOUND]: jsonContent(
            notFoundSchema,
            'The online admission was not found',
        ),
       [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
             createErrorSchema(patchSchema)
               .or(createErrorSchema(param.uuid)),
             'The validation error(s)',
           ),
    },
});

export const remove = createRoute({
    path: '/portfolio/online-admission/{uuid}',
    method: 'delete',
    request: {
        params: param.uuid,
    },
    tags,
    responses: {
        [HSCode.OK]: jsonContent(
            selectSchema,
            'The removed online admission',
        ),
        [HSCode.NOT_FOUND]: jsonContent(
            notFoundSchema,
            'The online admission was not found',
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
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;



