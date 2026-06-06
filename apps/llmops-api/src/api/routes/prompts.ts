import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { withTenant } from '../../db/index.js';
import { settings } from '../../config/settings.js';

interface PromptBody {
  prompt_id: string;
  version: string;
  name: string;
  task_types: string[];
  model_binding?: string;
  token_budget_hint?: number;
  content_path: string;
  status?: string;
  created_by?: string;
}

interface PromptParams { id: string }
interface PromptQuery  { version?: string; tenant_id?: string }

function tenantId(req: FastifyRequest): string {
  const query = req.query as PromptQuery;
  return query.tenant_id ?? settings.TENANT_ID_DEFAULT;
}

export async function promptRoutes(app: FastifyInstance) {
  // POST /prompts — register_prompt (immutable: new row per version)
  app.post('/prompts', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as PromptBody;
    const tid  = tenantId(req);

    if (!body.prompt_id || !body.version || !body.name || !body.content_path) {
      return reply.code(400).send({ error: 'prompt_id, version, name, content_path required' });
    }

    const row = await withTenant(tid, async (client) => {
      const r = await client.query(
        `INSERT INTO llmops.prompts
           (tenant_id, prompt_id, version, name, task_types, model_binding,
            token_budget_hint, content_path, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id, prompt_id, version, status, created_at`,
        [tid, body.prompt_id, body.version, body.name,
         body.task_types ?? [], body.model_binding ?? null,
         body.token_budget_hint ?? null, body.content_path,
         body.status ?? 'draft', body.created_by ?? null],
      );
      return r.rows[0];
    });

    return reply.code(201).send({ success: true, data: row });
  });

  // GET /prompts — list_prompts (latest version per prompt_id). Powers the Console LLM Ops page.
  app.get('/prompts', async (req: FastifyRequest, reply: FastifyReply) => {
    const tid = tenantId(req);
    const rows = await withTenant(tid, async (client) => {
      const r = await client.query(
        `SELECT DISTINCT ON (prompt_id)
                prompt_id, name, version, task_types, status, model_binding, created_at
           FROM llmops.prompts
          WHERE tenant_id=$1
          ORDER BY prompt_id, created_at DESC`,
        [tid],
      );
      return r.rows;
    });
    return reply.code(200).send({ success: true, data: rows });
  });

  // GET /prompts/:id — get_prompt
  app.get('/prompts/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id }    = req.params as PromptParams;
    const q         = req.query  as PromptQuery;
    const tid       = tenantId(req);
    const ver       = q.version ?? 'latest';

    const row = await withTenant(tid, async (client) => {
      if (ver === 'latest') {
        const r = await client.query(
          `SELECT * FROM llmops.prompts
           WHERE tenant_id=$1 AND prompt_id=$2 AND status='active'
           ORDER BY created_at DESC LIMIT 1`,
          [tid, id],
        );
        return r.rows[0] ?? null;
      }
      const r = await client.query(
        `SELECT * FROM llmops.prompts
         WHERE tenant_id=$1 AND prompt_id=$2 AND version=$3`,
        [tid, id, ver],
      );
      return r.rows[0] ?? null;
    });

    if (!row) return reply.code(404).send({ error: 'Prompt not found' });
    return reply.code(200).send({ success: true, data: row });
  });

  // GET /prompts/:id/versions — list all versions
  app.get('/prompts/:id/versions', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as PromptParams;
    const tid    = tenantId(req);

    const rows = await withTenant(tid, async (client) => {
      const r = await client.query(
        `SELECT prompt_id, version, status, created_at FROM llmops.prompts
         WHERE tenant_id=$1 AND prompt_id=$2 ORDER BY created_at DESC`,
        [tid, id],
      );
      return r.rows;
    });

    return reply.code(200).send({ success: true, data: rows });
  });
}
