# Agent Evaluation Policy

**Standard ID:** STD-LLMOPS-AGENT-EVAL-001
**Category:** llmops/agents
**Priority:** high
**Applies To:** all agent runs and instruction version promotions
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines which evaluation suites are required for each agent risk level, when evaluation runs, what pass criteria apply, and what happens when an agent fails evaluation.

---

## 2. Eval Suite Assignment by Risk Level

| Risk Level | Eval Suite Requirement | Pass Threshold | Human Review on Fail |
|-----------|----------------------|---------------|---------------------|
| `low` | Optional (eval_suite_id may be null) | N/A | No |
| `medium` | Automated eval required per run | ≥ 80% | No (re-run or iterate) |
| `high` | Automated eval required per run | ≥ 85% | Yes (required on fail) |
| `critical` | Automated + human eval required per run | ≥ 90% automated; human sign-off | Always (before output is used) |

---

## 3. Agent-Specific Eval Suite Bindings

| agent_id | bound_eval_suite | secondary_suite |
|---------|----------------|----------------|
| `agent-orchestrator` | `eval-suite-orchestration` | `eval-suite-general-task` |
| `agent-skills` | `eval-suite-general-task` | none |
| `agent-knowledge` | `eval-suite-knowledge-rag` | `eval-suite-general-task` |
| `agent-security` | `eval-suite-security-analysis` | `eval-suite-general-task` |
| `agent-debugs` | `eval-suite-debug-root-cause` | `eval-suite-general-task` |
| `agent-review` | `eval-suite-review-quality` | `eval-suite-general-task` |
| `agent-testing` | `eval-suite-general-task` | none |
| `agent-devops` | `eval-suite-devops-deploy` | `eval-suite-general-task` |
| `agent-codegraph` | `eval-suite-code-generation` | `eval-suite-general-task` |
| `agent-standards` | `eval-suite-general-task` | none |
| `agent-graphlayer` | `eval-suite-general-task` | none |

---

## 4. Eval Case Categories for Agent Behavior

Every eval suite for agents includes cases testing the following behavioral dimensions:

### 4.1 Standards Compliance
- Does the output comply with relevant CerebraStandards?
- Are standard violations flagged (not silently fixed)?
- Is the relevant Standard ID cited?

### 4.2 Tool Usage Correctness
- Are only permitted tools called?
- Are tool arguments valid and within expected ranges?
- Does the agent handle tool errors gracefully?

### 4.3 Output Schema Validity
- If the task declares an `output_schema`, does the output validate against it?
- Are all required fields present?
- Are field types correct?

### 4.4 Escalation Trigger Compliance
- When a human escalation trigger condition is present (injected in test), does the agent escalate?
- Does the agent provide a clear reason and `suggested_next_step`?
- Does the agent NOT attempt to complete the task after escalation?

### 4.5 Hallucination / Grounding Check
- Does the agent cite sources for factual claims?
- Does the agent avoid inventing graph nodes, standards, or policy IDs that don't exist?
- Does the agent flag uncertainty when it exists?

---

## 5. When Per-Run Eval Happens

| Eval Type | Timing | Blocking? |
|-----------|--------|----------|
| Automated schema validation | Immediately after output received | YES (output blocked if schema invalid) |
| Automated behavioral eval | After schema check, before delivery | NO (warning logged; delivery proceeds) |
| Human review (critical) | After automated eval, before output used | YES (output cannot be acted upon until review) |
| Regression eval (version change) | At instruction promotion time | YES (promotion blocked if fail) |
| Periodic baseline eval | Weekly, per agent | NO (results feed dashboard only) |

---

## 6. On Eval Failure

### Immediate Actions

| Scenario | Action |
|----------|--------|
| Schema validation fails | Retry once with explicit schema reminder in prompt; escalate if retry fails |
| Behavioral eval fails (medium) | Log failure; deliver output with warning; submit feedback signal |
| Behavioral eval fails (high) | Log failure; require human review; do NOT deliver until reviewed |
| Behavioral eval fails (critical) | Block output; require human review; notify platform owner |
| Regression eval fails (version) | Block promotion; return to draft; log failure analysis |

### Feedback Submission

All eval failures MUST trigger a `llmops_record_feedback` call with:
- `source_mcp: "CerebraLLMOps-mcp"`
- `feedback_type: "eval_failure"`
- `target_type: "agent"`
- `target_id: <agent_id>`
- `severity: <derived from risk level>`
- `evidence: { eval_suite_id, failed_cases, pass_rate }`

---

## 7. Improving Eval Pass Rate

If an agent's pass rate trends below threshold over 7 days:

1. LLMOps generates a performance report (see `content/reports/agent-performance-report-template.md`)
2. Failed cases are analyzed for patterns
3. If pattern is identified → gap signal emitted → improvement proposal created
4. If no pattern → random noise → monitor for another 7 days
5. If pass rate drops below threshold consistently for 14 days → mandatory instruction review

## 8. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
