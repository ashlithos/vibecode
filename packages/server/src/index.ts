import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { exerciseRoutes } from './routes/exercises.js';
import { workoutRoutes } from './routes/workouts.js';
import { settingsRoutes } from './routes/settings.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5178;

const app = Fastify({
  logger: { transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } } },
});

await app.register(exerciseRoutes);
await app.register(workoutRoutes);
await app.register(settingsRoutes);

app.get('/api/health', async () => ({ ok: true }));

// In production the built SPA is served from here; in dev, Vite serves it and
// proxies /api back to this process.
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
