import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { internal_cost_center } from '../schema';

//* crud
export const selectSchema = createSelectSchema(internal_cost_center);

export const insertSchema = createInsertSchema(
  internal_cost_center,
  {
    uuid: schema => schema.uuid.length(21),
    authorized_person_uuid: schema => schema.authorized_person_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    from: schema => schema.from.regex(dateTimePattern, {
      message: 'from must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    to: schema => schema.to.regex(dateTimePattern, {
      message: 'to must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  type: true,
  authorized_person_uuid: true,
  name: true,
  from: true,
  to: true,
  created_at: true,
  created_by: true,
}).partial({
  budget: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
