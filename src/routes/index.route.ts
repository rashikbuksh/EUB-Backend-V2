import hr from './hr';
import inquire from './inquire';
import other from './other';
import portfolio from './portfolio';

const routes = [
  ...hr,
  ...portfolio,
  ...other,
  ...inquire,
] as const;

export default routes;
