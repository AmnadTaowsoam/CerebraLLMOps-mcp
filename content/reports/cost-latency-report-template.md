# Cost-Latency Report Template

**Standard ID:** STD-LLMOPS-COST-LAT-REPORT-001
**Category:** llmops/reports
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

Monthly cost/latency breakdown by agent and model. Generated on the 1st of each month for the prior calendar month.

---

## Report Template

```markdown
# LLMOps Cost & Latency Report

**Month:** <YYYY-MM>
**Generated:** <ISO 8601>
**Tenant:** <tenant_id>

---

## Cost Summary

| Metric | Value |
|--------|-------|
| Total cost (USD) | $<value> |
| vs. Prior month | <+/- pct>% |
| vs. 3-month average | <+/- pct>% |
| Budget utilization | <pct>% |
| Cache savings (vs. no cache) | $<value> saved |
| Cache hit rate | <pct>% |

---

## Cost by Agent

| agent_id | total_cost_usd | % of total | avg_cost_per_run | runs | vs. prior_month |
|---------|--------------|-----------|-----------------|------|----------------|
| agent-orchestrator | $<v> | <pct>% | $<v> | <n> | <+/->% |
| agent-knowledge | | | | | |
| agent-security | | | | | |
| agent-debugs | | | | | |
| agent-codegraph | | | | | |
| agent-devops | | | | | |
| agent-review | | | | | |
| other agents | | | | | |
| **Total** | $<v> | 100% | $<v> | <n> | |

---

## Cost by Model

| model_id | total_cost_usd | % of total | input_tokens | output_tokens | cache_tokens |
|---------|--------------|-----------|-------------|-------------|-------------|
| claude-opus-4 | $<v> | <pct>% | <n>M | <n>M | <n>M |
| claude-sonnet-4-5 | | | | | |
| claude-haiku-3-5 | | | | | |
| ollama/llama-3.1-8b | $0.00 | 0% | <n>M | <n>M | — |

---

## Cost by Task Type

| task_type | avg_cost_per_run | runs | total_cost |
|----------|-----------------|------|-----------|
| code_generation | $<v> | <n> | $<v> |
| security_analysis | | | |
| root_cause_analysis | | | |
| knowledge_retrieval | | | |
| compose_learning | | | |
| skills_retrieval | | | |
| other | | | |

---

## Top 10 Most Expensive Runs

| rank | trace_id | agent_id | task_type | model | cost_usd | tokens |
|------|---------|---------|----------|-------|---------|--------|
| 1 | trace-... | agent-... | code_generation | opus-4 | $<v> | <n>k |
| 2 | | | | | | |
...

---

## Latency Summary

| Metric | Value | vs. SLO |
|--------|-------|--------|
| Overall p50 latency | <ms> | ✓ / ⚠ |
| Overall p95 latency | <ms> | ✓ / ⚠ |
| Overall p99 latency | <ms> | ✓ / ⚠ |
| SLO breach rate | <pct>% | target < 5% |
| Slowest task type (p95) | <task_type>: <ms> | |
| Fastest task type (p50) | <task_type>: <ms> | |

---

## Latency by Agent (p50 / p95)

| agent_id | p50_ms | p95_ms | slo_p95_ms | slo_status |
|---------|--------|--------|-----------|-----------|
| agent-orchestrator | <ms> | <ms> | <ms> | ✓ / ⚠ / ✗ |
| agent-security | | | | |
| agent-devops | | | | |
| agent-codegraph | | | | |
| agent-knowledge | | | | |
| agent-skills | | | | |

---

## Latency by Model (p50 / p95)

| model_id | p50_ms | p95_ms | streaming_enabled |
|---------|--------|--------|-----------------|
| claude-opus-4 | <ms> | <ms> | YES/NO |
| claude-sonnet-4-5 | | | |
| claude-haiku-3-5 | | | |

---

## Optimization Recommendations

*(Generated based on this month's data)*

| Recommendation | Estimated Saving | Priority |
|---------------|-----------------|---------|
| Enable prompt caching for agent-X system prompt | ~$<v>/month | high |
| Route agent-Y low-risk tasks to haiku | ~$<v>/month | medium |
| Reduce max_output_tokens for task_type Z (consistently < 50% used) | ~$<v>/month | low |

---

## Next Month Budget Recommendation

Based on current trend: **$<value>** (with 10% buffer for growth)
Current limit: **$<value>**
Recommendation: <maintain | increase to $X | decrease to $X>
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial template |
