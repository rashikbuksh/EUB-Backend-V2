import { createRouter } from '@/lib/create_app';

import * as handlers from './handlers';
import * as routes from './routes';

const router = createRouter()
  .openapi(routes.itemOpeningClosingStock, handlers.itemOpeningClosingStock);

export default router;
