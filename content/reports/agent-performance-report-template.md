# Agent Performance Report Template

**Standard ID:** STD-LLMOPS-AGENT-PERF-REPORT-001
**Category:** llmops/reports
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

Weekly agent performance summary. Generated automatically every Monday for the prior 7-day period. Available in the LLMOps dashboard and sent to the platform owner.

---

## Report Template

```markdown
# Cerebra Agent Performance Report

**Period:** <start_date> to <end_date>
**Generated:** <ISO 8601>
**Tenant:** <tenant_id>

---

## Executive Summary

| Metric | Value | vs. Prior Week |
|--------|-------|---------------|
| Total agent runs | <count> | <+/- pct>% |
| Overall eval pass rate | <pct>% | <+/- ppt> |
| Total cost | $<value> | <+/- pct>% |
| Average latency (p50) | <ms> | <+/- pct>% |
| Escalation rate | <pct>% | <+/- ppt> |
| Human reviews completed | <count> | |
| Feedback items opened | <count> | |

---

## Per-Agent Performance

| agent_id | runs | eval_pass_rate | avg_latency_ms | avg_cost_usd | error_rate | escalation_rate | status |
|---------|------|--------------|---------------|-------------|------------|----------------|--------|
| agent-orchestrator | <n> | <pct>% | <ms> | $<v> | <pct>% | <pct>% | ✓ / ⚠ / ✗ |
| agent-skills | | | | | | | |
| agent-knowledge | | | | | | | |
| agent-security | | | | | | | |
| agent-debugs | | | | | | | |
| agent-review | | | | | | | |
| agent-testing | | | | | | | |
| agent-devops | | | | | | | |
| agent-codegraph | | | | | | | |
| agent-standards | | | | | | | |

**Status:** ✓ = All metrics within target | ⚠ = Warning (one metric below threshold) | ✗ = Action required

---

## Agents Requiring Attention

*(Only populate if status = ⚠ or ✗)*

### <agent_id>
- **Issue:** <describe>
- **Eval pass rate:** <pct>% (threshold: <pct>%)
- **Failed cases this week:** <list>
- **Pattern:** <describe pattern if identified>
- **Linked improvement item:** <IMP-XXX or "none">
- **Recommended action:** <what to do>

---

## Eval Suite Results (This Week)

| suite_id | runs | pass_rate | top_failing_case |
|---------|------|----------|-----------------|
| eval-suite-orchestration | <n> | <pct>% | <case_id> |
| eval-suite-knowledge-rag | | | |
| eval-suite-security-analysis | | | |
| eval-suite-debug-root-cause | | | |
| eval-suite-review-quality | | | |
| eval-suite-code-generation | | | |

---

## Model Usage This Week

| model_id | runs | % of total | avg_cost_usd | fallback_triggered |
|---------|------|-----------|-------------|------------------|
| claude-opus-4 | <n> | <pct>% | $<v> | <count> |
| claude-sonnet-4-5 | | | | |
| claude-haiku-3-5 | | | | |
| ollama/llama-3.1-8b | | | | |

---

## Notable Events This Week

*(High-severity alerts, guardrail triggers, escalations)*

| Date | Event | Agent | Severity | Resolved |
|------|-------|-------|---------|---------|
| <date> | <description> | <agent_id> | critical/high | YES/NO |

---

## Improvement Items Opened This Week

| item_id | description | priority | linked_agent |
|---------|-------------|---------|------------|
| IMP-XXX | | | |

---

## Improvement Items Completed This Week

| item_id | description | result |
|---------|-------------|--------|
| IMP-XXX | | pass rate improved from X% to Y% |
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial template |
