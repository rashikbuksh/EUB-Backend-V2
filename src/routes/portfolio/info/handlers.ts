import type { AppRouteHandler } from '@/lib/types';

import { and, eq, inArray, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, faculty, info, routine } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const file = formData.file;

  const filePath = await insertFile(file, 'public/info');

  const value = {
    uuid: formData.uuid,
    description: formData.description,
    page_name: formData.page_name,
    file: filePath,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
    is_offer: formData.is_offer || false,
  };

  const [data] = await db.insert(info).values(value).returning({
    name: info.id,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes file then do it else exclude it
  if (formData.file && typeof formData.file === 'object') {
    // get info file name
    const infoData = await db.query.info.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (infoData && infoData.file) {
      const filePath = await updateFile(formData.file, infoData.file, 'public/info');
      formData.file = filePath;
    }
    else {
      const filePath = await insertFile(formData.file, 'public/info');
      formData.file = filePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(info)
    .set(formData)
    .where(eq(info.uuid, uuid))
    .returning({
      name: info.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get info file name

  const infoData = await db.query.info.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (infoData && infoData.file) {
    deleteFile(infoData.file);
  }

  const [data] = await db.delete(info)
    .where(eq(info.uuid, uuid))
    .returning({
      name: info.id,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { page_name, access, is_pagination, field_name, field_value } = c.req.valid('query');

  let accessArray = [];
  if (access) {
    accessArray = access.split(',');
  }

  const resultPromise = db.select({
    id: info.id,
    uuid: info.uuid,
    department_uuid: sql`null as department_uuid`,
    department_name: sql`null as department_name`,
    faculty_uuid: sql`null as faculty_uuid`,
    faculty_name: sql`null as faculty_name`,
    programs: sql`null as programs`,
    type: sql`null as type`,
    description: info.description,
    page_name: sql`${info.page_name}::text as page_name`, // Explicitly cast to text
    file: info.file,
    created_by: info.created_by,
    created_by_name: hrSchema.users.name,
    created_at: info.created_at,
    updated_at: info.updated_at,
    remarks: info.remarks,
    is_global: sql`true as is_global`,
    page_link: sql`null as page_link`,
  })
    .from(info)
    .leftJoin(hrSchema.users, eq(info.created_by, hrSchema.users.uuid))
    .where(and(
      page_name ? eq(info.page_name, page_name) : sql`true`,
      accessArray.length > 0 ? inArray(info.page_name, accessArray) : sql`true`,
    ));

  let routineResultPromise = null;

  if (page_name === 'notices') {
    routineResultPromise = db.select({
      id: routine.id,
      uuid: routine.uuid,
      department_uuid: routine.department_uuid,
      department_name: department.name,
      faculty_uuid: department.faculty_uuid,
      faculty_name: faculty.name,
      programs: routine.programs,
      type: routine.type,
      description: routine.description,
      page_name: sql`'notices'::text as page_name`,
      file: routine.file,
      created_by: routine.created_by,
      created_by_name: hrSchema.users.name,
      created_at: routine.created_at,
      updated_at: routine.updated_at,
      remarks: routine.remarks,
      is_global: routine.is_global,
      page_link: department.page_link,
    })
      .from(routine)
      .leftJoin(department, eq(routine.department_uuid, department.uuid))
      .leftJoin(hrSchema.users, eq(routine.created_by, hrSchema.users.uuid))
      .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
      .where(and(
        eq(routine.type, page_name),
        eq(routine.is_global, true),
      ));
  }

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);

  const mergeQuery = page_name === 'notices' && routineResultPromise
    ? resultPromise.union(routineResultPromise)
    : resultPromise;

  const mergeQueryPromise = await mergeQuery;

  const baseQuery = is_pagination === 'true'
    ? constructSelectAllQuery(mergeQuery, c.req.valid('query'), 'created_at', [hrSchema.users.name.name], field_name, field_value)
    : mergeQuery;

  const infoData = await baseQuery;

  const data = infoData;

  // sort data based on created_at in descending order
  data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const pagination = is_pagination === 'true'
    ? {
        total_record: mergeQueryPromise.length,
        current_page: Number(page),
        total_page: Math.ceil(mergeQueryPromise.length / limit),
        next_page: page + 1 > Math.ceil(mergeQueryPromise.length / limit) ? null : page + 1,
        prev_page: page - 1 <= 0 ? null : page - 1,
      }
    : null;

  const response = is_pagination === 'true'
    ? {
        data,
        pagination,
      }
    : data;

  return c.json(response || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: info.id,
    uuid: info.uuid,
    description: info.description,
    page_name: info.page_name,
    file: info.file,
    created_by: info.created_by,
    created_by_name: hrSchema.users.name,
    created_at: info.created_at,
    updated_at: info.updated_at,
    remarks: info.remarks,
    is_offer: info.is_offer,
  })
    .from(info)
    .leftJoin(hrSchema.users, eq(info.created_by, hrSchema.users.uuid))
    .where(eq(info.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
