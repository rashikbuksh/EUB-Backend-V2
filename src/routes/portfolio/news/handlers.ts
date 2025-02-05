import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, news } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(news).values(value).returning({
    name: news.created_by,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(news)
    .set(updates)
    .where(eq(news.uuid, uuid))
    .returning({
      name: news.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(news)
    .where(eq(news.uuid, uuid))
    .returning({
      name: news.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.news.findMany();
  const { department_name } = c.req.valid('query');
  const resultPromise = db.select({
    id: news.id,
    uuid: news.uuid,
    department_uuid: news.department_uuid,
    department_name: department.name,
    title: news.title,
    subtitle: news.subtitle,
    description: news.description,
    content: news.content,
    created_at: news.created_at,
    cover_image: news.cover_image,
    published_date: news.published_date,
  })
    .from(news)
    .leftJoin(department, eq(news.department_uuid, department.uuid));

  if (department_name)
    resultPromise.where(eq(department.name, department_name));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.news.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
