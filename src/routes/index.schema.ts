import * as hr from './hr/schema';
import * as inquire from './inquire/schema';
import * as portfolio from './portfolio/schema';

const schema = {
  ...portfolio,
  ...hr,
  ...inquire,
};

export type Schema = typeof schema;

export default schema;
