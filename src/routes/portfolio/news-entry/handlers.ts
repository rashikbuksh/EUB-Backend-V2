import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { news_entry } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const documents = formData.documents;

  const documentsPath = await insertFile(documents, 'public/news-entry');

  const value = {
    uuid: formData.uuid,
    news_uuid: formData.news_uuid,
    documents: documentsPath,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(news_entry).values(value).returning({
    name: news_entry.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes documents then do it else exclude it
  if (formData.documents) {
    // get newsEntry documents name
    const newsEntryData = await db.query.news_entry.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (newsEntryData && newsEntryData.documents) {
      const documentsPath = await updateFile(formData.documents, newsEntryData.documents, 'public/news-entry');
      formData.documents = documentsPath;
    }
    else {
      const documentsPath = await insertFile(formData.documents, 'public/news-entry');
      formData.documents = documentsPath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(news_entry)
    .set(formData)
    .where(eq(news_entry.uuid, uuid))
    .returning({
      name: news_entry.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get newsEntry file name

  const newsEntryData = await db.query.news_entry.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (newsEntryData && newsEntryData.documents) {
    deleteFile(newsEntryData.documents);
  }

  const [data] = await db.delete(news_entry)
    .where(eq(news_entry.uuid, uuid))
    .returning({
      name: news_entry.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const data = await db.query.news_entry.findMany();

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.news_entry.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
