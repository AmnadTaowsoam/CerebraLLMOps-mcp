import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { settings } from './config/settings.js';
import { logger } from './utils/logger.js';
import { initDb } from './db/index.js';
import { healthRoutes }       from './api/routes/health.js';
import { promptRoutes }       from './api/routes/prompts.js';
import { modelsRoutes }       from './api/routes/models.js';
import { tracesRoutes }       from './api/routes/traces.js';
import { evalsRoutes }        from './api/routes/evals.js';
import { feedbackRoutes }     from './api/routes/feedback.js';
import { improvementsRoutes } from './api/routes/improvements.js';
import { recommendRoutes }    from './api/routes/recommend.js';
import { mcpToolsRoute }      from './mcp/tools.js';

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    trustProxy: settings.NODE_ENV === 'production',
  } as Parameters<typeof Fastify>[0]);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: settings.CORS_ORIGINS === '*' ? true : settings.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  try {
    initDb();
    logger.info('[App] DB initialized');
  } catch (err) {
    logger.error({ err }, '[App] DB initialization failed');
    throw err;
  }

  await app.register(healthRoutes);
  await app.register(promptRoutes);
  await app.register(modelsRoutes);
  await app.register(tracesRoutes);
  await app.register(evalsRoutes);
  await app.register(feedbackRoutes);
  await app.register(improvementsRoutes);
  await app.register(recommendRoutes);
  await app.register(mcpToolsRoute);

  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: 'Not found', code: 'NOT_FOUND' });
  });

  app.setErrorHandler((err, _req, reply) => {
    logger.error({ err }, '[App] Unhandled error');
    reply.code(500).send({
      error: settings.NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message ?? String(err),
      code: 'INTERNAL_ERROR',
    });
  });

  return app;
}
