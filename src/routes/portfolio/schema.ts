import { relations, sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text, unique } from 'drizzle-orm/pg-core';

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
  email: text('email').default(sql`null`),
  phone: text('phone').default(sql`null`),
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
  user_designation: text('user_designation').notNull().default(sql`null`),
  status: bot_status('status').notNull(),
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
  programs_uuid: defaultUUID('programs_uuid').notNull().unique().references(() => program.uuid, DEFAULT_OPERATION),
  fee_per_course: PG_DECIMAL('fee_per_course').default(sql`0`),
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
  title: text('title').default(sql`null`),
  program_uuid: defaultUUID('program_uuid').notNull().unique().references(() => program.uuid, DEFAULT_OPERATION),
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
  phone_number: text('phone_number').default(sql`null`),
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
  bsc_name: text('bsc_name').default(sql`null`),
  bsc_cgpa: PG_DECIMAL('bsc_cgpa').default(sql`null`),
  bsc_passing_year: integer('bsc_passing_year').default(sql`null`),
  bsc_institute: text('bsc_institute').default(sql`null`),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
  bkash: text('bkash').notNull(),
});

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
  'none',
]);

export const department_short_name = portfolio.enum('department_short_name', [
  'bba',
  'bsc-cse',
  'bsc-textile',
  'bsc-mechanical',
  'bsc-ip',
  'bsc-eee',
  'bsc-civil',
  'emba',
  'mba',
  'mba-one-year',
  'thm',
  'ba-english',
  'bss-economics',
  'llb',
  'llm',
  'ma-english',
  'mgds-one-year',
  'mss-economics',
  'd-eee',
  'extra-curricular-club',
]);

export const department = portfolio.table('department', {
  id: integer('id').default(sql`nextval('portfolio.department_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  short_name: department_short_name('short_name').notNull(),
  page_link: text('page_link').default(sql`null`),
  faculty_uuid: defaultUUID('faculty_uuid').notNull().references(() => faculty.uuid, DEFAULT_OPERATION),
  category: department_category('category').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
  index: integer('index').notNull().unique(),
});

//* Info
export const info_page_name = portfolio.enum('info_page_name', [
  'notices',
  'academic_calendar',
  'examination_guidelines',
  'information_about_provisional_certificates',
  'clubs_and_society',
  'academic_information_and_policies',
  'journal',
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
  teacher_designation: text('teacher_designation').notNull().default(sql`null`),
  teacher_phone: text('teacher_phone').default(sql`null`),
  teacher_email: text('teacher_email').notNull().default(sql`null`),
  department_head: boolean('department_head').default(false),
  education: text('education').notNull(),
  publication: text('publication').default(sql`null`),
  journal: text('journal').default(sql`null`),
  appointment_date: DateTime('appointment_date').default(sql`null`),
  resign_date: DateTime('resign_date').default(sql`null`),
  about: text('about').default(sql`null`),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
  department_head_message: text('department_head_message').default(sql`null`),
  teacher_initial: text('teacher_initial').default(sql`null`),
  index: integer('index'),
  status: boolean('status').default(false),
});

//* routine

export const routine_id = portfolio.sequence(
  'routine_id',
  DEFAULT_SEQUENCE,
);

export const routine_programs = portfolio.enum('routine_programs', [
  'evening',
  'regular',
  'none',
]);

export const routine_type = portfolio.enum('routine_type', [
  'class_routine',
  'exam_schedule',
  'notices',
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
  is_global: boolean('is_global').default(false),
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
  president_phone: text('president_phone').default(sql`null`),
  president_email: text('president_email').notNull().default('eub@eub.com'),
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
  'office_1',
  'office_2',
  'office_3',
  'office_4',
  'office_5',
  'office_6',
  'office_7',
  'office_8',
  'office_9',
  'office_10',
  'office_11',
  'office_12',
  'office_13',
  'office_14',
  'office_15',
  'office_16',
  'office_17',
  'office_18',
  'office_19',
  'office_20',
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
  index: integer('index').notNull(),
}, table => [
  unique().on(table.id),
]);
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
  designation: text('designation').notNull().default('teacher'),
  user_phone: text('user_phone').default(sql`null`),
  user_email: text('user_email').default(sql`null`),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
  index: integer('index').default(sql`0`),
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
  is_global: boolean('is_global').default(false),
});

//* News Entry
export const news_entry = portfolio.table('news_entry', {
  uuid: uuid_primary,
  news_uuid: defaultUUID('news_uuid').notNull().references(() => news.uuid, DEFAULT_OPERATION),
  documents: text('documents').notNull(),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at').$onUpdate(() => 'now()'),
});

//* Financial Info
export const financial_info_id = portfolio.sequence('financial_info_id', DEFAULT_SEQUENCE);

export const financial_info_table = portfolio.enum('financial_info_table', [
  'engineering_hsc',
  'engineering_diploma',
  'bba',
  'arts',
]);

export const financial_info = portfolio.table('financial_info', {
  id: integer('id').default(sql`nextval('portfolio.financial_info_id')`),
  uuid: uuid_primary,
  department_uuid: defaultUUID('department_uuid').notNull().references(() => department.uuid, DEFAULT_OPERATION),
  table_name: financial_info_table('table_name').notNull(),
  total_credit: integer('total_credit').default(sql`0`),
  total_cost: integer('total_cost').default(sql`0`),
  total_waiver_amount: integer('total_waiver_amount').default(sql`0`),
  admission_fee: integer('admission_fee').default(sql`0`),
  waiver_50: integer('waiver_50').default(sql`0`),
  waiver_55: integer('waiver_55').default(sql`0`),
  waiver_60: integer('waiver_60').default(sql`0`),
  waiver_65: integer('waiver_65').default(sql`0`),
  waiver_70: integer('waiver_70').default(sql`0`),
  waiver_75: integer('waiver_75').default(sql`0`),
  waiver_80: integer('waiver_80').default(sql`0`),
  waiver_85: integer('waiver_85').default(sql`0`),
  waiver_90: integer('waiver_90').default(sql`0`),
  waiver_95: integer('waiver_95').default(sql`0`),
  waiver_100: integer('waiver_100').default(sql`0`),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at').$onUpdate(() => 'now()'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  remarks: text('remarks'),
}, table => [
  unique().on(table.department_uuid, table.table_name),
]);

//* contact us

export const contact_us_id = portfolio.sequence('contact_us_id', DEFAULT_SEQUENCE);

export const contact_us = portfolio.table('contact_us', {
  id: integer('id').default(sql`nextval('portfolio.contact_us_id')`),
  full_name: text('full_name').notNull(),
  email: text('email').notNull(),
  question: text('question').notNull(),
  description: text('description').notNull(),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at').$onUpdate(() => 'now()'),
});

//* offer
export const offer_id = portfolio.sequence('offer_id', DEFAULT_SEQUENCE);

export const offer = portfolio.table('offer', {
  id: integer('id').default(sql`nextval('portfolio.offer_id')`),
  uuid: uuid_primary,
  serial: integer('serial').unique().notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  file: text('file').default(sql`null`),
  deadline: DateTime('deadline').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* policy
export const policy_id = portfolio.sequence('policy_id', DEFAULT_SEQUENCE);

export const policy = portfolio.table('policy', {
  id: integer('id').default(sql`nextval('portfolio.policy_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  department: text('department').notNull(),
  published_date: DateTime('published_date').notNull(),
  file: text('file').default(sql`null`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

// * Tender

export const table_name_enum_tender = portfolio.enum('table_name_enum_tender', [
  'std_for_goods',
  'std_for_works',
  'safe',
  'evaluation',
]);

export const tender = portfolio.table('tender', {
  uuid: uuid_primary,
  table_name: table_name_enum_tender('table_name').notNull(),
  code: text('code').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  published_date: DateTime('published_date').notNull(),
  file: text('file').default(sql`null`),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const feature = portfolio.table('feature', {
  uuid: uuid_primary,
  index: integer('index').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  file: text('file'),
  is_active: boolean('is_active').default(true),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
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

export const portfolio_office_rel = relations(office, ({ one, many }) => ({
  // office_entries: many(office_entry, {
  //   fields: [office.uuid],
  //   references: [office_entry.office_uuid],
  // }),
  office_entries: many(office_entry),
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

export const portfolio_department_rel = relations(department, ({ one, many }) => ({
  department_teachers: many(department_teachers),
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

export const portfolio_info_rel = relations(info, ({ one }) => ({
  created_by: one(users, {
    fields: [info.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_offer_rel = relations(offer, ({ one }) => ({
  created_by: one(users, {
    fields: [offer.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_policy_rel = relations(policy, ({ one }) => ({
  created_by: one(users, {
    fields: [policy.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_tender_rel = relations(tender, ({ one }) => ({
  created_by: one(users, {
    fields: [tender.created_by],
    references: [users.uuid],
  }),
}));

export default portfolio;
