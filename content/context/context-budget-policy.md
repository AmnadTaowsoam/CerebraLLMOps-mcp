# Context Budget Policy

**Standard ID:** STD-LLMOPS-CONTEXT-BUDGET-001
**Category:** llmops/context
**Priority:** high
**Applies To:** all LLM context preparation
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the default context budgets per risk level. Context budget controls how much information is fetched from Knowledge (documents), CodeGraph (code nodes), and GraphLayer (graph nodes) before constructing the LLM input. This matches spec §11.1 exactly.

---

## 2. Default Budgets by Risk Level

| risk_level | max_documents | max_code_nodes | max_graph_nodes | max_input_tokens | max_output_tokens |
|-----------|-------------|--------------|----------------|-----------------|------------------|
| `low` | 3 | 0 | 5 | 8,000 | 2,000 |
| `medium` | 8 | 5 | 15 | 16,000 | 4,000 |
| `high` | 15 | 15 | 30 | 32,000 | 8,000 |
| `critical` | 25 | 30 | 50 | 64,000 | 16,000 |

> **Spec reference:** These values match §11.1 of the CerebraLLMOps spec. Changes require a spec amendment and platform owner approval.

---

## 3. Budget Component Definitions

### `max_documents`
Maximum number of Knowledge base documents (from CerebraKnowledge-mcp) that may be included in context. Each document is counted as one unit regardless of its internal length (documents are pre-chunked to ≤ 2,000 tokens each).

### `max_code_nodes`
Maximum number of CodeGraph nodes (functions, classes, files) from CerebraCodeGraph-mcp that may be included in context. A code node typically contains 200–500 tokens.

### `max_graph_nodes`
Maximum number of GraphLayer nodes (standards, skills, roles, relationships) from CerebraGraphLayer that may be included as context. A graph node description is typically 100–300 tokens.

### `max_input_tokens`
Hard limit on total input tokens for the LLM call. If the assembled context exceeds this limit, compression is triggered (see `context-compression-policy.md`) or the lowest-priority context items are dropped.

### `max_output_tokens`
Maximum tokens the model may generate in its response. Higher limits increase cost; these defaults are conservative.

---

## 4. Context Assembly Priority

When context is assembled and the budget is at risk of being exceeded, items are prioritized in this order:

1. System prompt (never truncated)
2. Task description + user input (never truncated)
3. High-relevance graph nodes (Standards, security rules for the task)
4. High-relevance knowledge documents (top matches from RAG)
5. Medium-relevance code nodes (files directly touched by the task)
6. Lower-relevance knowledge documents
7. Lower-relevance graph nodes
8. Background code context (callers/callees)

If after priority-ordered assembly the budget is still exceeded, compression is applied to lower-priority items before truncation.

---

## 5. Per-Tenant Budget Overrides

The platform owner may set per-tenant budget multipliers for tenants with special needs:

```json
{
  "tenant_id": "enterprise-client-a",
  "context_budget_multiplier": 1.5,  // increases all budgets by 50%
  "effective_from": "2026-06-01"
}
```

Multipliers are capped at 2.0 (no tenant may use more than 2× the default budget).

---

## 6. Budget Enforcement

Budget limits are enforced at two points:

1. **Pre-call (soft):** LLMOps estimates the assembled context size. If it exceeds budget, compression triggers automatically.
2. **At-call (hard):** The `max_input_tokens` and `max_output_tokens` are sent as API parameters. The model cannot exceed these limits even if the assembled context is within them.

If context assembly produces more items than allowed by `max_documents`, `max_code_nodes`, or `max_graph_nodes`, the excess items are dropped (lowest relevance score first).

---

## 7. Context Budget Monitoring

The observability dashboard tracks per-agent and per-task-type average context usage:

- `avg_documents_used` vs `max_documents`
- `avg_input_tokens_used` vs `max_input_tokens`
- `context_budget_hit_rate` — percentage of runs that hit a budget limit

If `context_budget_hit_rate > 20%` for a specific agent, a budget review is triggered.

---

## Related Documents

- `context-compression-policy.md` — How to reduce context when budget is tight
- `rag-context-policy.md` — Knowledge document selection
- `sensitive-context-policy.md` — What must never enter context
- `llmops-context-package-schema.md` — How budgets are communicated to Orchestrator

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — budgets matching spec §11.1 |
