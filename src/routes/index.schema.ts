import * as hr from './hr/schema';
import * as portfolio from './portfolio/schema';

const schema = {
  ...portfolio,
  ...hr,
};

export type Schema = typeof schema;

export default schema;
