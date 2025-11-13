import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { req_ticket } from '../schema';

//* crud
export const selectSchema = createSelectSchema(req_ticket);

export const insertSchema = createInsertSchema(
  req_ticket,
  {
    uuid: schema => schema.uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_by: schema => schema.updated_by.length(21),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  department: true,
  problem_description: true,
  created_at: true,
  created_by: true,
}).partial({
  is_resolved: true,
  is_resolved_date: true,
  updated_by: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
