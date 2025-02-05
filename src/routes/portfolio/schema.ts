import { relations, sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, PG_DECIMAL, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION, DEFAULT_SEQUENCE } from '@/utils/db';

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

export const authorities_id = portfolio.sequence('authorities_id', DEFAULT_SEQUENCE);

export const authorities = portfolio.table('authorities', {
  id: integer('id').default(sql`nextval('portfolio.authorities_id')`),
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid')
    .notNull()
    .references(() => users.uuid, DEFAULT_OPERATION),
  category: authorities_category('category').notNull(),
  short_biography: text('short_biography').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});

//* Info
export const info_page_name = portfolio.enum('info_page_name', [
  'notices',
  'academic_calendar',
  'examination_guidelines',
  'information_about_provisional_certificate',
  'clubs_and_society',
]);

export const info_id = portfolio.sequence('info_id', DEFAULT_SEQUENCE);

export const info = portfolio.table('info', {
  id: integer('id').default(sql`nextval('portfolio.info_id')`),
  uuid: uuid_primary,
  description: text('description').notNull(),
  page_name: info_page_name('page_name').notNull(),
  file: text('file').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});

//* Bot
export const bot_category = portfolio.enum('bot_category', [
  'syndicate',
  'academic_council',
]);

export const bot_status = portfolio.enum('bot_status', [
  'chairman',
  'member',
  'member_secretary',
]);

export const bot_id = portfolio.sequence('bot_id', DEFAULT_SEQUENCE);

export const bot = portfolio.table('bot', {
  id: integer('id').default(sql`nextval('portfolio.bot_id')`),
  uuid: uuid_primary,
  category: bot_category('category').notNull(),
  user_uuid: defaultUUID('user_uuid').notNull().references(() => users.uuid, DEFAULT_OPERATION),
  status: bot_status('status').notNull(),
  file: text('file').notNull(),
  description: text('description').notNull(),

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

export const program_id = portfolio.sequence('program_id', DEFAULT_SEQUENCE);

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
  DEFAULT_SEQUENCE,
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
  DEFAULT_SEQUENCE,
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
  DEFAULT_SEQUENCE,
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
  bsc_name: text('bsc_name'),
  bsc_cgpa: PG_DECIMAL('bsc_cgpa').default('0'),
  bsc_passing_year: integer('bsc_passing_year'),
  bsc_institute: text('bsc_institute'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

export const portfolio_bot_rel = relations(bot, ({ one }) => ({
  user: one(users, {
    fields: [bot.user_uuid],
    references: [users.uuid],
  }),
  created_by: one(users, {
    fields: [bot.created_by],
    references: [users.uuid],
  }),
}));

//* faculty

export const faculty_id = portfolio.sequence(
  'faculty_id',
  DEFAULT_SEQUENCE,
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
  DEFAULT_SEQUENCE,
);

export const job_circular = portfolio.table('job_circular', {
  id: integer('id').default(sql`nextval('portfolio.job_circular_id')`),
  uuid: uuid_primary,
  title: text('title').notNull(),
  faculty_uuid: defaultUUID('faculty_uuid').notNull().references(() => faculty.uuid, DEFAULT_OPERATION),
  category: text('category').notNull(),
  location: text('location').default(sql`null`),
  file: text('file').default(sql`null`),
  deadline: DateTime('deadline'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* department

export const department_id = portfolio.sequence(
  'department_id',
  DEFAULT_SEQUENCE,
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

// * department teachers

export const department_teachers_id = portfolio.sequence(
  'department_teachers_id',
  DEFAULT_SEQUENCE,
);

export const department_teachers = portfolio.table('department_teachers', {
  id: integer('id').default(sql`nextval('portfolio.department_teachers_id')`),
  uuid: uuid_primary,
  department_uuid: defaultUUID('department_uuid').notNull().references(() => department.uuid, DEFAULT_OPERATION),
  teacher_uuid: defaultUUID('teacher_uuid').notNull().references(() => users.uuid, DEFAULT_OPERATION),
  department_head: boolean('department_head').default(false),
  education: text('education').notNull(),
  publication: text('publication'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

export const portfolio_department_teachers_rel = relations(department_teachers, ({ one }) => ({
  department: one(department, {
    fields: [department_teachers.department_uuid],
    references: [department.uuid],
  }),
  teacher: one(users, {
    fields: [department_teachers.teacher_uuid],
    references: [users.uuid],
  }),
  created_by: one(users, {
    fields: [department_teachers.created_by],
    references: [users.uuid],
  }),
}));

//* routine

export const routine_id = portfolio.sequence(
  'routine_id',
  DEFAULT_SEQUENCE,
);

export const routine_programs = portfolio.enum('routine_programs', [
  'evening',
  'regular',
]);

export const routine_type = portfolio.enum('routine_type', [
  'class_routine',
  'exam_schedule',
]);

export const routine = portfolio.table('routine', {
  id: integer('id').default(sql`nextval('portfolio.routine_id')`),
  uuid: uuid_primary,
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
  DEFAULT_SEQUENCE,
);

export const club = portfolio.table('club', {
  id: integer('id').default(sql`nextval('portfolio.club_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  department_uuid: defaultUUID('department_uuid').notNull().references(() => department.uuid, DEFAULT_OPERATION),
  president_uuid: defaultUUID('president_uuid').notNull(),
  message: text('message').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* office

export const office_id = portfolio.sequence('office_id', DEFAULT_SEQUENCE);

export const office_category = portfolio.enum('office_category', [
  'registrar',
  'controller_of_examinations',
  'ict_division',
  'ciac',
  'program_coordination',
  'admission_and_student_affairs',
  'finance_and_accounts',
  'faculty_development_and_evaluation',
  'planning_and_development',
  'proctor',
  'procurement_and_inventory',
  'iqac',
  'library',
]);

export const office = portfolio.table('office', {
  id: integer('id').default(sql`nextval('portfolio.office_id')`),
  uuid: uuid_primary,
  title: text('title').notNull(),
  category: office_category('category').notNull(),
  image: text('image').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});
//* office entry

export const office_entry_id = portfolio.sequence('office_entry_id', DEFAULT_SEQUENCE);

export const office_entry = portfolio.table('office_entry', {
  id: integer('id').default(sql`nextval('portfolio.office_entry_id')`),
  uuid: uuid_primary,
  office_uuid: defaultUUID('office_uuid').references(
    () => office.uuid,
    DEFAULT_OPERATION,
  ),
  user_uuid: defaultUUID('user_uuid').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});

// ? News & Entry
//* News
export const news_id = portfolio.sequence('news_id', DEFAULT_SEQUENCE);

export const news = portfolio.table('news', {
  id: integer('id').default(sql`nextval('portfolio.news_id')`),
  uuid: uuid_primary,
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').default(sql`null`),
  content: text('content').notNull(),
  cover_image: text('cover_image').notNull(),
  published_date: text('published_date').notNull(),
  department_uuid: defaultUUID('department_uuid').notNull().references(() => department.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at').$onUpdate(() => 'now()'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
});

//* News Entry
export const news_entry = portfolio.table('news_entry', {
  uuid: uuid_primary,
  news_uuid: defaultUUID('news_uuid').notNull().references(() => news.uuid, DEFAULT_OPERATION),
  documents: text('documents').notNull(),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at').$onUpdate(() => 'now()'),
});

//* relations
export const portfolio_news_rel = relations(news, ({ one, many }) => ({

  department: one(department, {
    fields: [news.department_uuid],
    references: [department.uuid],
  }),
  documents: many(news_entry),
  created_by: one(users, {
    fields: [news.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_news_entry_rel = relations(news_entry, ({ one }) => ({
  news: one(news, {
    fields: [news_entry.news_uuid],
    references: [news.uuid],
  }),
}));

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

export const portfolio_office_rel = relations(office, ({ one }) => ({
  created_by: one(users, {
    fields: [office.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_office_entry_rel = relations(office_entry, ({ one }) => ({
  office: one(office, {
    fields: [office_entry.office_uuid],
    references: [office.uuid],
  }),
  user: one(users, {
    fields: [office_entry.user_uuid],
    references: [users.uuid],
  }),
  created_by: one(users, {
    fields: [office_entry.created_by],
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
