import hr from './hr';
import inquire from './inquire';
import other from './other';
import portfolio from './portfolio';
import procure from './procure';

const routes = [
  ...hr,
  ...portfolio,
  ...other,
  ...inquire,
  ...procure,
] as const;

export default routes;
