import getParamsSchema from "stoker/openapi/schemas/get-params-schema";

const uuid = getParamsSchema({
  name: "uuid",
  validator: "nanoid",
});

export { uuid };
