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

  // OBS-FLEET-01: Prometheus exposition so this service is scrapable (was 404 -> DOWN).
  // prom-client is not a dependency here yet; these process metrics use the same names
  // as prom-client's collectDefaultMetrics so existing Grafana runtime panels include
  // this service. Follow-up: full prom-client instrumentation (http_request_duration_seconds).
  app.get('/metrics', async (_req, reply) => {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const startTime = Date.now() / 1000 - process.uptime();
    reply.type('text/plain; version=0.0.4');
    return [
      '# HELP process_resident_memory_bytes Resident memory size in bytes.',
      '# TYPE process_resident_memory_bytes gauge',
      `process_resident_memory_bytes ${mem.rss}`,
      '# HELP nodejs_heap_size_total_bytes Process heap size from Node.js in bytes.',
      '# TYPE nodejs_heap_size_total_bytes gauge',
      `nodejs_heap_size_total_bytes ${mem.heapTotal}`,
      '# HELP nodejs_heap_size_used_bytes Process heap used from Node.js in bytes.',
      '# TYPE nodejs_heap_size_used_bytes gauge',
      `nodejs_heap_size_used_bytes ${mem.heapUsed}`,
      '# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.',
      '# TYPE process_cpu_user_seconds_total counter',
      `process_cpu_user_seconds_total ${(cpu.user / 1e6).toFixed(6)}`,
      '# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.',
      '# TYPE process_cpu_system_seconds_total counter',
      `process_cpu_system_seconds_total ${(cpu.system / 1e6).toFixed(6)}`,
      '# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.',
      '# TYPE process_start_time_seconds gauge',
      `process_start_time_seconds ${startTime.toFixed(3)}`,
      '# HELP nodejs_version_info Node.js version info.',
      '# TYPE nodejs_version_info gauge',
      `nodejs_version_info{version="${process.version}"} 1`,
      '',
    ].join('\n');
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
