import * as commercial from "./commercial/schema";
import * as hr from "./hr/schema";

const schema = {
  ...commercial,
  ...hr,
};

export type Schema = typeof schema;

export default schema;
