import env from '@/env';
import { apiReference } from '@scalar/hono-api-reference';

import type { AppOpenAPI } from './types';

import packageJSON from '../../package.json' with { type: 'json' };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',

    // basePath: env.SERVER_URL,

    info: {
      title: packageJSON.name,
      description: 'FZL API Documentation',
      contact: { name: 'RBR', email: 'rafsan@fortunezip.com' },
      version: packageJSON.version,
    },
    servers: [
      { url: env.SERVER_URL, description: 'Dev' },
      { url: env.SERVER_URL, description: 'Prod' },
    ],

  });

  app.get(
    '/reference',
    apiReference({
      pageTitle: packageJSON.name,
      theme: 'kepler',
      layout: 'modern',
      // layout: "classic",
      defaultHttpClient: {
        targetKey: 'javascript',
        clientKey: 'fetch',
      },
      // isEditable: true,
      spec: {
        url: '/doc',
      },
      // hideModels: true,
      // showSidebar: false,
      hideDownloadButton: true,
      // hideTestRequestButton: true,
      hiddenClients: true,
      // withDefaultFonts: true,
      authentication: {
        // customSecurity: true,
        preferredSecurityScheme: 'bearerAuth',
        securitySchemes: {
          // bearerAuth: {
          //   type: "http",
          //   description: "JWT Authorization header using the Bearer scheme. Please input without Bearer prefix",
          //   scheme: "bearer",
          //   bearerFormat: "JWT",
          //   name: "Authorization",
          //   in: "header",
          // },
          httpBearer: {
            label: 'HTTP Bearer',
            payload: {
              type: 'http',
              scheme: 'bearer',
              nameKey: 'httpBearer',
            },
          },
        },
        http: {
          basic: {
            username: 'anik',
            password: 'anik',
          },
          bearer: {
            token: 'sdjfkfj',
          },
        },

      },
      operationsSorter: 'method',

    }),
  );
}
