import { createRouter } from '@/lib/create_app';

import * as handlers from './handlers';
import * as routes from './routes';

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.getItemDetailsByItemUuid, handlers.getItemDetailsByItemUuid)
  .openapi(routes.getItemByVendorUuid, handlers.getItemByVendorUuid);

export default router;
