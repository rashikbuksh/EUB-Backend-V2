import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { handleImagePatch } from '@/lib/variables';
import { users } from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { article_images, articles } from '../schema';

const updatedByUser = alias(users, 'updated_by_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();

  const image = formData.image;

  let imagePath = null;

  if (image) {
    imagePath = await insertFile(image, 'public/article-images');
  }

  const value = {
    ...formData,
    image: imagePath,
  };
  const [data] = await db.insert(article_images).values(value).returning({
    name: article_images.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  const articleImagesPromise = db
    .select({
      image: article_images.image,
    })
    .from(article_images)
    .where(eq(article_images.uuid, uuid));

  const [articleImagesData] = await articleImagesPromise;

  formData.image = await handleImagePatch(formData.image, articleImagesData?.image ?? undefined, 'public/article-images');

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(article_images)
    .set(formData)
    .where(eq(article_images.uuid, uuid))
    .returning({
      name: article_images.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const articleImagesPromise = db
    .select({
      image: article_images.image,
    })
    .from(article_images)
    .where(eq(article_images.uuid, uuid));

  const [articleImagesData] = await articleImagesPromise;

  if (articleImagesData && articleImagesData.image) {
    deleteFile(articleImagesData.image);
  }

  const [data] = await db.delete(article_images)
    .where(eq(article_images.uuid, uuid))
    .returning({
      name: article_images.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const articleImagesPromise = db
    .select({
      uuid: articles.uuid,
      articles_uuid: article_images.articles_uuid,
      articles_title: articles.title,
      index: article_images.index,
      image: article_images.image,
      created_by: article_images.created_by,
      created_by_name: users.name,
      created_at: article_images.created_at,
      update_by: article_images.updated_by,
      updated_by_name: updatedByUser.name,
      updated_at: article_images.updated_at,
      remarks: article_images.remarks,
    })
    .from(article_images)
    .leftJoin(articles, eq(article_images.articles_uuid, articles.uuid))
    .leftJoin(users, eq(article_images.created_by, users.uuid))
    .leftJoin(updatedByUser, eq(article_images.updated_by, updatedByUser.uuid));

  const data = await articleImagesPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const articleImagesPromise = db
    .select({
      uuid: article_images.uuid,
      articles_uuid: article_images.articles_uuid,
      articles_title: articles.title,
      index: article_images.index,
      image: article_images.image,
      created_by: article_images.created_by,
      created_by_name: users.name,
      created_at: article_images.created_at,
      update_by: article_images.updated_by,
      updated_by_name: updatedByUser.name,
      updated_at: article_images.updated_at,
      remarks: article_images.remarks,
    })
    .from(article_images)
    .leftJoin(articles, eq(article_images.articles_uuid, articles.uuid))
    .leftJoin(users, eq(article_images.created_by, users.uuid))
    .leftJoin(updatedByUser, eq(article_images.updated_by, updatedByUser.uuid))
    .where(eq(article_images.uuid, uuid));
  const [data] = await articleImagesPromise;

  return c.json(data || {}, HSCode.OK);
};
