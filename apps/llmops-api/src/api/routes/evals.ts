import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { withTenant } from '../../db/index.js';
import { settings } from '../../config/settings.js';
import { randomUUID } from 'node:crypto';

interface EvalBody {
  tenant_id?:     string;
  suite_id:       string;
  target_type:    string;    // prompt|agent|model
  target_id:      string;
  target_version?: string;
  output_to_eval: string;    // the model output being evaluated
  golden_cases?:  unknown[];
}

interface HallucinationBody {
  tenant_id?:     string;
  output:         string;
  sources?:       string[];
  agent_id?:      string;
}

interface RegressionBody {
  tenant_id?:   string;
  suite_id:     string;
  target_id:    string;
  target_version: string;
  baseline_run_id?: string;
}

function quickEval(output: string): { pass_rate: number; status: string; failed_cases: unknown[] } {
  // Lightweight heuristic eval — production would call an eval service
  const issues: string[] = [];
  if (output.length < 10)            issues.push({ case_id: 'min-length', reason: 'output too short' } as unknown as string);
  if (/TODO|FIXME|PLACEHOLDER/i.test(output)) issues.push({ case_id: 'placeholder', reason: 'contains placeholder text' } as unknown as string);
  const pass_rate = issues.length === 0 ? 1.0 : Math.max(0, 1 - issues.length * 0.25);
  return { pass_rate, status: pass_rate >= 0.8 ? 'pass' : pass_rate >= 0.5 ? 'warning' : 'fail', failed_cases: issues };
}

export async function evalsRoutes(app: FastifyInstance) {
  // GET /evals — list eval runs. Powers the Console LLM Ops page (empty until evals run).
  app.get('/evals', async (req: FastifyRequest, reply: FastifyReply) => {
    const q   = req.query as { tenant_id?: string };
    const tid = q.tenant_id ?? settings.TENANT_ID_DEFAULT;
    const rows = await withTenant(tid, async (client) => {
      const r = await client.query(
        `SELECT eval_run_id, suite_id, target_type, target_id, status, pass_rate, created_at
           FROM llmops.eval_results
          WHERE tenant_id=$1
          ORDER BY created_at DESC LIMIT 200`,
        [tid],
      );
      return r.rows;
    });
    return reply.code(200).send({ success: true, data: rows });
  });

  // POST /evals/evaluate — evaluate_output
  app.post('/evals/evaluate', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as EvalBody;
    const tid  = body.tenant_id ?? settings.TENANT_ID_DEFAULT;

    if (!body.suite_id || !body.target_type || !body.target_id || body.output_to_eval == null) {
      return reply.code(400).send({ error: 'suite_id, target_type, target_id, output_to_eval required' });
    }

    const { pass_rate, status, failed_cases } = quickEval(body.output_to_eval);
    const evalRunId = `eval-${randomUUID()}`;

    const row = await withTenant(tid, async (client) => {
      const r = await client.query(
        `INSERT INTO llmops.eval_results
           (tenant_id, eval_run_id, suite_id, target_type, target_id, target_version, status, pass_rate, failed_cases)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, eval_run_id, suite_id, status, pass_rate, created_at`,
        [tid, evalRunId, body.suite_id, body.target_type, body.target_id,
         body.target_version ?? null, status, pass_rate, JSON.stringify(failed_cases)],
      );
      return r.rows[0];
    });

    return reply.code(201).send({ success: true, data: { ...row, failed_cases } });
  });

  // GET /evals/:id — get eval result
  app.get('/evals/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const q      = req.query as { tenant_id?: string };
    const tid    = q.tenant_id ?? settings.TENANT_ID_DEFAULT;

    const row = await withTenant(tid, async (client) => {
      const r = await client.query(
        `SELECT * FROM llmops.eval_results WHERE tenant_id=$1 AND eval_run_id=$2`,
        [tid, id],
      );
      return r.rows[0] ?? null;
    });

    if (!row) return reply.code(404).send({ error: 'Eval result not found' });
    return reply.code(200).send({ success: true, data: row });
  });

  // POST /evals/hallucination — detect_hallucination
  app.post('/evals/hallucination', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as HallucinationBody;
    if (!body.output) return reply.code(400).send({ error: 'output required' });

    // Heuristic grounding check — production would use embedding similarity
    const hasUncitedClaims = /\b(studies show|research confirms|experts agree)\b/i.test(body.output)
      && (!body.sources || body.sources.length === 0);

    const suspiciousPatterns = [
      /\d{4}.*published/i,
      /according to.*report/i,
    ];
    const flags = suspiciousPatterns
      .filter((p) => p.test(body.output))
      .map((p) => ({ pattern: p.source, description: 'uncited claim detected' }));

    const verdict = flags.length > 0 || hasUncitedClaims ? 'warning' : 'pass';

    return reply.code(200).send({
      success: true,
      data: {
        verdict,
        has_uncited_claims: hasUncitedClaims,
        flags,
        sources_provided: (body.sources ?? []).length,
        recommendation: verdict === 'warning'
          ? 'Add citations or use tools with source grounding'
          : 'Output appears grounded',
      },
    });
  });

  // POST /evals/regression — run_regression_eval
  app.post('/evals/regression', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as RegressionBody;
    const tid  = body.tenant_id ?? settings.TENANT_ID_DEFAULT;

    if (!body.suite_id || !body.target_id || !body.target_version) {
      return reply.code(400).send({ error: 'suite_id, target_id, target_version required' });
    }

    // Fetch latest prior eval for comparison
    const baseline = await withTenant(tid, async (client) => {
      const r = await client.query(
        `SELECT * FROM llmops.eval_results
         WHERE tenant_id=$1 AND suite_id=$2 AND target_id=$3
           AND ($4::text IS NULL OR eval_run_id=$4)
         ORDER BY created_at DESC LIMIT 1`,
        [tid, body.suite_id, body.target_id, body.baseline_run_id ?? null],
      );
      return r.rows[0] ?? null;
    });

    return reply.code(200).send({
      success: true,
      data: {
        suite_id:       body.suite_id,
        target_id:      body.target_id,
        target_version: body.target_version,
        baseline:       baseline,
        regression_detected: false,     // would compare actual runs in production
        recommendation: 'Run evaluate_output with current version to compare',
      },
    });
  });
}
