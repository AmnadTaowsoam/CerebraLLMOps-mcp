# Agent Versioning Policy

**Standard ID:** STD-LLMOPS-AGENT-VERSION-001
**Category:** llmops/agents
**Priority:** high
**Applies To:** all agent instruction and system prompt changes
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines how agent instruction sets and system prompts are versioned, changed, and promoted. Agents are long-lived entities whose behavior must be predictable and auditable over time.

---

## 2. Semantic Versioning Rules

Same semver rules as prompt versioning, with additional meaning:

| Component | Agent Meaning |
|-----------|-------------|
| `MAJOR` | Fundamental behavioral change — agent's core role or permission set changes |
| `MINOR` | New capability or new task type coverage added |
| `PATCH` | Clarification, instruction tightening, or wording fix with same behavioral intent |

### Agent-Specific Rules

1. A change to `allowed_tools` or `forbidden_tools` requires at minimum a `MINOR` bump
2. A change to `mapped_role` (e.g., viewer → operator) requires a `MAJOR` bump
3. A change to `risk_level` requires a `MAJOR` bump
4. Fixes to prevent a known behavior failure are always at least `PATCH` but may be `MINOR` if the fix adds a new constraint

---

## 3. Change Request Process

All agent instruction changes must go through the change request workflow:

### Step 1: Submit Change Request

Submit a change request to the LLMOps management agent or platform owner containing:

```
agent_id: <id>
current_version: <current>
proposed_version: <next>
change_type: MAJOR | MINOR | PATCH
change_summary: <what is changing>
reason: <why this change is needed>
evidence: <failure patterns, feedback, or signals that prompted this>
impact_assessment: <which task types / integrations are affected>
```

### Step 2: Impact Analysis

For MAJOR or MINOR changes, an impact analysis is required:

1. Identify all task_types bound to this agent
2. Identify all prompts that reference this agent's system prompt
3. Identify all eval suites bound to this agent
4. Estimate regression risk (High / Medium / Low)

### Step 3: Review

| Change Type | Reviewer Required |
|------------|------------------|
| PATCH | 1 reviewer (platform team member) |
| MINOR | 1 reviewer + regression eval pass |
| MAJOR | Platform owner + regression eval pass |
| Any change to critical-risk agent | `nottoei` personal review |

### Step 4: Regression Eval

Run the agent's bound eval suite against the new instruction version. Pass threshold:
- Medium/low risk agent: ≥80%
- High risk agent: ≥85%
- Critical risk agent: ≥90%

### Step 5: Promotion

On approval + eval pass:
1. Set new version to `active` in `system-prompt-registry.md`
2. Update `agent-registry.md` with new `instruction_version`
3. Move prior version to `superseded`
4. Log change with reason, approver, and eval result

---

## 4. Rollback Process

If an agent instruction change causes production issues:

1. Platform owner or `nottoei` initiates rollback
2. Specify: `from_version`, `to_version`, `reason`
3. LLMOps service atomically switches active version
4. All new runs immediately use the rolled-back version
5. In-flight runs using the problematic version are flagged
6. Post-rollback: log failure analysis + improvement backlog item

**Rollback SLA:** Under 5 minutes from decision to rollback completion.

---

## 5. Agent Self-Modification Prohibition

An agent MUST NOT modify its own instruction set, system prompt, or version. This is enforced at:

1. The instruction registry API level (agent cannot write to its own row)
2. The DB level (RLS policy blocks agent identity from updating its own instruction)
3. The LLMOps guardrail layer (attempts are blocked, logged, and escalated)

Agent self-improvement happens only through the gap signal → proposal → human approval workflow (CLAUDE.md Rule 7).

---

## Related Documents

- `agent-registry.md` — Master agent table
- `agent-instruction-registry.md` — Instruction content
- `agent-risk-classification.md` — Risk level definitions
- `prompt-versioning-policy.md` — Parallel policy for prompt versions
- `llmops-governance.md` — Permission matrix

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
