# Model Cost-Latency Profile

**Standard ID:** STD-LLMOPS-MODEL-COST-001
**Category:** llmops/models
**Priority:** medium
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Documents cost estimates and latency profiles for each registered model. Used by the routing policy for cost-constraint decisions and by the cost-tracking standard for budget calculations.

---

## Cost Estimates (per 1M tokens)

| model_id | input cost | output cost | cache read cost | notes |
|---------|------------|------------|----------------|-------|
| `claude-opus-4` | $15.00 | $75.00 | $1.50 | Prompt caching reduces cost for repeated system prompts |
| `claude-sonnet-4-5` | $3.00 | $15.00 | $0.30 | Default for most medium/high tasks |
| `claude-haiku-3-5` | $0.80 | $4.00 | $0.08 | Fast and cheap for retrieval tasks |
| `ollama/llama-3.1-8b` | $0.00 | $0.00 | $0.00 | Self-hosted; GPU/CPU operational cost not tracked here |

> **Note:** Prices reflect typical API rates as of 2026-05. Actual billing depends on the Anthropic account tier. Update this table whenever rates change.

---

## Cost Formula

For each LLM trace record, cost is estimated as:

```
cost_estimate_usd =
  (input_tokens / 1_000_000 × input_cost_per_M) +
  (output_tokens / 1_000_000 × output_cost_per_M)
```

If prompt caching is active (system prompt is cached):
```
cost_estimate_usd =
  (cached_input_tokens / 1_000_000 × cache_read_cost_per_M) +
  (uncached_input_tokens / 1_000_000 × input_cost_per_M) +
  (output_tokens / 1_000_000 × output_cost_per_M)
```

---

## Per-Task Average Cost Estimates

Based on typical token usage across task types:

| task_type | typical model | avg input tokens | avg output tokens | avg cost (USD) |
|----------|-------------|-----------------|------------------|----------------|
| `skills_retrieval` | haiku-3-5 | 2,000 | 500 | $0.004 |
| `knowledge_retrieval` | sonnet-4-5 | 8,000 | 1,500 | $0.046 |
| `standards_check` | haiku-3-5 | 3,000 | 800 | $0.006 |
| `compose_learning` | sonnet-4-5 | 12,000 | 3,000 | $0.081 |
| `code_generation` | opus-4 | 16,000 | 4,000 | $0.540 |
| `security_analysis` | opus-4 | 20,000 | 5,000 | $0.675 |
| `root_cause_analysis` | opus-4 | 24,000 | 6,000 | $0.810 |
| `deployment` | opus-4 | 10,000 | 3,000 | $0.375 |
| `test_planning` | sonnet-4-5 | 6,000 | 2,000 | $0.048 |
| `review` | sonnet-4-5 | 15,000 | 4,000 | $0.105 |

---

## Latency Profiles

| model_id | p50 latency | p95 latency | p99 latency | notes |
|---------|------------|------------|------------|-------|
| `claude-haiku-3-5` | 400ms | 1,500ms | 3,000ms | Very fast; ideal for retrieval |
| `claude-sonnet-4-5` | 1,200ms | 5,000ms | 12,000ms | Balanced; acceptable for most tasks |
| `claude-opus-4` | 4,000ms | 20,000ms | 45,000ms | Slow; use streaming for UX |
| `ollama/llama-3.1-8b` | varies (500ms – 10,000ms) | varies | varies | Depends on local hardware |

> **Streaming note:** For `claude-opus-4` tasks with human-visible output, streaming (`stream: true`) is strongly recommended to improve perceived latency. The Time-to-First-Token (TTFT) is typically 300–800ms even for opus.

---

## Monthly Budget Estimates (Per Tenant, Typical Usage)

| usage_tier | primary model | estimated runs/month | estimated monthly cost |
|-----------|-------------|---------------------|----------------------|
| Light | haiku-3-5 | 5,000 | $25 |
| Standard | sonnet-4-5 | 3,000 | $200 |
| Heavy | sonnet-4-5 + opus-4 | 10,000 + 500 | $1,200 |
| Enterprise | Mix | 50,000+ | Custom |

---

## Budget Alert Thresholds

| alert_type | threshold | action |
|-----------|---------|--------|
| Daily budget 50% consumed | 50% of daily limit | Info notification |
| Daily budget 80% consumed | 80% of daily limit | Warning notification |
| Daily budget 100% consumed | 100% of daily limit | Block new runs; notify owner |
| Cost spike (>2x baseline day-over-day) | 200% of previous day | Alert on-call |
| Per-run cost exceeds $5.00 | $5 single run | Log + flag for review |

See `content/observability/cost-tracking-standard.md` for full cost tracking implementation.

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 4 models with cost and latency |
