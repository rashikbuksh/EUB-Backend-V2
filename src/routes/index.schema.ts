import * as fde from './fde/schema';
import * as hr from './hr/schema';
import * as inquire from './inquire/schema';
import * as journal from './journal/schema';
import * as lib from './lib/schema';
import * as portfolio from './portfolio/schema';
import * as procure from './procure/schema';

const schema = {
  ...portfolio,
  ...hr,
  ...inquire,
  ...procure,
  ...lib,
  ...fde,
  ...journal,
};

export type Schema = typeof schema;

export default schema;
