import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { bot } from '../schema';

const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(bot).values(value).returning({
    name: bot.user_uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(bot)
    .set(updates)
    .where(eq(bot.uuid, uuid))
    .returning({
      name: bot.user_uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(bot)
    .where(eq(bot.uuid, uuid))
    .returning({
      name: bot.user_uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const { category, is_admin } = c.req.valid('query');

  // const data = await db.query.bot.findMany();
  const resultPromise = db.select({
    id: bot.id,
    uuid: bot.uuid,
    user_uuid: bot.user_uuid,
    user_name: hrSchema.users.name,
    user_designation: hrSchema.designation.name,
    category: bot.category,
    status: bot.status,
    description: bot.description,
    created_by: bot.created_by,
    created_by_name: created_user.name,
    created_at: bot.created_at,
    updated_at: bot.updated_at,
    remarks: bot.remarks,
  })
    .from(bot)
    .leftJoin(hrSchema.users, eq(bot.user_uuid, hrSchema.users.uuid))
    .leftJoin(created_user, eq(bot.created_by, created_user.uuid))
    .leftJoin(hrSchema.designation, eq(hrSchema.users.designation_uuid, hrSchema.designation.uuid));

  if (category) {
    resultPromise.where(eq(bot.category, category));
  }

  const data: any[] = await resultPromise;
  interface Person {
    id: string;
    name: string;
    designation: string;
  }

  const formattedData: { chairperson: Person | null; member: Person[] } = {
    chairperson: null,
    member: [],
  };

  data.forEach((item, index) => {
    if (item.status === 'chairman') {
      formattedData.chairperson = {
        id: '1',
        name: item.user_name,
        designation: item.user_designation,
      };
    }
    else if (item.status === 'member') {
      formattedData.member.push({
        id: (index + 2).toString(),
        name: item.user_name,
        designation: item.user_designation,
      });
    }
  });

  let filterData;
  if (is_admin === 'true') {
    filterData = data;
  }
  else {
    filterData = formattedData;
  }

  return c.json(filterData, HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.bot.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
