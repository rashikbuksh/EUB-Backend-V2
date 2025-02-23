import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { routine, routine_programs, routine_type } from '../schema';

//* crud
export const selectSchema = createSelectSchema(routine);

export const insertSchema = createInsertSchema(
  routine,
  {
    uuid: schema => schema.uuid.length(21),
    department_uuid: schema => schema.department_uuid.length(21),
    description: schema => schema.description.min(1),
    file: schema => schema.file.min(1),
    programs: schema => schema.programs.refine(value => routine_programs(value), {
      message: 'Invalid programs',
    }),
    type: schema => schema.type.refine(value => routine_type(value), {
      message: 'Invalid type',
    }),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  department_uuid: true,
  file: true,
  programs: true,
  type: true,
  description: true,
  created_at: true,
}).partial({
  updated_at: true,
  remarks: true,
  is_global: true,
});

export const patchSchema = insertSchema.partial();
