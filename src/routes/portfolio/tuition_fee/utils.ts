import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { tuition_fee } from '../schema';

//* crud

export const selectSchema = createSelectSchema(tuition_fee);

export const insertSchema = createInsertSchema(
  tuition_fee,
  {
    uuid: schema => schema.uuid.length(21),
    title: schema => schema.title.min(4),
    program_uuid: schema => schema.program_uuid.length(21),
    admission_fee: schema => schema.admission_fee.min(5),
    tuition_fee_per_credit: schema => schema.tuition_fee_per_credit.min(5),
    student_activity_fee: schema => schema.student_activity_fee.min(5),
    library_fee_per_semester: schema => schema.library_fee_per_semester.min(5),
    computer_lab_fee_per_semester: schema => schema.computer_lab_fee_per_semester.min(5),
    science_lab_fee_per_semester: schema => schema.science_lab_fee_per_semester.min(5),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  title: true,
  program_uuid: true,
  admission_fee: true,
  tuition_fee_per_credit: true,
  student_activity_fee: true,
  library_fee_per_semester: true,
  computer_lab_fee_per_semester: true,
  science_lab_fee_per_semester: true,
  created_at: true,
}).partial({
  studio_lab_fee: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
