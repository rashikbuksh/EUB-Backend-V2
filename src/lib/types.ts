import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { PinoLogger } from 'hono-pino';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export interface ColumnProps {
  default: string;
  datetime: 'created_at' | 'updated_at' | 'deadline' | 'start_date' | 'end_date' | 'date' | 'date_of_birth' | 'appointment_date' | 'resign_date' | 'published_date';
}

export interface PublicUrlProps { url: string; method: string }
