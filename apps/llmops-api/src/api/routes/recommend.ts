// HOTFIX-15: Compose-fan-out recommend endpoint
//
// Returns prompts + models + eval_suites + guardrails that match a given
// task_type / task_summary so the orchestrator's compose_learning_recommend
// can surface LLMOps content alongside other MCP recommendations.

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { withTenant } from '../../db/index.js';

interface RecommendBody {
  task_type?: string;
  task_summary?: string;
  tenantId?: string;
  tenant_id?: string;
  limit?: number;
}

const TASK_TYPE_ALIASES: Record<string, string[]> = {
  requirements_analysis: ['feature', 'new_service'],
  design: ['feature', 'refactor'],
  architecture: ['feature', 'refactor', 'new_service'],
  code_gen: ['feature', 'api_change'],
  implementation: ['feature', 'api_change'],
  test_strategy: ['test_improvement', 'feature'],
  test_plan: ['test_improvement', 'feature'],
  testing: ['test_improvement'],
  runbook: ['debug', 'security_review'],
  ops: ['debug', 'security_review'],
  operations: ['debug', 'security_review'],
};

function expandTaskTypes(taskType: string, summary?: string): string[] {
  const out = new Set<string>([taskType]);
  (TASK_TYPE_ALIASES[taskType] ?? []).forEach((t) => out.add(t));
  if (summary) {
    const s = summary.toLowerCase();
    if (/\b(prompt|system\s*prompt)\b/.test(s)) out.add('mission_compile');
    if (/\b(eval|gold|regression)\b/.test(s)) out.add('regression');
    if (/\b(model|llm|claude|gpt|haiku|sonnet)\b/.test(s)) out.add('model_selection');
    if (/\b(pii|secret|guardrail|redact|dlp)\b/.test(s)) out.add('guardrail');
  }
  return Array.from(out);
}

export async function recommendRoutes(app: FastifyInstance) {
  // POST /api/v1/recommend — orchestrator compose fan-out hook
  app.post('/api/v1/recommend', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = (req.body ?? {}) as RecommendBody;
    const tenantId = body.tenantId ?? body.tenant_id ?? 'default';
    const taskType = (body.task_type ?? '').toString();
    const expanded = expandTaskTypes(taskType, body.task_summary);
    const limit = Math.min(Math.max(body.limit ?? 5, 1), 50);

    // Use the default tenant UUID when caller passes the slug 'default'
    const tenantUuid = /^[0-9a-f-]{36}$/i.test(tenantId)
      ? tenantId
      : '00000000-0000-0000-0000-000000000100';

    try {
      const [promptsRes, modelsRes, evalRes, guardrailRes] = await withTenant(tenantUuid, async (client) => {
        const p = await client.query(
          `SELECT prompt_id, name, version, task_types, model_binding, status
             FROM llmops.prompts
             WHERE status = 'active'
               AND (task_types && $1::text[])
             ORDER BY created_at DESC
             LIMIT $2`,
          [expanded, limit],
        ).catch(() => ({ rows: [] as any[] }));
        const m = await client.query(
          `SELECT model_id, provider, capability, context_window, cost_tier, latency_tier, status
             FROM llmops.model_registry
             WHERE status = 'active'
             ORDER BY cost_tier DESC
             LIMIT $1`,
          [limit],
        ).catch(() => ({ rows: [] as any[] }));
        const e = await client.query(
          `SELECT id, slug, title, frontmatter FROM llmops.synced_content
             WHERE type = 'eval-suite' AND (status IS NULL OR status != 'deprecated')
             ORDER BY ingested_at DESC LIMIT $1`,
          [limit],
        ).catch(() => ({ rows: [] as any[] }));
        const g = await client.query(
          `SELECT id, slug, title, frontmatter FROM llmops.synced_content
             WHERE type = 'guardrail' AND (status IS NULL OR status != 'deprecated')
             ORDER BY ingested_at DESC LIMIT $1`,
          [limit],
        ).catch(() => ({ rows: [] as any[] }));
        return [p, m, e, g];
      });

      return reply.code(200).send({
        success: true,
        data: {
          prompts: promptsRes.rows,
          models: modelsRes.rows,
          eval_suites: evalRes.rows,
          guardrails: guardrailRes.rows,
          // Echo so the agent knows what was matched
          task_type: taskType,
          expanded_task_types: expanded,
          tenant_id: tenantId,
        },
      });
    } catch (err) {
      app.log.error({ err }, '[llmops] /api/v1/recommend failed');
      return reply.code(200).send({
        success: true,
        data: {
          prompts: [],
          models: [],
          eval_suites: [],
          guardrails: [],
          degraded: true,
          error: (err as Error).message,
        },
      });
    }
  });
}
