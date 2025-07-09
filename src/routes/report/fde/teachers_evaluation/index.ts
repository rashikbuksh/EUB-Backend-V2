import { createRouter } from '@/lib/create_app';

import * as handlers from './handlers';
import * as routes from './routes';

const router = createRouter()
  .openapi(routes.teachersEvaluationSemesterWise, handlers.teachersEvaluationSemesterWise)
  .openapi(routes.teachersEvaluationTeacherWise, handlers.teachersEvaluationTeacherWise);

export default router;
