import type { AppRouteHandler } from '@/lib/types';

import { and, desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import nanoid from '@/lib/nanoid';
import { constructSelectAllQuery, defaultIfEmpty, handleImagePatch } from '@/lib/variables';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneByRedirectQueryRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { articles, authors, keywords, volume } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();

  const file = formData.file;

  let filePath = null;

  if (file) {
    filePath = await insertFile(file, 'public/articles');
  }

  if (formData.keywords_uuid) {
    formData.keywords_uuid = formData.keywords_uuid.split(',');
  }

  if (formData.authors_uuid) {
    formData.authors_uuid = formData.authors_uuid.split(',');
  }

  const value = {
    uuid: defaultIfEmpty(formData.uuid, nanoid()),
    volume_uuid: defaultIfEmpty(formData.volume_uuid, null),
    title: defaultIfEmpty(formData.title, ''),
    abstract: defaultIfEmpty(formData.abstract, ''),
    reference: defaultIfEmpty(formData.reference, ''),
    conclusion: defaultIfEmpty(formData.conclusion, ''),
    file: defaultIfEmpty(filePath, filePath),
    published_date: defaultIfEmpty(formData.published_date, null),
    created_by: defaultIfEmpty(formData.created_by, null),
    created_at: defaultIfEmpty(formData.created_at, null),
    updated_at: defaultIfEmpty(formData.updated_at, null),
    remarks: defaultIfEmpty(formData.remarks, ''),
    index: defaultIfEmpty(formData.index, null),
    keywords_uuid: formData.keywords_uuid,
    authors_uuid: formData.authors_uuid,
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

  if (formData.keywords_uuid) {
    formData.keywords_uuid = formData.keywords_uuid.split(',');
  }

  if (formData.authors_uuid) {
    formData.authors_uuid = formData.authors_uuid.split(',');
  }

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
  const { author_id, keyword_id, volume_id, redirect_query, is_pagination, field_name, field_value, volume_uuid } = c.req.valid('query');

  const articlesPromise = db
    .select({
      uuid: articles.uuid,
      volume_uuid: articles.volume_uuid,
      volume_name: volume.name,
      volume_number: volume.volume_number,
      no: volume.no,
      volume_published_date: volume.published_date,
      volume_id: sql`LOWER(${volume.name}) || '-' || COALESCE(${volume.volume_number}::text, '') || '-number-' || COALESCE(${volume.no}::text, '') || '-' || LOWER(to_char(${volume.published_date}, 'FMMonth')) || '-' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '')`.as('volume_id'),
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
      authors_uuid: articles.authors_uuid,
      keywords_uuid: articles.keywords_uuid,
      redirect_query: sql`'v' || COALESCE(${volume.volume_number}::text, '') || '_n' || COALESCE(${volume.no}::text, '') || '_' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '') || '_' || COALESCE(${articles.index}::text, '')`,
      authors: sql`ARRAY(
        SELECT 
          jsonb_build_object(
            'uuid', a.uuid, 
            'name', a.name, 
            'created_by', a.created_by, 
            'created_at', a.created_at, 
            'updated_by', a.updated_by, 
            'updated_at', a.updated_at, 
            'remarks', a.remarks,
            'author_id', REPLACE(LOWER(a.name::text), ' ', '-')
          ) 
          FROM unnest(${articles.authors_uuid}) AS au 
          JOIN ${authors} AS a ON au = a.uuid
          ${author_id ? sql`WHERE REPLACE(LOWER(a.name::text), ' ', '-') = ${author_id}` : sql``}
      )`,
      keywords: sql`ARRAY(
        SELECT 
          jsonb_build_object(
            'uuid', k.uuid, 
            'keyword', k.name,
            'created_by', k.created_by,
            'created_at', k.created_at,
            'updated_by', k.updated_by,
            'updated_at', k.updated_at,
            'remarks', k.remarks,
            'keyword_id', REPLACE(LOWER(k.name::text), ' ', '-')
          )
          FROM unnest(${articles.keywords_uuid}) AS ku 
          JOIN ${keywords} AS k ON ku = k.uuid
          ${keyword_id ? sql`WHERE REPLACE(LOWER(k.name::text), ' ', '-') = ${keyword_id}` : sql``}
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

  const filters = [];

  if (redirect_query) {
    filters.push(eq(sql`'v' || COALESCE(${volume.volume_number}::text, '') || '_n' || COALESCE(${volume.no}::text, '') || '_' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '') || '_' || COALESCE(${articles.index}::text, '')`, redirect_query));
  }

  if (volume_uuid) {
    filters.push(eq(articles.volume_uuid, volume_uuid));
  }

  if (filters.length > 0) {
    articlesPromise.where(and(...filters));
  }

  if (volume_id) {
    articlesPromise.where(
      eq(
        sql`LOWER(${volume.name}) || '-' || COALESCE(${volume.volume_number}::text, '') || '-number-' || COALESCE(${volume.no}::text, '') || '-' || LOWER(to_char(${volume.published_date}, 'FMMonth')) || '-' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '')`,
        volume_id,
      ),
    );
  }

  const page = Number(c.req.query.page) || 1;
  const limit = Number(c.req.query.limit) || 10;

  const baseQuery
    = is_pagination === 'true'
      ? constructSelectAllQuery(
          articlesPromise,
          c.req.valid('query'),
          'created_at',
          [users.name.name, volume.name.name, volume.volume_number.name, volume.no.name],
          field_name,
          field_value,
        )
      : articlesPromise;

  const data = await baseQuery;

  const pagination
    = is_pagination === 'true'
      ? {
          total_record: data.length,
          current_page: Number(page),
          total_page: Math.ceil(
            data.length / limit,
          ),
          next_page:
                  page + 1
                  > Math.ceil(data.length / limit)
                    ? null
                    : page + 1,
          prev_page: page - 1 <= 0 ? null : page - 1,
        }
      : null;

  const response
    = is_pagination === 'true'
      ? {
          data,
          pagination,
        }
      : data;

  return c.json(response, HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: articles.uuid,
    volume_uuid: articles.volume_uuid,
    volume_name: volume.name,
    volume_number: volume.volume_number,
    no: volume.no,
    volume_published_date: volume.published_date,
    volume_id: sql`LOWER(${volume.name}) || '-' || COALESCE(${volume.volume_number}::text, '') || '-number-' || COALESCE(${volume.no}::text, '') || '-' || LOWER(to_char(${volume.published_date}, 'FMMonth')) || '-' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '')`.as('volume_id'),
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
    authors_uuid: articles.authors_uuid,
    keywords_uuid: articles.keywords_uuid,
    redirect_query: sql`'v' || COALESCE(${volume.volume_number}::text, '') || '_n' || COALESCE(${volume.no}::text, '') || '_' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '') || '_' || COALESCE(${articles.index}::text, '')`,
    authors: sql`ARRAY(
      SELECT 
        jsonb_build_object(
          'uuid', a.uuid, 
          'name', a.name, 
          'created_by', a.created_by, 
          'created_at', a.created_at, 
          'updated_by', a.updated_by, 
          'updated_at', a.updated_at, 
          'remarks', a.remarks
        ) 
        FROM unnest(${articles.authors_uuid}) AS au 
        JOIN ${authors} AS a ON au = a.uuid
    )`,
    keywords: sql`ARRAY(
        SELECT 
          jsonb_build_object(
            'uuid', k.uuid, 
            'keyword', k.name,
            'created_by', k.created_by,
            'created_at', k.created_at,
            'updated_by', k.updated_by,
            'updated_at', k.updated_at,
            'remarks', k.remarks
          )
          FROM unnest(${articles.keywords_uuid}) AS ku 
          JOIN ${keywords} AS k ON ku = k.uuid
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

export const getOneByRedirectQuery: AppRouteHandler<GetOneByRedirectQueryRoute> = async (c: any) => {
  const { redirect_query } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: articles.uuid,
    volume_uuid: articles.volume_uuid,
    volume_name: volume.name,
    volume_number: volume.volume_number,
    no: volume.no,
    volume_published_date: volume.published_date,
    volume_id: sql`LOWER(${volume.name}) || '-' || COALESCE(${volume.volume_number}::text, '') || '-number-' || COALESCE(${volume.no}::text, '') || '-' || LOWER(to_char(${volume.published_date}, 'FMMonth')) || '-' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '')`.as('volume_id'),
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
    authors_uuid: articles.authors_uuid,
    keywords_uuid: articles.keywords_uuid,
    redirect_query: sql`'v' || COALESCE(${volume.volume_number}::text, '') || '_n' || COALESCE(${volume.no}::text, '') || '_' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '') || '_' || COALESCE(${articles.index}::text, '')`,
    authors: sql`ARRAY(
      SELECT 
        jsonb_build_object(
          'uuid', a.uuid, 
          'name', a.name, 
          'created_by', a.created_by, 
          'created_at', a.created_at, 
          'updated_by', a.updated_by, 
          'updated_at', a.updated_at, 
          'remarks', a.remarks
        ) 
        FROM unnest(${articles.authors_uuid}) AS au 
        JOIN ${authors} AS a ON au = a.uuid
    )`,
    keywords: sql`ARRAY(
        SELECT 
          jsonb_build_object(
            'uuid', k.uuid, 
            'keyword', k.name,
            'created_by', k.created_by,
            'created_at', k.created_at,
            'updated_by', k.updated_by,
            'updated_at', k.updated_at,
            'remarks', k.remarks
          )
          FROM unnest(${articles.keywords_uuid}) AS ku 
          JOIN ${keywords} AS k ON ku = k.uuid
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
    .where(
      eq(
        sql`'v' || COALESCE(${volume.volume_number}::text, '') || '_n' || COALESCE(${volume.no}::text, '') || '_' || COALESCE(to_char(${volume.published_date}, 'YYYY'), '') || '_' || COALESCE(${articles.index}::text, '')`,
        redirect_query,
      ),
    );

  const [data] = await resultPromise;

  return c.json(data || {}, HSCode.OK);
};
