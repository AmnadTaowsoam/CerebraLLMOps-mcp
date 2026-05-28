# Latency Tracking Standard

**Standard ID:** STD-LLMOPS-LATENCY-TRACK-001
**Category:** llmops/observability
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp

## 1. SLO Targets by Risk Level

| Risk Level | p50 SLO | p95 SLO | p99 SLO | Max Allowed |
|-----------|---------|---------|---------|------------|
| `low` | 1,000ms | 3,000ms | 5,000ms | 10,000ms |
| `medium` | 3,000ms | 8,000ms | 15,000ms | 30,000ms |
| `high` | 5,000ms | 15,000ms | 30,000ms | 60,000ms |
| `critical` | 8,000ms | 25,000ms | 45,000ms | 120,000ms |

> **Note:** These are end-to-end latencies including context assembly, LLM call, and eval.

---

## 2. Latency Components

Each trace records:

| Component | Field | Description |
|-----------|-------|-------------|
| Context assembly | `latency_context_ms` | Time to fetch documents + graph nodes |
| Sensitive context scan | `latency_scan_ms` | Pre-call guardrail scan |
| LLM call (total) | `latency_ms` | Full call from request to complete response |
| Time to first token | `latency_ttft_ms` | For streaming calls |
| Eval execution | `latency_eval_ms` | If automated eval runs after |
| Total end-to-end | `latency_total_ms` | Sum of all components |

---

## 3. Latency Alerting Rules

| Alert | Trigger | Severity |
|-------|---------|---------|
| `latency_slo_breach_p95` | Any single run exceeds the p95 SLO for its risk level | Medium |
| `latency_slo_breach_max` | Any single run exceeds the Max Allowed for its risk level | High |
| `latency_slo_sustained_breach` | p95 latency exceeds SLO for > 10 runs in a 1-hour window | Critical |
| `latency_spike` | Current run latency > 3× the agent's rolling p50 | Medium |
| `model_timeout` | Any single LLM call exceeds 60,000ms | High |
| `context_assembly_slow` | Context assembly takes > 5,000ms | Low (investigation) |

---

## 4. Latency SLO Monitoring

The latency dashboard (see `dashboard-metrics.md`) shows:

- Real-time p50/p95/p99 per agent per hour
- SLO breach rate (% of runs exceeding p95 target)
- Latency trend over 7 days
- Breakdown of latency by component (context vs. LLM vs. eval)
- Model latency comparison (which model is fastest for this task type)

---

## 5. Streaming for High-Latency Models

For `claude-opus-4` (high latency tier), streaming is recommended for tasks with human-visible output:

- Set `streaming: true` in the LLM call
- Record `latency_ttft_ms` (time to first token) separately from `latency_ms` (full response)
- TTFT target: < 1,000ms even for opus-4

Streaming does not reduce total latency but significantly improves user-perceived responsiveness.

---

## 6. Latency Regression Detection

When a new model routing change or prompt version is deployed:
1. Shadow mode runs for 24 hours (new routing used, results logged but not served)
2. Latency metrics in shadow mode are compared to production baseline
3. If shadow p95 is > 20% higher than production → flag for investigation before activation
4. Shadow mode results are stored in `llmops.shadow_mode_traces`

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — SLO targets + alerting rules |
