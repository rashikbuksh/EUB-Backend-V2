import getParamsSchema from 'stoker/openapi/schemas/get-params-schema';
import SlugParamsSchema from 'stoker/openapi/schemas/slug-params';

const uuid = getParamsSchema({
  name: 'uuid',
  validator: 'nanoid',
});

const id = getParamsSchema({
  name: 'id',
  validator: 'number', // or 'string', depending on your needs
});

const name = SlugParamsSchema;

export { id, name, uuid };
