import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { requisition } from './../../../procure/schema';

//* crud
export const selectSchema = createSelectSchema(requisition);

export const insertSchema = createInsertSchema(
  requisition,
  {
    uuid: schema => schema.uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),

  },
).required({
  uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  is_received: true,
  received_date: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,

});

export const patchSchema = insertSchema.partial();
