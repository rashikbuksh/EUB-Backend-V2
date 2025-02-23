import env from '@/env';
import { apiReference } from '@scalar/hono-api-reference';

import type { AppOpenAPI } from './types';

import packageJSON from '../../package.json' with { type: 'json' };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      title: packageJSON.name,
      description: 'EUB API Documentation',
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
      layout: 'modern', // modern, classic
      defaultHttpClient: {
        targetKey: 'javascript',
        clientKey: 'fetch',
      },
      spec: {
        url: '/doc',
      },
      hideDownloadButton: true,
      hiddenClients: true,
    }),
  );
}
