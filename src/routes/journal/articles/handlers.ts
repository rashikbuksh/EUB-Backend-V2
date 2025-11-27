import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { handleImagePatch } from '@/lib/variables';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { articles, volume } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();

  const file = formData.file;

  let filePath = null;

  if (file) {
    filePath = await insertFile(file, 'public/articles');
  }

  const value = {
    uuid: formData.uuid,
    volume_uuid: formData.volume_uuid,
    title: formData.title,
    abstract: formData.abstract,
    reference: formData.reference,
    conclusion: formData.conclusion,
    file: filePath,
    published_date: formData.published_date,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
    index: formData.index,
  };

  const [data] = await db.insert(articles).values(value).returning({
    name: articles.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  const articlesPromise = db
    .select({
      file: articles.file,
    })
    .from(articles)
    .where(eq(articles.uuid, uuid));

  const [articlesData] = await articlesPromise;

  formData.file = await handleImagePatch(formData.file, articlesData?.file ?? undefined, 'public/articles');

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(articles)
    .set(formData)
    .where(eq(articles.uuid, uuid))
    .returning({
      name: articles.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const articlesPromise = db
    .select({
      file: articles.file,
    })
    .from(articles)
    .where(eq(articles.uuid, uuid));

  const [articlesData] = await articlesPromise;

  if (articlesData && articlesData.file) {
    deleteFile(articlesData.file);
  }

  const [data] = await db.delete(articles)
    .where(eq(articles.uuid, uuid))
    .returning({
      name: articles.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const articlesPromise = db
    .select({
      uuid: articles.uuid,
      volume_uuid: articles.volume_uuid,
      volume_name: volume.name,
      title: articles.title,
      abstract: articles.abstract,
      reference: articles.reference,
      conclusion: articles.conclusion,
      file: articles.file,
      published_date: articles.published_date,
      created_by: articles.created_by,
      created_by_name: users.name,
      created_at: articles.created_at,
      updated_by: articles.updated_by,
      updated_by_name: updatedByUser.name,
      updated_at: articles.updated_at,
      remarks: articles.remarks,
      index: articles.index,
      authors: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', aa.uuid,
                  'articles_uuid', aa.articles_uuid,
                  'authors_uuid', aa.authors_uuid,
                  'authors_name', a.name,
                  'created_by', aa.created_by,
                  'created_at', aa.created_at,  
                  'updated_by', aa.updated_by,
                  'updated_at', aa.updated_at,
                  'remarks', aa.remarks
                )), '[]'::json)
                FROM journal.article_authors aa
                LEFT JOIN journal.authors a ON aa.authors_uuid = a.uuid
                WHERE aa.articles_uuid = ${articles.uuid}
          )`,
      keywords: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', ak.uuid,
                  'articles_uuid', ak.articles_uuid,
                  'keywords_uuid', ak.keywords_uuid,
                  'keywords_name', k.name,
                  'created_by', ak.created_by,
                  'created_at', ak.created_at,  
                  'updated_by', ak.updated_by,
                  'updated_at', ak.updated_at,
                  'remarks', ak.remarks
                )), '[]'::json)
                FROM journal.article_keywords ak  
                LEFT JOIN journal.keywords k ON ak.keywords_uuid = k.uuid
                WHERE ak.articles_uuid = ${articles.uuid}
          )`,
      images: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', ai.uuid,
                  'index', ai.index,
                  'articles_uuid', ai.articles_uuid,
                  'image', ai.image,
                  'created_by', ai.created_by,
                  'created_at', ai.created_at,
                  'updated_by', ai.updated_by,
                  'updated_at', ai.updated_at,
                  'remarks', ai.remarks
                )), '[]'::json) 
                FROM journal.article_images ai
                WHERE ai.articles_uuid = ${articles.uuid}
          )`,
    })
    .from(articles)
    .leftJoin(volume, eq(articles.volume_uuid, volume.uuid))
    .leftJoin(users, eq(articles.created_by, users.uuid))
    .leftJoin(updatedByUser, eq(articles.updated_by, updatedByUser.uuid))
    .orderBy(desc(articles.created_at));

  const data = await articlesPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: articles.uuid,
    volume_uuid: articles.volume_uuid,
    volume_name: volume.name,
    title: articles.title,
    abstract: articles.abstract,
    reference: articles.reference,
    conclusion: articles.conclusion,
    file: articles.file,
    published_date: articles.published_date,
    created_by: articles.created_by,
    created_by_name: users.name,
    created_at: articles.created_at,
    updated_by: articles.updated_by,
    updated_by_name: updatedByUser.name,
    updated_at: articles.updated_at,
    remarks: articles.remarks,
    index: articles.index,
    authors: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', aa.uuid,
                  'articles_uuid', aa.articles_uuid,
                  'authors_uuid', aa.authors_uuid,
                  'authors_name', a.name,
                  'created_by', aa.created_by,
                  'created_at', aa.created_at,  
                  'updated_by', aa.updated_by,
                  'updated_at', aa.updated_at,
                  'remarks', aa.remarks
                )), '[]'::json)
                FROM journal.article_authors aa
                LEFT JOIN journal.authors a ON aa.authors_uuid = a.uuid
                WHERE aa.articles_uuid = ${articles.uuid}
          )`,
    keywords: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', ak.uuid,
                  'articles_uuid', ak.articles_uuid,
                  'keywords_uuid', ak.keywords_uuid,
                  'keywords_name', k.name,
                  'created_by', ak.created_by,
                  'created_at', ak.created_at,  
                  'updated_by', ak.updated_by,
                  'updated_at', ak.updated_at,
                  'remarks', ak.remarks
                )), '[]'::json)
                FROM journal.article_keywords ak  
                LEFT JOIN journal.keywords k ON ak.keywords_uuid = k.uuid
                WHERE ak.articles_uuid = ${articles.uuid}
          )`,
    images: sql`(SELECT COALESCE(json_agg(json_build_object(
                  'uuid', ai.uuid,
                  'index', ai.index,
                  'articles_uuid', ai.articles_uuid,
                  'image', ai.image,
                  'created_by', ai.created_by,
                  'created_at', ai.created_at,
                  'updated_by', ai.updated_by,
                  'updated_at', ai.updated_at,
                  'remarks', ai.remarks
                )), '[]'::json) 
                FROM journal.article_images ai
                WHERE ai.articles_uuid = ${articles.uuid}
          )`,
  })
    .from(articles)
    .leftJoin(volume, eq(articles.volume_uuid, volume.uuid))
    .leftJoin(users, eq(articles.created_by, users.uuid))
    .leftJoin(updatedByUser, eq(articles.updated_by, updatedByUser.uuid))
    .where(eq(articles.uuid, uuid));

  const [data] = await resultPromise;

  return c.json(data || {}, HSCode.OK);
};
