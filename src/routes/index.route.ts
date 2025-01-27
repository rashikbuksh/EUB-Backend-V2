import hr from './hr';
import portfolio from './portfolio';

const routes = [
  ...hr,
  ...portfolio,
] as const;

export default routes;
