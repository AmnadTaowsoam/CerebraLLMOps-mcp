# Dashboard Metrics

**Standard ID:** STD-LLMOPS-DASHBOARD-001
**Category:** llmops/observability
**Priority:** medium
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

Defines 10 metric groups for the LLMOps observability dashboard. Each group has specific KPIs, visualization types, and alert thresholds.

---

## Metric Group 1: Agent Performance

**Refresh:** Every 5 minutes

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `agent_eval_pass_rate` | Line chart (per agent, 7d) | Weighted eval pass rate over time | < 80% for 3 consecutive days |
| `agent_run_count` | Bar chart (per agent, daily) | Total runs per agent per day | > 3× baseline |
| `agent_error_rate` | Line chart | % of runs with `status=failure` | > 5% |
| `agent_escalation_rate` | Line chart | % of runs triggering human escalation | > 20% |
| `top_failing_agents` | Table | Agents with lowest eval pass rate | Any agent < 75% |

---

## Metric Group 2: Prompt Performance

**Refresh:** Every 15 minutes

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `prompt_version_adoption` | Pie chart | % of runs using each version | Old version > 10% after 7 days |
| `prompt_eval_pass_rate` | Line chart (per prompt) | Pass rate per prompt version | < 80% |
| `prompt_injection_attempts` | Counter | Detected injection attempts (from eval) | > 0 per day |
| `active_prompt_count` | Gauge | Total prompts in active state | Track for growth |

---

## Metric Group 3: Model Performance

**Refresh:** Every 5 minutes

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `model_usage_distribution` | Pie chart | % of runs per model | |
| `model_fallback_rate` | Line chart | % of runs that triggered a fallback | > 5% |
| `model_error_rate` | Line chart (per model) | API error rate per model | > 1% |
| `circuit_breaker_status` | Status indicators | Open/closed per model | Any open |

---

## Metric Group 4: Cost / Token

**Refresh:** Every 1 hour

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `daily_cost_usd` | Line chart (7d trend) | Total daily spend | > 2× 7-day average |
| `cost_by_agent` | Bar chart | Daily cost breakdown per agent | Top agent > 50% of total |
| `cost_by_model` | Bar chart | Daily cost breakdown per model | |
| `cache_hit_rate` | Line chart | % of input tokens from cache | < 30% |
| `budget_utilization` | Gauge (per tenant) | % of daily budget consumed | > 80% |
| `tokens_per_run` | Histogram | Distribution of total tokens per run | |

---

## Metric Group 5: Latency

**Refresh:** Every 5 minutes

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `latency_p50` | Line chart (per agent) | Median latency | |
| `latency_p95` | Line chart (per agent) | 95th percentile latency | > p95 SLO |
| `latency_p99` | Line chart (per agent) | 99th percentile latency | > p99 SLO |
| `slo_breach_rate` | Line chart | % of runs breaching p95 SLO | > 5% |
| `latency_by_component` | Stacked bar | Context / LLM / eval latency breakdown | Context > 30% of total |

---

## Metric Group 6: Tool Calling

**Refresh:** Every 15 minutes

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `tool_call_frequency` | Bar chart (per tool) | Most-called tools | |
| `forbidden_tool_attempts` | Counter | Attempted calls to forbidden tools | > 0 per day |
| `tool_error_rate` | Line chart (per tool) | % of tool calls that return errors | > 10% per tool |
| `avg_tool_calls_per_run` | Line chart | Average tool calls per LLM run | > 10 per run |

---

## Metric Group 7: RAG Grounding

**Refresh:** Every 30 minutes

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `hallucination_detection_rate` | Line chart | % of runs with `hallucination_detected=true` | > 5% |
| `citation_rate` | Line chart | % of RAG outputs that include citations | < 90% for rag tasks |
| `avg_documents_used` | Line chart | Average knowledge docs per run | > 80% of max_documents |
| `document_relevance_avg` | Line chart | Average relevance score of retrieved docs | < 0.65 |

---

## Metric Group 8: Review Quality

**Refresh:** Every 1 hour

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `human_review_queue_depth` | Gauge | Pending human reviews | > 10 |
| `human_review_sla_breach_rate` | Line chart | % of reviews not completed within SLA | > 10% |
| `review_approval_rate` | Line chart | % of outputs approved after human review | < 80% |
| `critical_output_blocked_count` | Counter | Outputs blocked pending review | |

---

## Metric Group 9: Safety

**Refresh:** Every 5 minutes

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `sensitive_context_blocked_rate` | Line chart | % of calls blocked due to sensitive context | Any critical blocks |
| `guardrail_trigger_rate` | Line chart (per guardrail) | How often each guardrail fires | > 1% any guardrail |
| `pii_detection_count` | Counter | PII detected in context | > 0 per day |
| `credential_detection_count` | Counter | Credentials detected in context | > 0 — immediate alert |

---

## Metric Group 10: Regression Trend

**Refresh:** Weekly (and after each version promotion)

| KPI | Type | Description | Alert |
|-----|------|-------------|-------|
| `regression_eval_pass_rate_trend` | Line chart (per agent) | Regression suite pass rate over time | Declining > 5% over 30 days |
| `new_failures_this_week` | Table | Eval cases that newly started failing | Any new failure |
| `improvement_backlog_size` | Gauge | Open improvement items | Growing > 10 items |
| `feedback_volume` | Line chart | Weekly feedback item count | > 3× baseline |

---

## Dashboard Access

- **Viewers:** `viewer` role and above
- **Alert configuration:** `operator` role and above
- **Dashboard configuration:** Platform owner only

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 10 metric groups |
