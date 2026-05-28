# Human Escalation Policy

**Standard ID:** STD-LLMOPS-HUMAN-ESCALATION-001
**Category:** llmops/guardrails
**Priority:** critical
**Applies To:** all Cerebra agents
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the 8 triggers that require human review before an agent output can be acted upon. This matches spec §14.4. When any trigger is met, the agent MUST escalate — it may NOT attempt to resolve the situation autonomously.

---

## 2. The 8 Escalation Triggers

### Trigger E-1: Critical Risk Output

**Condition:** `risk_level = critical` AND any uncertainty in the agent's reasoning
**What to do:** Return escalation response; do NOT deliver the output
**Escalation message must include:**
- What task was being performed
- What the uncertainty is
- What the agent would have done (so the reviewer can evaluate)
- Suggested human action

---

### Trigger E-2: Security Policy Violation Detected

**Condition:** CerebraSecurity-mcp flagged a security policy violation in the task context or the output
**What to do:** BLOCK task completion; surface violation details to human reviewer
**Escalation message must include:**
- Which security policy was triggered
- What content caused the trigger
- Severity of the violation

---

### Trigger E-3: Low Confidence

**Condition:** Agent's self-assessed confidence in the output is < 50%
**What to do:** Deliver output WITH explicit confidence warning AND escalation flag
**Escalation message must include:**
- What the agent is uncertain about
- What additional information would resolve the uncertainty
- Whether the agent recommends acting on this output at all

---

### Trigger E-4: Automated Eval Failure

**Condition:** The automated eval for this run returned `eval_result = fail`
**What to do:** Block delivery (high/critical risk) OR deliver with warning (medium risk)
**Escalation message must include:**
- Which eval cases failed
- Why they failed (specific assertion that failed)
- Whether the agent believes the failure is a false positive

---

### Trigger E-5: Output Affects Auth or Multi-Tenant Isolation

**Condition:** The output, if acted upon, would modify authentication logic, JWT configuration, RBAC rules, or multi-tenant isolation
**What to do:** ALWAYS escalate, regardless of risk level or confidence
**Escalation message must include:**
- Exactly what would be changed
- Who the change would affect
- A specific recommendation: proceed with caution vs. do not proceed

---

### Trigger E-6: Prior Run Failed for This Task

**Condition:** A previous run for the same task_id returned `eval_result = fail` or `status = failure`
**What to do:** Escalate with context about the previous failure
**Escalation message must include:**
- What the previous failure was
- What is different about this attempt
- Whether the root cause of the previous failure has been addressed

---

### Trigger E-7: PII or Credentials in Input

**Condition:** The sensitive context guardrail detected PII (not scrubbed cleanly) or credentials in the input
**What to do:** BLOCK the task; escalate immediately
**Escalation message must include:**
- What category of sensitive data was found
- Where it was found (in which context source)
- Recommended action (remove the sensitive data from the source)

---

### Trigger E-8: Task Outside Agent's Declared Scope

**Condition:** The task_type is not in the agent's declared `task_types` list
**What to do:** Decline the task; escalate to Orchestrator for re-routing
**Escalation message must include:**
- What task was requested
- Why it's outside scope (which task_type it would require)
- Which agent/MCP should handle it instead

---

## 3. Escalation Response Format

When escalating, the agent MUST return this structure (not attempt to complete the task):

```json
{
  "escalation_required": true,
  "trigger": "E-1 | E-2 | E-3 | E-4 | E-5 | E-6 | E-7 | E-8",
  "trigger_description": "Human-readable description of why escalation is required",
  "risk_level": "critical | high | medium | low",
  "agent_id": "agent-<name>",
  "task_id": "task-<uuid>",
  "trace_id": "trace-<uuid>",
  "partial_output": "<agent's work so far, if any>",
  "confidence": 0.0,
  "uncertainty_detail": "What the agent is uncertain about",
  "suggested_next_step": "What the human reviewer should do",
  "estimated_review_time_minutes": 15,
  "requires_specialist": false,
  "specialist_type": null
}
```

---

## 4. Escalation Routing

| Trigger | Who Receives Escalation |
|---------|------------------------|
| E-1 (critical risk) | Platform owner |
| E-2 (security violation) | `nottoei` + Platform owner |
| E-3 (low confidence) | Platform owner |
| E-4 (eval failure) | Platform team |
| E-5 (auth/isolation) | `nottoei` + Security team |
| E-6 (prior failure) | Platform team |
| E-7 (PII/credentials) | `nottoei` + Platform owner immediately |
| E-8 (out of scope) | Orchestrator (auto-rerouting) |

---

## 5. Escalation SLAs

| Trigger Severity | Response SLA |
|----------------|-------------|
| E-2, E-5, E-7 | 15 minutes (security incidents) |
| E-1, E-4 (critical risk) | 30 minutes |
| E-3, E-6 | 2 hours |
| E-8 | Immediate auto-rerouting |

---

## 6. Do NOT Escalate When

- A tool returns an expected error (e.g., 404 for a missing resource) — handle via error handling, not escalation
- Context is slightly compressed (compression is expected and handled automatically)
- An eval case fails with low weight (< 0.5) — log but don't escalate unless pattern develops

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8 triggers from spec §14.4 |
