import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, updateFile, uploadFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { faculty, job_circular } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const file = formData.file;

  const filePath = await uploadFile(file, 'public/job-circular');

  const value = {
    uuid: formData.uuid,
    title: formData.title,
    faculty_uuid: formData.faculty_uuid,
    category: formData.category,
    location: formData.location,
    file: filePath,
    deadline: formData.deadline,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    created_by: formData.created_by,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(job_circular).values(value).returning({
    name: job_circular.title,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it
  if (formData.file) {
    // get jobCircular image name
    const jobCircularData = await db.query.job_circular.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (jobCircularData && jobCircularData.file) {
      const filePath = await updateFile(formData.file, jobCircularData.file, 'public/job-circular');
      formData.file = filePath;
    }
    else {
      const filePath = await uploadFile(formData.file, 'public/job-circular');
      formData.file = filePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(job_circular)
    .set(formData)
    .where(eq(job_circular.uuid, uuid))
    .returning({
      name: job_circular.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get jobCircular file name

  const jobCircularData = await db.query.job_circular.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (jobCircularData && jobCircularData.file) {
    deleteFile(jobCircularData.file);
  }

  const [data] = await db.delete(job_circular)
    .where(eq(job_circular.uuid, uuid))
    .returning({
      name: job_circular.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    title: job_circular.title,
    uuid: job_circular.uuid,
    faculty_uuid: job_circular.faculty_uuid,
    faculty_name: faculty.name,
    category: job_circular.category,
    location: job_circular.location,
    file: job_circular.file,
    deadline: job_circular.deadline,
    created_at: job_circular.created_at,
    updated_at: job_circular.updated_at,
    created_by: job_circular.created_by,
    created_by_name: hrSchema.users.name,
    remarks: job_circular.remarks,
  })
    .from(job_circular)
    .leftJoin(faculty, eq(job_circular.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(job_circular.created_by, hrSchema.users.uuid));

  const data = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    title: job_circular.title,
    uuid: job_circular.uuid,
    faculty_uuid: job_circular.faculty_uuid,
    faculty_name: faculty.name,
    category: job_circular.category,
    location: job_circular.location,
    file: job_circular.file,
    deadline: job_circular.deadline,
    created_at: job_circular.created_at,
    updated_at: job_circular.updated_at,
    created_by: job_circular.created_by,
    created_by_name: hrSchema.users.name,
    remarks: job_circular.remarks,
  })
    .from(job_circular)
    .leftJoin(faculty, eq(job_circular.faculty_uuid, faculty.uuid))
    .leftJoin(hrSchema.users, eq(job_circular.created_by, hrSchema.users.uuid))
    .where(eq(job_circular.uuid, uuid));

  const data = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data[0] || {}, HSCode.OK);
};
