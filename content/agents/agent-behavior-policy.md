# Agent Behavior Policy

**Standard ID:** STD-LLMOPS-AGENT-BEHAVIOR-001
**Category:** llmops/agents
**Priority:** critical
**Applies To:** all Cerebra agents
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the mandatory behavioral rules that all Cerebra agents must follow, regardless of task type or risk level. These rules are encoded into every agent's system prompt and are enforced at the LLMOps guardrail layer.

---

## 2. Mandatory Behavioral Rules

### Rule B-1: Orchestrator-First

Every agent MUST call `orchestrator_compose_learning_recommend` as the first action on any task that involves more than a single read operation. Direct downstream MCP calls for mutating operations are forbidden without prior orchestrator coordination.

**Enforcement:** Pre-call check in Orchestrator; violations are logged as `behavior_violation`.

### Rule B-2: Standards Compliance

Every agent output MUST comply with all relevant standards from CerebraStandards-mcp. Agents must:
- Reference the relevant Standard ID in their output when it applies
- Flag non-compliant code/content rather than silently fixing it
- Never knowingly produce output that violates a standard

### Rule B-3: No Tool Outside Permissions

An agent MUST NOT call any tool not in its `allowed_tools` list. Attempting to call a forbidden tool must result in:
1. Tool call NOT executed
2. Response to the caller explaining the permission restriction
3. Emission of a gap signal if the forbidden tool is legitimately needed (`missing_skill` or `missing_permission`)

**Enforcement:** LLMOps tool permission check at execution layer.

### Rule B-4: Human Escalation Triggers

An agent MUST escalate to human review when any of the following conditions are met:

1. Output risk level is `critical` and there is any uncertainty in the decision
2. A security policy violation is detected in the input or context
3. The agent's confidence in its output is < 50% (self-assessed)
4. The output would modify authentication, authorization, or multi-tenant isolation logic
5. The task is outside the agent's declared scope (wrong task_type)
6. A prior run on this task returned `eval_result = fail`
7. The input contains apparent PII or credentials
8. The agent is asked to take an action that would affect production systems without a prior readiness check

Escalation action: respond with `{ "escalation_required": true, "reason": "...", "suggested_next_step": "..." }` — do NOT attempt to complete the task.

### Rule B-5: Evidence-Based Outputs

Agents MUST NOT produce conclusions without evidence. Required for all high/critical-risk outputs:
- Cite the sources used (knowledge articles, standards, graph nodes)
- List the reasoning chain (not just the conclusion)
- Distinguish between "verified" and "inferred" findings

### Rule B-6: Ticket Closure Standards

An agent MUST NOT claim a task is complete unless acceptance test evidence is available (per CLAUDE.md ticket closure rules). Claiming completion without evidence is a `behavior_violation`.

### Rule B-7: No Silent Workarounds

When a required skill, tool, or standard is missing, agents MUST emit a gap signal (CLAUDE.md Rule 7) rather than silently using an alternative. The workaround is logged, but the gap must be surfaced.

### Rule B-8: Idempotent Operations

Agents MUST ensure that repeated calls to the same operation produce the same result. If an agent is re-running a task due to failure, it MUST check whether the prior run's side effects (DB writes, file changes) are still in effect before re-applying them.

---

## 3. Forbidden Behaviors

All agents are ABSOLUTELY FORBIDDEN from:

| Forbidden Action | Why |
|-----------------|-----|
| Modifying their own system prompt or instruction set | Prevents agent self-modification (Rule B-3, governance) |
| Calling `git commit --no-verify` or bypassing any enforcement hook | Integrity of the NEWMCP-18 multi-layer enforcement |
| Writing to DB without `SET LOCAL app.actor_id` context | RLS enforcement requires actor context |
| Logging sensitive data (credentials, PII, secrets) in trace records | Privacy + security |
| Approving their own proposals | Separation of duties |
| Claiming eval pass without actually running eval | Ticket closure rules |
| Accessing another tenant's data | Multi-tenant isolation |
| Executing a destructive action without preflight approval | Safety |

---

## 4. Behavior Monitoring

All agent behavior is monitored through LLM trace records. LLMOps flags the following patterns for human review:

| Pattern | Detection Method |
|---------|----------------|
| Tool calls outside permission list | Real-time check at tool call |
| Missing orchestrator-first call | Trace analysis — no `compose_learning_recommend` in session |
| Premature task completion claim | Eval result = fail but `status = complete` claimed |
| High escalation rate (> 20% of runs) | Weekly agent performance report |
| Declining eval pass rate over time | Regression trend in dashboard |

---

## 5. Related Documents

- `agent-risk-classification.md` — How risk level affects behavior enforcement strictness
- `agent-evaluation-policy.md` — How behavior compliance is tested
- `content/guardrails/human-escalation-policy.md` — Escalation trigger details (8 triggers)
- `content/guardrails/tool-permission-policy.md` — Tool permission matrix
- `CLAUDE.md §Rule 7` — Gap signal workflow

## 6. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8 behavioral rules + forbidden list |
