import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';
import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { req_ticket_item } from '../schema';

//* crud
export const selectSchema = createSelectSchema(req_ticket_item);

export const insertSchema = createInsertSchema(
  req_ticket_item,
  {
    uuid: schema => schema.uuid.length(21),
    req_ticket_uuid: schema => schema.req_ticket_uuid.length(21),
    item_uuid: schema => schema.item_uuid.length(21),
    quantity: z.number().min(1, { message: 'quantity must be at least 1' }),
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
  req_ticket_uuid: true,
  item_uuid: true,
  quantity: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_by: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
