import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../packages/server/src/app.js';

/**
 * Vercel Function wrapping the Fastify app.
 *
 * The app is built once per cold start and reused across warm invocations —
 * rebuilding per request would re-register plugins and re-open the database on
 * every call.
 */
let appPromise: ReturnType<typeof buildApp> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = buildApp().then(async (app) => {
      // Fastify needs to be ready before its underlying server can be handed
      // a raw request.
      await app.ready();
      return app;
    });
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  app.server.emit('request', req, res);
}
