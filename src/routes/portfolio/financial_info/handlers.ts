import type { AppRouteHandler } from '@/lib/types';

import { asc, eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetFinancialInfoByCategoryRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { department, faculty, financial_info } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(financial_info).values(value).returning({
    name: financial_info.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(financial_info)
    .set(updates)
    .where(eq(financial_info.uuid, uuid))
    .returning({
      name: financial_info.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(financial_info)
    .where(eq(financial_info.uuid, uuid))
    .returning({
      name: financial_info.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: financial_info.id,
    uuid: financial_info.uuid,
    department_uuid: financial_info.department_uuid,
    department_name: department.name,
    table_name: financial_info.table_name,
    faculty_uuid: department.faculty_uuid,
    faculty_name: faculty.name,
    category: department.category,
    total_credit: financial_info.total_credit,
    total_cost: financial_info.total_cost,
    total_waiver_amount: financial_info.total_waiver_amount,
    admission_fee: financial_info.admission_fee,
    waiver_50: financial_info.waiver_50,
    waiver_55: financial_info.waiver_55,
    waiver_60: financial_info.waiver_60,
    waiver_65: financial_info.waiver_65,
    waiver_70: financial_info.waiver_70,
    waiver_75: financial_info.waiver_75,
    waiver_80: financial_info.waiver_80,
    waiver_85: financial_info.waiver_85,
    waiver_90: financial_info.waiver_90,
    waiver_95: financial_info.waiver_95,
    waiver_100: financial_info.waiver_100,
    created_by: financial_info.created_by,
    created_by_name: hrSchema.users.name,
    created_at: financial_info.created_at,
    updated_at: financial_info.updated_at,
    remarks: financial_info.remarks,
    no_of_semester: financial_info.no_of_semester,
    per_semester_duration: financial_info.per_semester_duration,
  })
    .from(financial_info)
    .leftJoin(department, eq(financial_info.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(financial_info.created_by, hrSchema.users.uuid))
    .orderBy(asc(department.name));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: financial_info.id,
    uuid: financial_info.uuid,
    department_uuid: financial_info.department_uuid,
    department_name: department.name,
    table_name: financial_info.table_name,
    category: department.category,
    total_credit: financial_info.total_credit,
    total_cost: financial_info.total_cost,
    total_waiver_amount: financial_info.total_waiver_amount,
    admission_fee: financial_info.admission_fee,
    waiver_50: financial_info.waiver_50,
    waiver_55: financial_info.waiver_55,
    waiver_60: financial_info.waiver_60,
    waiver_65: financial_info.waiver_65,
    waiver_70: financial_info.waiver_70,
    waiver_75: financial_info.waiver_75,
    waiver_80: financial_info.waiver_80,
    waiver_85: financial_info.waiver_85,
    waiver_90: financial_info.waiver_90,
    waiver_95: financial_info.waiver_95,
    waiver_100: financial_info.waiver_100,
    created_by: financial_info.created_by,
    created_by_name: hrSchema.users.name,
    created_at: financial_info.created_at,
    updated_at: financial_info.updated_at,
    remarks: financial_info.remarks,
    no_of_semester: financial_info.no_of_semester,
    per_semester_duration: financial_info.per_semester_duration,
  })
    .from(financial_info)
    .leftJoin(department, eq(financial_info.department_uuid, department.uuid))
    .leftJoin(hrSchema.users, eq(financial_info.created_by, hrSchema.users.uuid))
    .where(eq(financial_info.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};

export const getFinancialInfoByCategory: AppRouteHandler<GetFinancialInfoByCategoryRoute> = async (c: any) => {
  const { category } = c.req.valid('param');

  const resultPromise = db.select({
    id: financial_info.id,
    uuid: financial_info.uuid,
    department_uuid: financial_info.department_uuid,
    department_name: department.name,
    table_name: financial_info.table_name,
    category: department.category,
    faculty_uuid: department.faculty_uuid,
    faculty_name: faculty.name,
    total_credit: financial_info.total_credit,
    total_cost: financial_info.total_cost,
    total_waiver_amount: financial_info.total_waiver_amount,
    admission_fee: financial_info.admission_fee,
    waiver_50: financial_info.waiver_50,
    waiver_55: financial_info.waiver_55,
    waiver_60: financial_info.waiver_60,
    waiver_65: financial_info.waiver_65,
    waiver_70: financial_info.waiver_70,
    waiver_75: financial_info.waiver_75,
    waiver_80: financial_info.waiver_80,
    waiver_85: financial_info.waiver_85,
    waiver_90: financial_info.waiver_90,
    waiver_95: financial_info.waiver_95,
    waiver_100: financial_info.waiver_100,
    created_by: financial_info.created_by,
    created_by_name: hrSchema.users.name,
    created_at: financial_info.created_at,
    updated_at: financial_info.updated_at,
    remarks: financial_info.remarks,
    no_of_semester: financial_info.no_of_semester,
    per_semester_duration: financial_info.per_semester_duration,
  })
    .from(financial_info)
    .leftJoin(department, eq(financial_info.department_uuid, department.uuid))
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(financial_info.created_by, hrSchema.users.uuid))
    .where(eq(department.category, category));

  const data = await resultPromise;

  // group data using faculty name
  const dataByFaculty = data.reduce((acc: any, item: any) => {
    if (!acc[item.faculty_name]) {
      acc[item.faculty_name] = [];
    }
    acc[item.faculty_name].push(item);
    return acc;
  }, {});

  return c.json(dataByFaculty || [], HSCode.OK);
};
