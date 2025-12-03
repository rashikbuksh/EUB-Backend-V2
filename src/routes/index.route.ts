import fde from './fde';
import hr from './hr';
import inquire from './inquire';
import iqac from './iqac';
import journal from './journal';
import lib from './lib';
import other from './other';
import portfolio from './portfolio';
import procure from './procure';
import report from './report';

const routes = [
  ...hr,
  ...portfolio,
  ...other,
  ...inquire,
  ...procure,
  ...report,
  ...lib,
  ...fde,
  ...journal,
  ...iqac,
] as const;

export default routes;
