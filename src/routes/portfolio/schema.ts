import { relations, sql } from 'drizzle-orm';
import { integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, PG_DECIMAL, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

import { users } from '../hr/schema';

const portfolio = pgSchema('portfolio');

//* Authorities
export const authorities_category = portfolio.enum('authorities_category', [
  'chancellor',
  'chairman',
  'vc',
  'pro_vc',
  'dean',
  'treasurer',
  'director_coordination',
  'registrar',
]);

export const authorities_id = portfolio.sequence(
  'authorities_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const authorities = portfolio.table('authorities', {
  id: integer('id').default(sql`nextval('portfolio.authorities_id')`),
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid').notNull().references(() => users.uuid, DEFAULT_OPERATION),
  category: authorities_category('category').notNull(),
  short_biography: text('short_biography').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* Info
export const info_page_name = portfolio.enum('info_page_name', [
  'chancellor',
  'chairman',
  'vc',
  'pro_vc',
  'dean',
  'treasurer',
  'director_coordination',
  'registrar',
]);

export const info_id = portfolio.sequence(
  'info_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const info = portfolio.table('info', {
  id: integer('id').default(sql`nextval('portfolio.info_id')`),
  uuid: uuid_primary,
  description: text('description').notNull(),
  page_name: info_page_name('page_name').notNull(),
  file: text('file').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* program

export const program_category = portfolio.enum('program_category', [
  'graduate',
  'undergraduate',
  'certificate',
]);

export const program_id = portfolio.sequence(
  'program_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const program = portfolio.table('program', {
  id: integer('id').default(sql`nextval('portfolio.program_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  category: program_category('category').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* certificate course fee

export const certificate_course_fee_id = portfolio.sequence(
  'certificate_course_fee_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const certificate_course_fee = portfolio.table('certificate_course_fee', {
  id: integer('id').default(sql`nextval('portfolio.certificate_course_fee_id')`),
  uuid: uuid_primary,
  programs_uuid: defaultUUID('programs_uuid').notNull().references(() => program.uuid, DEFAULT_OPERATION),
  fee_per_course: PG_DECIMAL('fee_per_course').default('0'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* tuition fee

export const tuition_fee_id = portfolio.sequence(
  'tuition_fee_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const tuition_fee = portfolio.table('tuition_fee', {
  id: integer('id').default(sql`nextval('portfolio.tuition_fee_id')`),
  uuid: uuid_primary,
  title: text('title').notNull(),
  program_uuid: defaultUUID('program_uuid').notNull().references(() => program.uuid, DEFAULT_OPERATION),
  admission_fee: PG_DECIMAL('admission_fee').notNull(),
  tuition_fee_per_credit: PG_DECIMAL('tuition_fee_per_credit').notNull(),
  student_activity_fee: PG_DECIMAL('student_activity_fee').notNull(),
  library_fee_per_semester: PG_DECIMAL('library_fee_per_semester').notNull(),
  computer_lab_fee_per_semester: PG_DECIMAL('computer_lab_fee_per_semester').notNull(),
  science_lab_fee_per_semester: PG_DECIMAL('science_lab_fee_per_semester').notNull(),
  studio_lab_fee: PG_DECIMAL('studio_lab_fee').default('0'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* online admission

export const online_admission_id = portfolio.sequence(
  'online_admission_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const online_admission_semester = portfolio.enum('online_admission_semester', [
  'spring',
  'summer',
  'fall',
]);

export const online_admission_blood_group = portfolio.enum('online_admission_blood_group', [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
]);

export const online_admission_gender = portfolio.enum('online_admission_gender', [
  'Male',
  'Female',
  'Other',
]);

export const online_admission_marital_status = portfolio.enum('online_admission_marital_status', [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
]);

export const online_admission = portfolio.table('online_admission', {
  id: integer('id').default(sql`nextval('portfolio.online_admission_id')`),
  uuid: uuid_primary,
  semester: online_admission_semester('semester').notNull(),
  program_uuid: defaultUUID('program_uuid').notNull().references(() => program.uuid, DEFAULT_OPERATION),
  applicant_name: text('applicant_name').notNull(),
  father_name: text('father_name').notNull(),
  mother_name: text('mother_name').notNull(),
  local_guardian: text('local_guardian').notNull(),
  date_of_birth: DateTime('date_of_birth').notNull(),
  nationality: text('nationality').notNull(),
  blood_group: online_admission_blood_group('blood_group').notNull(),
  phone_number: text('phone_number').notNull(),
  email: text('email').notNull(),
  gender: online_admission_gender('gender').notNull(),
  marital_status: online_admission_marital_status('marital_status').notNull(),
  present_address: text('present_address').notNull(),
  village: text('village').notNull(),
  post_office: text('post_office').notNull(),
  thana: text('thana').notNull(),
  district: text('district').notNull(),
  ssc_group: text('ssc_group').notNull(),
  ssc_grade: text('ssc_grade').notNull(),
  ssc_gpa: PG_DECIMAL('ssc_gpa').notNull(),
  ssc_board: text('ssc_board').notNull(),
  ssc_passing_year: integer('ssc_passing_year').notNull(),
  ssc_institute: text('ssc_institute').notNull(),
  hsc_group: text('hsc_group').notNull(),
  hsc_grade: text('hsc_grade').notNull(),
  hsc_gpa: PG_DECIMAL('hsc_gpa').notNull(),
  hsc_board: text('hsc_board').notNull(),
  hsc_passing_year: integer('hsc_passing_year').notNull(),
  hsc_institute: text('hsc_institute').notNull(),
  bsc_name: text('bsc_name').notNull(),
  bsc_cgpa: PG_DECIMAL('bsc_cgpa').notNull(),
  bsc_passing_year: integer('bsc_passing_year').notNull(),
  bsc_institute: text('bsc_institute').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* faculty

export const faculty_id = portfolio.sequence(
  'faculty_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const faculty = portfolio.table('faculty', {
  id: integer('id').default(sql`nextval('portfolio.faculty_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* job circular

export const job_circular_id = portfolio.sequence(
  'job_circular_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const job_circular = portfolio.table('job_circular', {
  id: integer('id').default(sql`nextval('portfolio.job_circular_id')`),
  uuid: uuid_primary,
  title: text('title').notNull(),
  faculty_uuid: defaultUUID('faculty_uuid').notNull().references(() => faculty.uuid, DEFAULT_OPERATION),
  category: text('category').notNull(),
  location: text('location').notNull(),
  file: text('file').notNull(),
  deadline: DateTime('deadline'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* department

export const department_id = portfolio.sequence(
  'department_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const department_category = portfolio.enum('department_category', [
  'undergraduate',
  'graduate',
  'certificate',
]);

export const department = portfolio.table('department', {
  id: integer('id').default(sql`nextval('portfolio.department_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  faculty_uuid: defaultUUID('faculty_uuid').notNull().references(() => faculty.uuid, DEFAULT_OPERATION),
  category: department_category('category').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* routine

export const routine_id = portfolio.sequence(
  'routine_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const routine_programs = portfolio.enum('routine_programs', [
  'evening',
  'regular',
]);

export const routine_type = portfolio.enum('routine_type', [
  'class routine',
  'exam schedule',
]);

export const routine = portfolio.table('routine', {
  id: integer('id').default(sql`nextval('portfolio.routine_id')`),
  uuid: uuid_primary,
  program_uuid: defaultUUID('program_uuid').notNull().references(() => program.uuid, DEFAULT_OPERATION),
  department_uuid: defaultUUID('department_uuid').notNull().references(() => department.uuid, DEFAULT_OPERATION),
  programs: routine_programs('programs').notNull(),
  type: routine_type('type').notNull(),
  file: text('file').notNull(),
  description: text('description').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* club

export const club_id = portfolio.sequence(
  'club_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const club = portfolio.table('club', {
  id: integer('id').default(sql`nextval('portfolio.club_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  department_uuid: defaultUUID('department_uuid').notNull().references(() => department.uuid, DEFAULT_OPERATION),
  // president_uuid: defaultUUID('president_uuid').notNull(),
  message: text('message').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* relations
export const portfolio_authorities_rel = relations(authorities, ({ one }) => ({
  user: one(users, {
    fields: [authorities.user_uuid],
    references: [users.uuid],
  }),
  created_by: one(users, {
    fields: [authorities.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_info_rel = relations(info, ({ one }) => ({
  created_by: one(users, {
    fields: [info.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_program_rel = relations(program, ({ one }) => ({
  created_by: one(users, {
    fields: [program.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_certificate_course_fee_rel = relations(certificate_course_fee, ({ one }) => ({
  programs: one(program, {
    fields: [certificate_course_fee.programs_uuid],
    references: [program.uuid],
  }),
  created_by: one(users, {
    fields: [certificate_course_fee.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_tuition_fee_rel = relations(tuition_fee, ({ one }) => ({
  program: one(program, {
    fields: [tuition_fee.program_uuid],
    references: [program.uuid],
  }),
  created_by: one(users, {
    fields: [tuition_fee.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_online_admission_rel = relations(online_admission, ({ one }) => ({
  program: one(program, {
    fields: [online_admission.program_uuid],
    references: [program.uuid],
  }),
  created_by: one(users, {
    fields: [online_admission.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_faculty_rel = relations(faculty, ({ one }) => ({
  created_by: one(users, {
    fields: [faculty.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_job_circular_rel = relations(job_circular, ({ one }) => ({
  faculty: one(faculty, {
    fields: [job_circular.faculty_uuid],
    references: [faculty.uuid],
  }),
  created_by: one(users, {
    fields: [job_circular.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_department_rel = relations(department, ({ one }) => ({
  faculty: one(faculty, {
    fields: [department.faculty_uuid],
    references: [faculty.uuid],
  }),
  created_by: one(users, {
    fields: [department.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_routine_rel = relations(routine, ({ one }) => ({
  department: one(department, {
    fields: [routine.department_uuid],
    references: [department.uuid],
  }),
  program: one(program, {
    fields: [routine.program_uuid],
    references: [program.uuid],
  }),
  created_by: one(users, {
    fields: [routine.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_club_rel = relations(club, ({ one }) => ({
  department: one(department, {
    fields: [club.department_uuid],
    references: [department.uuid],
  }),
  created_by: one(users, {
    fields: [club.created_by],
    references: [users.uuid],
  }),
}));

export default portfolio;
