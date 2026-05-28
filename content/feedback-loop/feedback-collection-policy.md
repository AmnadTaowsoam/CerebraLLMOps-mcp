# Feedback Collection Policy

**Standard ID:** STD-LLMOPS-FEEDBACK-001
**Category:** llmops/feedback-loop
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the sources of feedback, the collection format, severity levels, and requirements for feedback submission. Feedback is the raw material for the continuous improvement workflow.

---

## 2. Feedback Sources

| Source | Feedback Type | Trigger |
|--------|-------------|---------|
| CerebraReview-mcp | `review_finding` | After every review run (pass or fail) |
| CerebraDebugs-mcp | `debug_finding` | After root cause analysis identifies a pattern |
| CerebraTesting-mcp | `quality_gate_result` | After a quality gate check |
| CerebraSecurity-mcp | `security_finding` | After any security policy check |
| CerebraStandards-mcp | `standards_violation` | After a standards compliance check with findings |
| Human reviewer | `human_review_result` | After a human reviews an agent output |
| LLMOps (automated) | `eval_failure` | After an automated eval run with failures |
| Agent (self-reported) | `gap_signal` | After emitting a gap signal via Rule 7 |

---

## 3. Feedback Format

```json
{
  "feedback_id": "feedback-<uuid>",
  "source_mcp": "CerebraReview-mcp",
  "feedback_type": "review_finding",
  "target_type": "agent | prompt | model | policy",
  "target_id": "agent-knowledge | prompt-knowledge-rag-search | claude-sonnet-4-5 | routing-policy",
  "target_version": "2.1.0",
  "related_trace_id": "trace-<uuid>",
  "related_run_id": "run-<uuid>",
  "summary": "One-sentence description of the finding",
  "detail": "Detailed description with evidence and context",
  "severity": "critical | high | medium | low | info",
  "is_blocking": true,
  "evidence": {
    "eval_case_id": "GC-011",
    "actual_output": "...",
    "expected": "...",
    "standard_id": "STD-CORE-AGENT-BEHAVIOR"
  },
  "suggested_improvement": "Optional: what the submitter thinks should change",
  "submitted_at": "ISO 8601",
  "submitted_by": "<agent_id or user_id>",
  "tenant_id": "default",
  "status": "open | acknowledged | in_progress | resolved | wont_fix"
}
```

---

## 4. Severity Levels

| Severity | Definition | Response SLA |
|---------|-----------|------------|
| `critical` | Agent produced output that caused or nearly caused a security incident, data breach, or production outage | Immediate: interrupt current work |
| `high` | Agent consistently fails on a class of tasks; eval pass rate below threshold; major behavioral violation | 24 hours |
| `medium` | Agent underperforms on specific task types; minor policy violations; citation quality issues | 1 week |
| `low` | Minor wording issues, edge case failures, cosmetic problems | Next sprint |
| `info` | Positive feedback — agent performed well; useful for establishing baselines | No action required |

---

## 5. Collection Requirements

### Mandatory Collection

Feedback MUST be submitted automatically (without manual action) for:
- Any automated eval that produces `status: fail`
- Any human review that produces `decision: rejected`
- Any guardrail trigger (`SAFE-*` alerts)
- Any security finding from CerebraSecurity-mcp

### Recommended Collection

Feedback SHOULD be submitted for:
- Any human review that produces `decision: conditional` (with conditions)
- Any run where `context_quality_impact = high` (context was heavily compressed)
- Any run where the agent emitted a gap signal

### Optional Collection

Any agent or human may submit feedback at any time via `llmops_record_feedback`. Voluntary feedback from human reviewers is valuable and should be encouraged.

---

## 6. Feedback Quality Rules

1. `summary` must be ≤ 100 characters — it appears in dashboards
2. `detail` must be substantive — at minimum 2 sentences describing the issue
3. `evidence` must include at least one of: eval case ID, output excerpt, standard ID, or trace ID
4. `suggested_improvement` is optional but strongly encouraged
5. `severity` must not be inflated — reserve `critical` for genuine safety issues

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8 sources + collection format |
