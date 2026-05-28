# Cost Tracking Standard

**Standard ID:** STD-LLMOPS-COST-TRACK-001
**Category:** llmops/observability
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp

## 1. Cost Formula

### Basic Formula

```
cost_usd = (input_tokens / 1_000_000 × input_rate) + (output_tokens / 1_000_000 × output_rate)
```

### With Prompt Caching

```
cost_usd =
  (cache_read_tokens / 1_000_000 × cache_read_rate) +
  (uncached_input_tokens / 1_000_000 × input_rate) +
  (output_tokens / 1_000_000 × output_rate)
```

Where `uncached_input_tokens = input_tokens - cache_read_tokens`.

### Rates (see model-cost-latency-profile.md for current values)

| model_id | input_rate | output_rate | cache_read_rate |
|---------|------------|------------|----------------|
| `claude-opus-4` | 0.000015 | 0.000075 | 0.0000015 |
| `claude-sonnet-4-5` | 0.000003 | 0.000015 | 0.0000003 |
| `claude-haiku-3-5` | 0.0000008 | 0.000004 | 0.00000008 |
| `ollama/llama-3.1-8b` | 0 | 0 | 0 |

---

## 2. Cost Recording

Every trace record includes:
- `cost_estimate`: the estimated cost calculated using the formula above
- `cost_actual`: null until invoice reconciliation (optional, for billing accuracy)

Cost is stored in USD to 6 decimal places (e.g., `0.042340`).

---

## 3. Budget Alerts

| Alert | Trigger | Who Receives |
|-------|---------|-------------|
| Daily cost 50% consumed | Daily spend ≥ 50% of daily budget | Platform dashboard |
| Daily cost 80% consumed | Daily spend ≥ 80% of daily budget | Platform owner notification |
| Daily cost limit reached | Daily spend ≥ 100% of daily budget | Platform owner + block new runs |
| Cost spike | Current day > 2× the 7-day average daily spend | On-call alert |
| Single run > $5 | Any single trace with `cost_estimate > 5.00` | Log + flag for review |
| Monthly budget 90% consumed | Monthly spend ≥ 90% of monthly budget | Platform owner + urgent notification |

---

## 4. Per-Tenant Reporting

Monthly cost report (see `content/reports/cost-latency-report-template.md`) includes:

- Total cost by agent
- Total cost by model
- Total cost by task type
- Top 10 most expensive runs
- Cache efficiency (cost saved by caching vs. cost without)
- Cost trend vs. prior month
- Budget utilization %

---

## 5. Cost Optimization Recommendations

The cost tracking system generates monthly recommendations:

| Condition | Recommendation |
|-----------|---------------|
| `cache_hit_rate < 30%` | Enable prompt caching for this agent's system prompt |
| `avg_output_tokens > 80% of max_output_tokens` | Consider reducing max_output_tokens or splitting the task |
| High cost but low risk tasks on premium model | Consider routing to haiku or sonnet |
| `cost_per_successful_run > $1.00` for medium risk | Review context budget — over-fetching documents? |

---

## 6. Cost Anomaly Detection

A cost anomaly is flagged when:
1. A single day's spend is > 2× the rolling 7-day average
2. A single run costs > $5.00
3. The monthly trend shows > 20% month-over-month growth without a known cause

Anomalies are logged and appear in the `cost_anomalies` table, visible in the dashboard.

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
