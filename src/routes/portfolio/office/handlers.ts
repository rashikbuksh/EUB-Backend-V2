import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, updateFile, uploadFile } from '@/utils/upload_file';

import type {
  CreateRoute,
  GetOfficeAndOfficeEntryDetailsByOfficeUuidRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from './routes';

import { office } from '../schema';

// const user_information = alias(hrSchema.users, 'user_information');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');
  const formData = await c.req.parseBody();
  const image = formData.image;

  const filePath = await uploadFile(image, 'public/office');

  const value = {
    uuid: formData.uuid,
    title: formData.title,
    category: formData.category,
    image: filePath,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(office).values(value).returning({
    name: office.created_by,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it

  if (formData.image) {
    // get office image name

    const officeData = await db.query.office.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (officeData && officeData.image) {
      const imagePath = await updateFile(formData.image, officeData.image, 'public/office');
      formData.image = imagePath;
    }
    else {
      const imagePath = await uploadFile(formData.image, 'public/office');
      formData.image = imagePath;
    }
  }
  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db
    .update(office)
    .set(formData)
    .where(eq(office.uuid, uuid))
    .returning({
      name: office.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const officeData = await db.query.office.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (officeData && officeData.image) {
    deleteFile(officeData.image);
  }

  const [data] = await db
    .delete(office)
    .where(eq(office.uuid, uuid))
    .returning({
      name: office.created_by,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const data = await db.query.office.findMany();

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.office.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};

export const getOfficeAndOfficeEntryDetailsByOfficeUuid: AppRouteHandler<GetOfficeAndOfficeEntryDetailsByOfficeUuidRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const data = await db.query.office.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
    with: {
      office_entries: true,
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
