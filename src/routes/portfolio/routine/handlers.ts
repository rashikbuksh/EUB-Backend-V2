import type { AppRouteHandler } from '@/lib/types';

import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { constructSelectAllQuery } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneDepartmentRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, faculty, routine } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const formData = await c.req.parseBody();
  const isAboutUs = formData.type === 'about_us';
  const file = isAboutUs ? sql`null` : formData.file;

  const filePath = isAboutUs ? sql`null` : await insertFile(file, 'public/routine');

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
  if (formData.file && typeof formData.file === 'object') {
    // get routine file name
    const routineData = await db.query.routine.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    const isAboutUs = routineData?.type === 'about_us';

    if (routineData && routineData.file) {
      const filePath = isAboutUs ? sql`null` : await updateFile(formData.file, routineData.file, 'public/routine');
      formData.file = filePath;
    }
    else {
      const filePath = isAboutUs ? sql`null` : await insertFile(formData.file, 'public/routine');
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

  const isAboutUs = routineData?.type === 'about_us';

  if (routineData && routineData.file && !isAboutUs) {
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
  const { portfolio_department, program, type, access, is_pagination, field_name, field_value } = c.req.valid('query');

  let accessArray = [];
  if (access) {
    accessArray = access.split(',');
  }

  const resultPromise = db.select({
    id: routine.id,
    uuid: routine.uuid,
    department_uuid: routine.department_uuid,
    department_name: department.name,
    faculty_uuid: department.faculty_uuid,
    faculty_name: faculty.name,
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
    page_link: department.page_link,
  })
    .from(routine)
    .leftJoin(department, eq(routine.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(routine.created_by, hrSchema.users.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid));

  const limit = Number.parseInt(c.req.valid('query').limit);
  const page = Number.parseInt(c.req.valid('query').page);

  if (portfolio_department && program && type) {
    resultPromise.groupBy(routine.uuid, department.name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
    resultPromise.having(and(
      eq(sql`department.short_name::text`, sql`lower(${portfolio_department})`),
      eq(routine.programs, program),
      eq(routine.type, type),
    ));
  }
  else if (portfolio_department && program) {
    resultPromise.groupBy(routine.uuid, department.name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
    resultPromise.having(and(
      eq(sql`department.short_name::text`, sql`lower(${portfolio_department})`),
      eq(routine.programs, program),
    ));
  }
  else if (portfolio_department && type) {
    resultPromise.groupBy(routine.uuid, department.name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
    resultPromise.having(and(
      eq(sql`department.short_name::text`, sql`lower(${portfolio_department})`),
      eq(routine.type, type),
    ));
  }
  else if (program && type) {
    resultPromise.groupBy(routine.uuid, department.name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
    resultPromise.having(and(
      eq(routine.programs, program),
      eq(routine.type, type),
    ));
  }
  else if (portfolio_department) {
    resultPromise.groupBy(routine.uuid, department.name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
    resultPromise.having(eq(sql`department.short_name::text`, sql`lower(${portfolio_department})`));
  }
  else if (program) {
    resultPromise.groupBy(routine.uuid, department.name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
    resultPromise.having(eq(routine.programs, program));
  }
  else if (type) {
    resultPromise.groupBy(routine.uuid, department.name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
    resultPromise.having(eq(routine.type, type));
  }
  if (accessArray.length > 0) {
    if (accessArray.includes('other')) {
      accessArray = accessArray.filter((item: string) => item !== 'other');
    }
    else { // If 'other' is not included, then we filter normally
      resultPromise.groupBy(routine.uuid, department.name, department.short_name, department.short_name, hrSchema.users.name, department.faculty_uuid, faculty.name, department.page_link);
      resultPromise.having(inArray(department.short_name, accessArray));
    }
  }

  const resultPromiseForCount = await resultPromise;

  const baseQuery = is_pagination === 'true'
    ? constructSelectAllQuery(resultPromise, c.req.valid('query'), 'created_at', [department.short_name.name, hrSchema.users.name.name], field_name, field_value)
    : resultPromise;

  baseQuery.orderBy(desc(routine.created_at));

  const data = await baseQuery;

  const pagination = is_pagination === 'true'
    ? {
        total_record: resultPromiseForCount.length,
        current_page: Number(page),
        total_page: Math.ceil(resultPromiseForCount.length / limit),
        next_page: page + 1 > Math.ceil(resultPromiseForCount.length / limit) ? null : page + 1,
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
    PageLink: department.page_link,
  })
    .from(routine)
    .leftJoin(department, eq(routine.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(routine.created_by, hrSchema.users.uuid))
    .where(eq(routine.uuid, uuid));

  const data = await resultPromise;

  return c.json(data[0] || [], HSCode.OK);
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
