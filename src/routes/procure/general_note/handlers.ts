import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { capital, general_note } from '../schema';

;

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const general_note_file = formData.general_note_file;

  const generalNoteFilePath = general_note_file ? await insertFile(general_note_file, 'public/general-note') : null;

  const value = {
    uuid: formData.uuid,
    capital_uuid: formData.capital_uuid,
    description: formData.description,
    amount: formData.amount,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
    general_note_file: generalNoteFilePath,
  };

  const [data] = await db.insert(general_note).values(value).returning({
    name: general_note.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  // const updates = c.req.valid('json');

  const formData = await c.req.parseBody();

  // updates includes file then do it else exclude it
  if (formData.general_note_file && typeof formData.general_note_file === 'object') {
    // get form file name
    const formDataPromise = await db.query.general_note.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (formDataPromise && formDataPromise.general_note_file) {
      const generalNoteFilePath = await updateFile(formData.general_note_file, formDataPromise.general_note_file, 'public/general-note');
      formData.general_note_file = generalNoteFilePath;
    }
    else {
      const generalNoteFilePath = await insertFile(formData.general_note_file, 'public/general-note');
      formData.general_note_file = generalNoteFilePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(general_note)
    .set(formData)
    .where(eq(general_note.uuid, uuid))
    .returning({
      name: general_note.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const formData = await db.query.general_note.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (formData && formData.general_note_file) {
    await deleteFile(formData.general_note_file);
  }

  const [data] = await db.delete(general_note)
    .where(eq(general_note.uuid, uuid))
    .returning({
      name: general_note.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: general_note.uuid,
    capital_uuid: general_note.capital_uuid,
    capital_name: capital.name,
    description: general_note.description,
    amount: PG_DECIMAL_TO_FLOAT(general_note.amount),
    created_at: general_note.created_at,
    updated_at: general_note.updated_at,
    created_by: general_note.created_by,
    created_by_name: hrSchema.users.name,
    remarks: general_note.remarks,
    general_note_file: general_note.general_note_file,
  })
    .from(general_note)
    .leftJoin(hrSchema.users, eq(general_note.created_by, hrSchema.users.uuid))
    .leftJoin(capital, eq(general_note.capital_uuid, capital.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.general_note.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
