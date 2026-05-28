# LLM Observability Standard

**Standard ID:** STD-LLMOPS-OBSERVABILITY-001
**Category:** llmops/observability
**Priority:** critical
**Applies To:** all managed LLM runs
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the mandatory fields that must be recorded for every managed LLM run. Without complete trace data, cost analysis, debugging, and quality improvement are impossible.

---

## 2. Mandatory Trace Fields

Every LLM run trace MUST include all of the following fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `trace_id` | UUID | Unique identifier for this run | `trace-uuid-...` |
| `agent_id` | string | Which agent executed the run | `agent-knowledge` |
| `task_id` | string | Task this run belongs to | `task-uuid-...` |
| `tenant_id` | string | Tenant context | `default` |
| `prompt_version` | semver | Version of the prompt template used | `2.1.0` |
| `prompt_id` | string | Which prompt template | `prompt-knowledge-rag-search` |
| `model_id` | string | Actual model used (may differ if fallback triggered) | `claude-sonnet-4-5` |
| `model_requested` | string | Originally requested model | `claude-sonnet-4-5` |
| `input_tokens` | integer | Input token count | `8423` |
| `output_tokens` | integer | Output token count | `1204` |
| `cost_estimate` | float | Estimated USD cost | `0.043` |
| `latency_ms` | integer | Total call duration in ms | `2340` |
| `latency_ttft_ms` | integer | Time to first token in ms | `380` |
| `tool_calls` | string[] | List of tools called during the run | `["knowledge_search", "graph_lookup"]` |
| `tool_call_count` | integer | Total number of tool calls | `2` |
| `eval_result` | enum | `pass`, `fail`, `skip`, `pending` | `pass` |
| `eval_suite_id` | string or null | Eval suite used | `eval-suite-knowledge-rag` |
| `status` | enum | `success`, `failure`, `partial` | `success` |
| `fallback_triggered` | boolean | Whether a model fallback occurred | `false` |
| `fallback_model_id` | string or null | Model used if fallback triggered | `null` |
| `sensitive_context_detected` | boolean | Whether sensitive data was found in context | `false` |
| `context_compressed` | boolean | Whether compression was applied | `false` |
| `documents_used` | integer | Knowledge docs included in context | `5` |
| `code_nodes_used` | integer | Code graph nodes in context | `0` |
| `graph_nodes_used` | integer | Graph layer nodes in context | `8` |
| `human_review_required` | boolean | Whether human review was required | `false` |
| `human_review_completed` | boolean or null | Whether human review was completed | `null` |
| `created_at` | ISO 8601 | When the run started | `2026-05-28T10:00:00Z` |
| `completed_at` | ISO 8601 | When the run completed | `2026-05-28T10:00:02Z` |

---

## 3. Optional But Recommended Fields

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Groups related runs within one user session |
| `parent_trace_id` | string | For sub-calls spawned by another agent run |
| `mission_id` | string | Orchestrator mission this run belongs to |
| `streaming` | boolean | Whether the response was streamed |
| `cache_hit` | boolean | Whether prompt caching saved tokens |
| `cached_tokens` | integer | Number of input tokens served from cache |
| `routing_reason` | string | Why this model was selected |
| `risk_level` | enum | Effective risk level at run time |
| `guardrail_level` | enum | Guardrail level applied |
| `context_quality_impact` | enum | `none`, `low`, `medium`, `high` |

---

## 4. Recording Requirements

### When to Record

- Record MUST be created BEFORE the LLM call is initiated (with status `pending`)
- Record MUST be updated with all fields AFTER the response is received
- If the call fails at any point, the record MUST still be finalized with `status: failure`
- Partially completed runs use `status: partial`

### Recording Method (Phase 2)

Use the `llmops_record_llm_trace` tool. In Phase 1 (content-only), traces may be recorded manually or via direct DB insert.

### Data Retention

- Trace records: retained 90 days, then archived (not deleted)
- Archived traces: retained 2 years, then purged
- Sensitive trace fields (content of flagged sensitive data): NEVER stored

---

## 5. Compliance Check

The following patterns indicate an observability compliance violation:

- LLM call made without a corresponding trace record → `missing_trace` violation
- Trace record missing any mandatory field → `incomplete_trace` violation
- Trace finalized as `success` when the LLM call actually failed → `status_mismatch` violation
- Trace records sensitive data content (not just the category) → `privacy_violation`

Violations are detected by the observability monitoring job (runs every 5 minutes) and logged as alerts.

---

## Related Documents

- `token-tracking-standard.md` — Token counting details
- `cost-tracking-standard.md` — Cost formula
- `latency-tracking-standard.md` — SLO targets
- `dashboard-metrics.md` — How trace data appears in dashboards
- `schemas/llm-trace.schema.json` — Machine-readable schema

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — mandatory + optional trace fields |
