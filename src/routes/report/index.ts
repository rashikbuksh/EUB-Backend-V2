import absent_report from './absent_report';
import attendance_report from './attendance_report';
import fde from './fde';
// import dashboard from './dashboard';
import field_visit_report from './field_visit_report';
import late_report from './late_report';
import leave_report from './leave_report';
import procure from './procure';
import report_send_to_email from './report_send_to_email';
import salary_report from './salary_report';
import working_hour_report from './working_hour_report';

const report = [
  ...procure,
  ...fde,
  absent_report,
  attendance_report,
  // ...dashboard,
  field_visit_report,
  late_report,
  leave_report,
  report_send_to_email,
  salary_report,
  working_hour_report,
];

export default report;
