import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import { buildApp } from './app.js';

/**
 * Local development entrypoint.
 *
 * On Vercel this file is not used — api/index.ts wraps buildApp() in a
 * serverless function and the CDN serves the SPA.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5178;

const app = await buildApp();

const webDist = path.resolve(here, '../../web/dist');
if (existsSync(webDist)) {
  await app.register(fastifyStatic, { root: webDist });
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api')) return reply.code(404).send({ error: 'Not found' });
    return reply.sendFile('index.html');
  });
}

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
