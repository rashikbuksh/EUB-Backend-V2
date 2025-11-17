import { createRouter } from '@/lib/create_app';

import * as handlers from './handlers';
import * as routes from './routes';

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.SelectLateEntryDateByEmployeeUuid, handlers.selectLateEntryDateByEmployeeUuid)
  .openapi(routes.SelectEmployeePunchLogPerDayByEmployeeUuid, handlers.selectEmployeePunchLogPerDayByEmployeeUuid)
  .openapi(routes.SelectEmployeeLateDayByEmployeeUuid, handlers.selectEmployeeLateDayByEmployeeUuid);

export default router;
