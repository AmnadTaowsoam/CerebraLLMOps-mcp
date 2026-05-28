# Evaluation Strategy

**Standard ID:** STD-LLMOPS-EVAL-STRATEGY-001
**Category:** llmops/evaluation
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the overall evaluation philosophy for CerebraLLMOps-mcp. Every managed agent run is evaluated at some level. The depth of evaluation scales with risk level and change type.

---

## 2. Evaluation Philosophy

### 2.1 Evaluate Everything, Proportionally

- **Every run:** At minimum, schema validation (does the output match the declared structure?)
- **Medium/high risk runs:** Automated behavioral eval (does the output comply with standards and agent policy?)
- **Critical risk runs:** Automated + human eval (machine checks + human sign-off)
- **Every version change:** Regression eval (does the new version perform at least as well as the old?)

### 2.2 Eval Is Not Optional for High-Risk Tasks

Skipping eval on high or critical risk tasks is a policy violation. The LLMOps service blocks delivery of high-risk outputs until eval is complete.

### 2.3 Eval Results Feed the Improvement Loop

Every eval failure is a signal, not just a failure to fix and forget. Eval failures are ingested by the feedback loop and contribute to the failure pattern registry. Patterns trigger improvement proposals.

### 2.4 Eval Pass Threshold Is a Floor, Not a Target

80% pass rate is the minimum — not a goal. Well-maintained prompts and agent instructions should achieve >95%. A sustained 80–85% rate indicates something needs attention.

---

## 3. Evaluation Types

### 3.1 Schema Validation (Every Run)

- **What:** Validate output against declared `output_schema` (JSON Schema)
- **When:** Immediately after LLM response received
- **Blocking:** YES — invalid schema blocks delivery
- **Retry:** Retry once with explicit schema prompt; escalate if still invalid
- **Cost:** Negligible (local validation, no LLM needed)

### 3.2 Automated Behavioral Eval (Medium/High Risk)

- **What:** Run output through the agent's bound eval suite assertions
- **When:** After schema validation passes
- **Blocking:** For high/critical: YES. For medium: NO (warning logged)
- **Retry:** No — eval is for scoring, not for re-running the task
- **Cost:** Minimal (assertion evaluation only)

### 3.3 Regression Eval (Version Changes)

- **What:** Run the full golden case set against the new version
- **When:** At promotion time (review → active)
- **Blocking:** YES — promotion blocked if below threshold
- **Cost:** Proportional to number of golden cases × model cost

### 3.4 Human Eval (Critical Risk)

- **What:** Human reviewer signs off on the output before it is acted upon
- **When:** After automated eval passes for critical-risk tasks
- **Blocking:** YES — output cannot be acted upon until reviewed
- **SLA:** 30 minutes (business hours), 2 hours (off-hours)
- **Cost:** Human time

### 3.5 Periodic Baseline Eval (Weekly)

- **What:** Run a sample of historical inputs against current agent + prompt
- **When:** Weekly, scheduled
- **Blocking:** NO — for trend monitoring only
- **Cost:** Proportional to sample size

---

## 4. Eval Suite Types

| Suite Type | Purpose | Typical Size |
|-----------|---------|------------|
| `agent-eval-suite` | Agent behavior compliance | 10–20 cases |
| `prompt-eval-suite` | Prompt quality + injection resistance | 10–15 cases |
| `hallucination-eval-suite` | Grounding and source citation | 8–12 cases |
| `regression-eval-suite` | Baseline golden cases across task types | 20 cases |
| `security-eval-suite` | Security policy compliance | 10–15 cases |

---

## 5. Eval Timing Summary

| Eval Type | Trigger | Blocking? | Who Runs It |
|-----------|---------|----------|------------|
| Schema validation | Every run, post-response | YES | LLMOps service |
| Automated behavioral | Medium/High risk runs | HIGH: YES, MEDIUM: NO | LLMOps service |
| Regression | Every promotion | YES | LLMOps service |
| Human review | Critical risk runs | YES | Designated reviewer |
| Periodic baseline | Weekly schedule | NO | LLMOps service (scheduled) |
| On-demand | Requested by platform owner | NO | LLMOps service |

---

## 6. Eval Infrastructure

Phase 2 implementation will provide:
- `llmops_evaluate_output` tool — submit output + suite_id → get eval result
- `llmops_list_eval_suites` tool — list available suites
- Eval results stored in `llmops.eval_results` table (Postgres)
- Eval results queryable by run_id, agent_id, suite_id, date range
- Eval trend dashboard (see `dashboard-metrics.md`)

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
