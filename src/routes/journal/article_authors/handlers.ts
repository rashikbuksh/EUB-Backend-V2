import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { article_authors, articles, authors } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(article_authors).values(value).returning({
    name: article_authors.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(article_authors)
    .set(updates)
    .where(eq(article_authors.uuid, uuid))
    .returning({
      name: article_authors.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(article_authors)
    .where(eq(article_authors.uuid, uuid))
    .returning({
      name: article_authors.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: article_authors.uuid,
    authors_uuid: article_authors.authors_uuid,
    authors_name: authors.name,
    articles_uuid: article_authors.articles_uuid,
    articles_title: articles.title,
    created_by: article_authors.created_by,
    created_by_name: users.name,
    created_at: article_authors.created_at,
    update_by: article_authors.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: article_authors.updated_at,
    remarks: article_authors.remarks,
  })
    .from(article_authors)
    .leftJoin(articles, eq(article_authors.articles_uuid, articles.uuid))
    .leftJoin(authors, eq(article_authors.authors_uuid, authors.uuid))
    .leftJoin(users, eq(users.uuid, article_authors.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, article_authors.updated_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: article_authors.uuid,
    authors_uuid: article_authors.authors_uuid,
    authors_name: authors.name,
    articles_uuid: article_authors.articles_uuid,
    articles_title: articles.title,
    created_by: article_authors.created_by,
    created_by_name: users.name,
    created_at: article_authors.created_at,
    update_by: article_authors.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: article_authors.updated_at,
    remarks: article_authors.remarks,
  })
    .from(article_authors)
    .leftJoin(articles, eq(article_authors.articles_uuid, articles.uuid))
    .leftJoin(authors, eq(article_authors.authors_uuid, authors.uuid))
    .leftJoin(users, eq(users.uuid, article_authors.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, article_authors.updated_by))
    .where(eq(article_authors.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
