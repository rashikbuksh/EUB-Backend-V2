import * as hr from './hr/schema';
import * as inquire from './inquire/schema';
import * as portfolio from './portfolio/schema';
import * as procure from './procure/schema';

const schema = {
  ...portfolio,
  ...hr,
  ...inquire,
  ...procure,
};

export type Schema = typeof schema;

export default schema;
