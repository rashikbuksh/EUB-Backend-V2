import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, inArray, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery, defaultIfEmpty, defaultIfEmptyArray } from '@/lib/variables';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetLatestNewsRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, news } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const cover_image = formData.cover_image;

  const coverImagePath = await insertFile(cover_image, 'public/news');

  const value = {
    uuid: formData.uuid,
    department_uuid: defaultIfEmpty(formData.department_uuid, null),
    title: defaultIfEmpty(formData.title, null),
    subtitle: defaultIfEmpty(formData.subtitle, null),
    description: defaultIfEmpty(formData.description, null),
    content: defaultIfEmpty(formData.content, null),
    created_at: defaultIfEmpty(formData.created_at, null),
    updated_at: defaultIfEmpty(formData.updated_at, null),
    created_by: defaultIfEmpty(formData.created_by, null),
    remarks: defaultIfEmpty(formData.remarks, null),
    cover_image: defaultIfEmpty(coverImagePath, null),
    published_date: defaultIfEmpty(formData.published_date, null),
    is_global: defaultIfEmpty(formData.is_global, null),
  };

  const [data] = await db.insert(news).values(value).returning({
    name: news.title,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  let formData = await c.req.parseBody();

  // cover_image
  // updates includes coverImage then do it else exclude it
  if (formData.cover_image && typeof formData.cover_image === 'object') {
    // get news cover_image name
    const newsData = await db.query.news.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (newsData && newsData.cover_image) {
      const coverImagePath = await updateFile(formData.cover_image, newsData.cover_image, 'public/news');
      formData.cover_image = coverImagePath;
    }
    else {
      const coverImagePath = await insertFile(formData.cover_image, 'public/news');
      formData.cover_image = coverImagePath;
    }
  }

  formData = defaultIfEmptyArray(formData);

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(news)
    .set(formData)
    .where(eq(news.uuid, uuid))
    .returning({
      name: news.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get news cover_image name

  const newsData = await db.query.news.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (newsData && newsData.cover_image) {
    deleteFile(newsData.cover_image);
  }

  const [data] = await db.delete(news)
    .where(eq(news.uuid, uuid))
    .returning({
      name: news.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.news.findMany();
  const { department_name, latest, is_pagination, access, is_global, field_name, field_value } = c.req.valid('query');

  let accessArray = [];
  if (access) {
    accessArray = access.split(',');
  }

  const resultPromise = db.select({
    id: news.id,
    uuid: news.uuid,
    department_uuid: news.department_uuid,
    department_name: department.name,
    department_short_name: department.short_name,
    title: news.title,
    subtitle: news.subtitle,
    description: news.description,
    content: news.content,
    created_at: news.created_at,
    cover_image: news.cover_image,
    published_date: news.published_date,
    remarks: news.remarks,
    carousel: sql`ARRAY(SELECT json_build_object('value', uuid, 'label', documents) FROM portfolio.news_entry WHERE news_uuid = portfolio.news.uuid)`,
    is_global: news.is_global,
  })
    .from(news)
    .leftJoin(department, eq(news.department_uuid, department.uuid));

  const resultPromiseForCount = await resultPromise;

  if (latest === 'true')
    resultPromise.orderBy(sql`DATE(${news.published_date}) DESC`).limit(10);

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);

  const baseQuery = is_pagination === 'false'
    ? resultPromise
    : constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [department.name.name], field_name, field_value);

  if (department_name) {
    baseQuery.groupBy(news.uuid, department.name, department.short_name);
    baseQuery.having(eq(department.short_name, department_name));
  }
  if (accessArray.length > 0) {
    if (accessArray.includes('other')) {
      // include other which is null department_short_name in case of accessArray includes other and bba
      baseQuery.groupBy(news.uuid, department.name, department.short_name);
      baseQuery.having(sql`${department.short_name} IS NULL OR ${inArray(department.short_name, accessArray)}`);
    }
    else {
      baseQuery.groupBy(news.uuid, department.name, department.short_name);
      baseQuery.having(inArray(department.short_name, accessArray));
    }
  }
  if (is_global === 'true') {
    baseQuery.groupBy(news.uuid, news.is_global, department.name, department.short_name);
    baseQuery.having(eq(news.is_global, true));
  }

  baseQuery.orderBy(desc(news.created_at));

  const data = await baseQuery;

  const pagination = is_pagination === 'false'
    ? null
    : {
        total_record: resultPromiseForCount.length,
        current_page: Number(page),
        total_page: Math.ceil(resultPromiseForCount.length / limit),
        next_page: page + 1 > Math.ceil(resultPromiseForCount.length / limit) ? null : page + 1,
        prev_page: page - 1 <= 0 ? null : page - 1,
      };

  const response = is_pagination === 'false'
    ? data
    : {
        data,
        pagination,
      };

  return c.json(response || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.news.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });

  const resultPromise = db.select({
    id: news.id,
    uuid: news.uuid,
    department_uuid: news.department_uuid,
    department_name: department.name,
    department_short_name: department.short_name,
    title: news.title,
    subtitle: news.subtitle,
    description: news.description,
    content: news.content,
    created_at: news.created_at,
    cover_image: news.cover_image,
    published_date: news.published_date,
    remarks: news.remarks,
    carousel: sql`ARRAY(SELECT json_build_object('value', uuid, 'label', documents) FROM portfolio.news_entry WHERE news_uuid = portfolio.news.uuid)`,
    is_global: news.is_global,
  })
    .from(news)
    .leftJoin(department, eq(news.department_uuid, department.uuid))
    .where(eq(news.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export async function getNewsAndNewsEntryDetailsByNewsUuid(c: any) {
  const { uuid } = c.req.valid('param');

  const newsResultPromise = db.select({
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
    remarks: news.remarks,
    entry: sql`ARRAY(SELECT json_build_object('uuid', uuid, 'documents', documents,'created_at', created_at, 'updated_at',updated_at) FROM portfolio.news_entry WHERE news_uuid = portfolio.news.uuid)`,
    is_global: news.is_global,
  })
    .from(news)
    .leftJoin(department, eq(news.department_uuid, department.uuid))
    .where(eq(news.uuid, uuid));

  const data = await newsResultPromise;

  // const newsEntryResultPromise = db.query.news_entry.findMany({
  //   where(fields, operators) {
  //     return operators.eq(fields.news_uuid, uuid);
  //   },
  // });

  // const newsEntryData = await newsEntryResultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
}

export const getLatestNews: AppRouteHandler<GetLatestNewsRoute> = async (c: any) => {
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
    remarks: news.remarks,
    is_global: news.is_global,
  })
    .from(news)
    .leftJoin(department, eq(news.department_uuid, department.uuid))
    .where((department_name ? eq(department.name, department_name) : sql`1=1`))
    .orderBy(desc(news.created_at))
    .limit(10);

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
