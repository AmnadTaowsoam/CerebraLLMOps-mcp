# Model Routing Policy

**Standard ID:** STD-LLMOPS-MODEL-ROUTING-001
**Category:** llmops/models
**Priority:** critical
**Applies To:** all LLM call routing decisions
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the decision matrix for selecting a model given a task type and risk level. This policy is the backing logic for `llmops_get_model_routing_decision`. Changes to this policy require platform owner approval and a model change readiness checklist.

---

## 2. Decision Matrix: task_type × risk_level → model_id

This matches spec §10.2.

| task_type | low risk | medium risk | high risk | critical risk |
|-----------|---------|------------|----------|--------------|
| `skills_retrieval` | haiku-3-5 | haiku-3-5 | sonnet-4-5 | sonnet-4-5 |
| `knowledge_retrieval` | haiku-3-5 | sonnet-4-5 | sonnet-4-5 | sonnet-4-5 |
| `rag_grounding` | haiku-3-5 | sonnet-4-5 | sonnet-4-5 | opus-4 |
| `standards_check` | haiku-3-5 | haiku-3-5 | sonnet-4-5 | sonnet-4-5 |
| `compose_learning` | sonnet-4-5 | sonnet-4-5 | sonnet-4-5 | opus-4 |
| `multi_mcp_coordination` | sonnet-4-5 | sonnet-4-5 | opus-4 | opus-4 |
| `code_generation` | sonnet-4-5 | sonnet-4-5 | opus-4 | opus-4 |
| `code_review` | sonnet-4-5 | sonnet-4-5 | opus-4 | opus-4 |
| `impact_analysis` | sonnet-4-5 | sonnet-4-5 | opus-4 | opus-4 |
| `debug` | sonnet-4-5 | sonnet-4-5 | opus-4 | opus-4 |
| `root_cause_analysis` | sonnet-4-5 | opus-4 | opus-4 | opus-4 |
| `review` | sonnet-4-5 | sonnet-4-5 | opus-4 | opus-4 |
| `proposal_evaluation` | sonnet-4-5 | sonnet-4-5 | opus-4 | opus-4 |
| `test_planning` | haiku-3-5 | sonnet-4-5 | sonnet-4-5 | sonnet-4-5 |
| `regression_risk` | haiku-3-5 | sonnet-4-5 | sonnet-4-5 | opus-4 |
| `security_analysis` | sonnet-4-5 | opus-4 | opus-4 | opus-4 |
| `policy_check` | haiku-3-5 | sonnet-4-5 | opus-4 | opus-4 |
| `deployment` | sonnet-4-5 | opus-4 | opus-4 | opus-4 |
| `env_validation` | haiku-3-5 | sonnet-4-5 | sonnet-4-5 | opus-4 |
| `agent_instruction_change` | — | sonnet-4-5 | opus-4 | opus-4 |
| `graph_lookup` | haiku-3-5 | haiku-3-5 | sonnet-4-5 | sonnet-4-5 |
| `graph_node_registration` | haiku-3-5 | sonnet-4-5 | opus-4 | opus-4 |
| `emergency_override` | — | — | opus-4 | opus-4 |

**Model IDs:** `haiku-3-5` = `claude-haiku-3-5`, `sonnet-4-5` = `claude-sonnet-4-5`, `opus-4` = `claude-opus-4`

---

## 3. Routing Rules

### Rule R-1: Risk Escalation Always Wins

If runtime risk escalation signals are detected (PII in context, multi-tenant data, production target), the risk level is escalated to `critical` regardless of the declared task risk. The model selection follows the escalated risk level.

### Rule R-2: Cost Constraint Override

If a tenant has insufficient budget for the selected model:
1. LLMOps checks if the next-lower cost tier model has sufficient capability for the task
2. If yes → route to lower-cost model (log the downgrade with reason)
3. If no → block the call and return `BUDGET_EXCEEDED` error with `estimated_cost` and `budget_remaining`

Cost constraint override may NOT be applied to `critical` risk tasks — those always use `opus-4`.

### Rule R-3: Offline/Degraded Mode

If Anthropic API is unavailable:
1. Attempt fallback to next model in the fallback chain
2. For `low` risk tasks: may use `ollama/llama-3.1-8b` as a degraded fallback
3. For `medium` risk tasks: may use `ollama/llama-3.1-8b` with a warning in the output
4. For `high/critical` risk tasks: **do NOT use ollama fallback** — block and return degraded mode error
5. All degraded fallbacks are logged and trigger a `service_degraded` alert

### Rule R-4: Model Not Available

If the selected model is unavailable (rate limit, API error):
1. Wait for one retry (5-second exponential backoff)
2. If still unavailable → trigger fallback chain (see `model-fallback-policy.md`)
3. Log the fallback in the trace (`fallback_triggered: true`, `fallback_reason: "rate_limit|api_error|timeout"`)

---

## 4. Routing Decision Audit

Every routing decision is recorded with:
- `task_type`
- `risk_level` (declared)
- `effective_risk_level` (after runtime escalation)
- `selected_model_id`
- `routing_reason` (rule applied)
- `cost_constraint_applied` (boolean)
- `fallback_triggered` (boolean)
- `timestamp`

---

## 5. Policy Change Process

Changes to this routing matrix require:
1. Submit routing policy change proposal via Orchestrator proposal workflow
2. Impact analysis: which task types/agents are affected?
3. Cost impact estimate: what is the cost delta?
4. Platform owner approval
5. 24-hour soak period in shadow mode (new routing logged but old routing used)
6. If shadow mode results acceptable: activate new routing
7. Model change readiness checklist: `content/quality-gates/model-change-readiness-checklist.md`

---

## Related Documents

- `model-registry.md` — Available models with capabilities and cost tiers
- `model-selection-matrix.md` — Per-task detailed routing reasoning
- `model-fallback-policy.md` — Fallback chain and triggers
- `model-cost-latency-profile.md` — Cost estimates per model
- `content/quality-gates/model-change-readiness-checklist.md` — 8-item gate for changes

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — full decision matrix |
