import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from './routes';

import { offer } from '../schema';

// const user_information = alias(hrSchema.users, 'user_information');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');
  const formData = await c.req.parseBody();
  const file = formData.file;

  const filePath = await insertFile(file, 'public/offer');

  const value = {
    uuid: formData.uuid,
    serial: formData.serial,
    title: formData.title,
    subtitle: formData.subtitle,
    file: filePath,
    deadline: formData.deadline,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(offer).values(value).returning({
    name: offer.created_by,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes file then do it else exclude it

  if (formData.file) {
    // get offer file name

    const offerData = await db.query.offer.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (offerData && offerData.file) {
      const filePath = await updateFile(formData.file, offerData.file, 'public/offer');
      formData.file = filePath;
    }
    else {
      const filePath = await insertFile(formData.file, 'public/offer');
      formData.file = filePath;
    }
  }
  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db
    .update(offer)
    .set(formData)
    .where(eq(offer.uuid, uuid))
    .returning({
      name: offer.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const offerData = await db.query.offer.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (offerData && offerData.file) {
    deleteFile(offerData.file);
  }

  const [data] = await db
    .delete(offer)
    .where(eq(offer.uuid, uuid))
    .returning({
      name: offer.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const data = await db.query.offer.findMany();

  const resultPromise = db.select({
    id: offer.id,
    uuid: offer.uuid,
    serial: offer.serial,
    title: offer.title,
    subtitle: offer.subtitle,
    file: offer.file,
    deadline: offer.deadline,
    created_at: offer.created_at,
    updated_at: offer.updated_at,
    created_by: offer.created_by,
    created_by_name: hrSchema.users.name,
    remarks: offer.remarks,
  })
    .from(offer)
    .leftJoin(hrSchema.users, eq(offer.created_by, hrSchema.users.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // const data = await db.query.offer.findFirst({
  //   where(fields, operators) {
  //     return operators.eq(fields.uuid, uuid);
  //   },
  // });

  const resultPromise = db.select({
    id: offer.id,
    uuid: offer.uuid,
    serial: offer.serial,
    title: offer.title,
    subtitle: offer.subtitle,
    file: offer.file,
    deadline: offer.deadline,
    created_at: offer.created_at,
    updated_at: offer.updated_at,
    created_by: offer.created_by,
    created_by_name: hrSchema.users.name,
    remarks: offer.remarks,
  })
    .from(offer)
    .leftJoin(hrSchema.users, eq(offer.created_by, hrSchema.users.uuid))
    .where(eq(offer.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
