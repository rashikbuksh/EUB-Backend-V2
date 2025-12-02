import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { volume } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(volume).values(value).returning({
    name: volume.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(volume)
    .set(updates)
    .where(eq(volume.uuid, uuid))
    .returning({
      name: volume.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(volume)
    .where(eq(volume.uuid, uuid))
    .returning({
      name: volume.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.volume.findMany();
  const resultPromise = db.select({
    uuid: volume.uuid,
    index: volume.index,
    name: volume.name,
    published_date: volume.published_date,
    volume_number: volume.volume_number,
    no: volume.no,
    created_by: volume.created_by,
    created_by_name: users.name,
    created_at: volume.created_at,
    update_by: volume.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: volume.updated_at,
    remarks: volume.remarks,
    articles: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', a.uuid,
                  'volume_uuid', a.volume_uuid,
                  'title', a.title,
                  'abstract', a.abstract,
                  'reference', a.reference,
                  'conclusion', a.conclusion,
                  'file', a.file,
                  'published_date', a.published_date,
                  'created_by', a.created_by,
                  'created_at', a.created_at,
                   'updated_by', a.updated_by,
                   'updated_at', a.updated_at,
                   'remarks', a.remarks
                )), '[]'::json)
                FROM journal.articles a
             WHERE a.volume_uuid = ${volume.uuid}
         )`,
  })
    .from(volume)
    .leftJoin(users, eq(users.uuid, volume.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, volume.updated_by));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.select({
    uuid: volume.uuid,
    index: volume.index,
    name: volume.name,
    published_date: volume.published_date,
    volume_number: volume.volume_number,
    no: volume.no,
    volume_id: sql`LOWER(${volume.name}) || '-' || COALESCE(${volume.volume_number}::text, '') || '-number-' || COALESCE(${volume.no}::text, '') || '-' || LOWER(to_char(${volume.published_date}, 'FMMonth')) || '-' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '')`.as('volume_id'),
    created_by: volume.created_by,
    created_by_name: users.name,
    created_at: volume.created_at,
    update_by: volume.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: volume.updated_at,
    remarks: volume.remarks,
    articles: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', a.uuid,
                  'volume_uuid', a.volume_uuid,
                  'title', a.title,
                  'abstract', a.abstract,
                  'reference', a.reference,
                  'conclusion', a.conclusion,
                  'file', a.file,
                  'published_date', a.published_date,
                  'created_by', a.created_by,
                  'created_at', a.created_at,
                   'updated_by', a.updated_by,
                   'updated_at', a.updated_at,
                   'remarks', a.remarks
                )), '[]'::json)
                FROM journal.articles a
             WHERE a.volume_uuid = ${volume.uuid}
         )`,
  })
    .from(volume)
    .leftJoin(users, eq(users.uuid, volume.created_by))
    .leftJoin(updatedByUser, eq(updatedByUser.uuid, volume.updated_by))
    .where(eq(volume.uuid, uuid));

  if (!data)
    return DataNotFound(c);

  return c.json(data, HSCode.OK);
};
