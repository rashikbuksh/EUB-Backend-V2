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

import { capital, capital_vendor, vendor } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const quotation_file = formData.quotation_file;

  const quotationFilePath = quotation_file ? await insertFile(quotation_file, 'public/capital-vendor') : null;

  const value = {
    uuid: formData.uuid,
    capital_uuid: formData.capital_uuid,
    vendor_uuid: formData.vendor_uuid,
    amount: formData.amount,
    is_selected: formData.is_selected,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
    quotation_file: quotationFilePath,
    index: formData.index ?? 0, // Default to 0 if not provided
  };

  const [data] = await db.insert(capital_vendor).values(value).returning({
    name: capital_vendor.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  // const updates = c.req.valid('json');

  const formData = await c.req.parseBody();

  // updates includes file then do it else exclude it
  if (formData.quotation_file && typeof formData.quotation_file === 'object') {
    // get form file name
    const formDataPromise = await db.query.capital_vendor.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (formDataPromise && formDataPromise.quotation_file) {
      const quotationFilePath = await updateFile(formData.quotation_file, formDataPromise.quotation_file, 'public/capital-vendor');
      formData.quotation_file = quotationFilePath;
    }
    else {
      const quotationFilePath = await insertFile(formData.quotation_file, 'public/capital-vendor');
      formData.quotation_file = quotationFilePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(capital_vendor)
    .set(formData)
    .where(eq(capital_vendor.uuid, uuid))
    .returning({
      name: capital_vendor.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const formData = await db.query.capital_vendor.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (formData && formData.quotation_file) {
    await deleteFile(formData.quotation_file);
  }

  const [data] = await db.delete(capital_vendor)
    .where(eq(capital_vendor.uuid, uuid))
    .returning({
      name: capital_vendor.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  // const { sub_category } = c.req.valid('query');

  const resultPromise = db.select({
    uuid: capital_vendor.uuid,
    capital_uuid: capital_vendor.capital_uuid,
    capital_name: capital.name,
    vendor_uuid: capital_vendor.vendor_uuid,
    vendor_name: vendor.name,
    amount: PG_DECIMAL_TO_FLOAT(capital_vendor.amount),
    is_selected: capital_vendor.is_selected,
    created_at: capital_vendor.created_at,
    updated_at: capital_vendor.updated_at,
    created_by: capital_vendor.created_by,
    created_by_name: hrSchema.users.name,
    remarks: capital_vendor.remarks,
    quotation_file: capital_vendor.quotation_file,
    index: capital_vendor.index,
  })
    .from(capital_vendor)
    .leftJoin(hrSchema.users, eq(capital_vendor.created_by, hrSchema.users.uuid))
    .leftJoin(capital, eq(capital_vendor.capital_uuid, capital.uuid))
    .leftJoin(vendor, eq(capital_vendor.vendor_uuid, vendor.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.capital_vendor.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
