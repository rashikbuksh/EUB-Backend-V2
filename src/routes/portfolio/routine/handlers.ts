import type { AppRouteHandler } from '@/lib/types';

import { and, eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneDepartmentRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, routine } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();
  const file = formData.file;

  const filePath = await insertFile(file, 'public/routine');

  const value = {
    uuid: formData.uuid,
    department_uuid: formData.department_uuid,
    programs: formData.programs,
    type: formData.type,
    file: filePath,
    description: formData.description,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
    is_global: formData.is_global,
  };

  const [data] = await db.insert(routine).values(value).returning({
    name: routine.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes file then do it else exclude it
  if (formData.file) {
    // get routine file name
    const routineData = await db.query.routine.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (routineData && routineData.file) {
      const filePath = await updateFile(formData.file, routineData.file, 'public/routine');
      formData.file = filePath;
    }
    else {
      const filePath = await insertFile(formData.file, 'public/routine');
      formData.file = filePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(routine)
    .set(formData)
    .where(eq(routine.uuid, uuid))
    .returning({
      name: routine.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get routine file name

  const routineData = await db.query.routine.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (routineData && routineData.file) {
    deleteFile(routineData.file);
  }

  const [data] = await db.delete(routine)
    .where(eq(routine.uuid, uuid))
    .returning({
      name: routine.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { portfolio_department, program, type } = c.req.valid('query');

  const resultPromise = db.select({
    id: routine.id,
    uuid: routine.uuid,
    department_uuid: routine.department_uuid,
    department_name: department.name,
    programs: routine.programs,
    type: routine.type,
    file: routine.file,
    description: routine.description,
    created_at: routine.created_at,
    updated_at: routine.updated_at,
    created_by: routine.created_by,
    created_by_name: hrSchema.users.name,
    remarks: routine.remarks,
    is_global: routine.is_global,
  })
    .from(routine)
    .leftJoin(department, eq(routine.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(routine.created_by, hrSchema.users.uuid));

  if (portfolio_department && program && type) {
    resultPromise.where(and(
      eq(department.name, portfolio_department),
      eq(routine.programs, program),
      eq(routine.type, type),
    ));
  }
  else if (portfolio_department && program) {
    resultPromise.where(and(
      eq(department.name, portfolio_department),
      eq(routine.programs, program),
    ));
  }
  else if (portfolio_department && type) {
    resultPromise.where(and(
      eq(department.name, portfolio_department),
      eq(routine.type, type),
    ));
  }
  else if (program && type) {
    resultPromise.where(and(
      eq(routine.programs, program),
      eq(routine.type, type),
    ));
  }
  else if (portfolio_department) {
    resultPromise.where(eq(department.name, portfolio_department));
  }
  else if (program) {
    resultPromise.where(eq(routine.programs, program));
  }
  else if (type) {
    resultPromise.where(eq(routine.type, type));
  }

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: routine.id,
    uuid: routine.uuid,
    department_uuid: routine.department_uuid,
    department_name: department.name,
    programs: routine.programs,
    type: routine.type,
    file: routine.file,
    description: routine.description,
    created_at: routine.created_at,
    updated_at: routine.updated_at,
    created_by: routine.created_by,
    created_by_name: hrSchema.users.name,
    remarks: routine.remarks,
    is_global: routine.is_global,
  })
    .from(routine)
    .leftJoin(department, eq(routine.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(routine.created_by, hrSchema.users.uuid))
    .where(eq(routine.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getOneDepartment: AppRouteHandler<GetOneDepartmentRoute> = async (c: any) => {
  const { name } = c.req.valid('param');

  const data = await db.query.department.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, name);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
