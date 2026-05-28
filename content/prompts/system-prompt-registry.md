# System Prompt Registry

**Standard ID:** STD-LLMOPS-SYS-PROMPT-REG-001
**Category:** llmops/prompts
**Priority:** critical
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Registry of all system-level prompts (agent behavior definitions) used in CerebraMCP. System prompts define how an agent behaves across all tasks — they are distinct from task-specific prompt templates. Every Cerebra agent has exactly one active system prompt at any time.

System prompts are subject to the strictest versioning and approval controls. Any change to a system prompt constitutes a change to agent behavior and triggers mandatory regression evaluation.

---

## System Prompt Registry Table

| sys_prompt_id | agent_id | name | current_version | risk_impact | status | last_eval_result |
|--------------|---------|------|----------------|------------|--------|----------------|
| `sysprompt-orchestrator` | `agent-orchestrator` | Orchestrator Agent System Prompt | `3.1.0` | critical | active | pass |
| `sysprompt-skills` | `agent-skills` | Skills MCP Agent System Prompt | `2.0.0` | medium | active | pass |
| `sysprompt-knowledge` | `agent-knowledge` | Knowledge MCP Agent System Prompt | `2.0.0` | medium | active | pass |
| `sysprompt-security` | `agent-security` | Security MCP Agent System Prompt | `2.2.0` | critical | active | pass |
| `sysprompt-debugs` | `agent-debugs` | Debugs MCP Agent System Prompt | `1.5.0` | high | active | pass |
| `sysprompt-review` | `agent-review` | Review MCP Agent System Prompt | `1.3.0` | high | active | pass |
| `sysprompt-testing` | `agent-testing` | Testing MCP Agent System Prompt | `1.2.0` | medium | active | pass |
| `sysprompt-devops` | `agent-devops` | DevOps MCP Agent System Prompt | `1.4.0` | critical | active | pass |
| `sysprompt-codegraph` | `agent-codegraph` | CodeGraph MCP Agent System Prompt | `1.1.0` | high | active | pass |
| `sysprompt-standards` | `agent-standards` | Standards MCP Agent System Prompt | `1.0.0` | medium | active | pass |
| `sysprompt-graphlayer` | `agent-graphlayer` | GraphLayer Agent System Prompt | `1.0.0` | high | active | pass |
| `sysprompt-llmops` | `agent-llmops` | LLMOps MCP Agent System Prompt | `0.1.0` | high | draft | pending |

---

## Mandatory System Prompt Elements

Every system prompt MUST contain the following sections in order:

1. **Identity block** — who the agent is, which MCP it operates within
2. **Primary responsibility** — one-sentence statement of core purpose
3. **Orchestrator-first rule** — explicit reminder to call orchestrator before any task
4. **Tool permissions** — explicit list of tools this agent may call
5. **Forbidden actions** — explicit list of forbidden behaviors
6. **Escalation triggers** — when to stop and escalate to human
7. **Output format** — expected output structure for common task types
8. **Standards references** — which CerebraStandards apply to this agent's outputs

---

## Version History (Recent)

| sys_prompt_id | version | changed_at | changed_by | reason | eval_result |
|--------------|---------|-----------|-----------|--------|------------|
| `sysprompt-orchestrator` | `3.1.0` | 2026-05-24 | platform-owner | Added SIM-16 stateless guard guidance | pass |
| `sysprompt-security` | `2.2.0` | 2026-05-22 | platform-owner | Strengthened DLP trigger language | pass |
| `sysprompt-devops` | `1.4.0` | 2026-05-20 | platform-owner | Added deployment gate language | pass |

---

## Promotion Workflow for System Prompts

System prompts follow a stricter promotion path than task prompts:

```
draft → review → regression_eval → human_approval → active
```

1. **draft**: New version registered, not deployed
2. **review**: Second engineer reviews for adversarial behavior, injection resistance, and scope creep
3. **regression_eval**: Full regression eval suite runs (20 golden cases minimum, pass threshold ≥85%)
4. **human_approval**: Platform owner explicitly approves before activation
5. **active**: Deployed — prior version moved to `superseded`

Critical-risk agents (`agent-orchestrator`, `agent-security`, `agent-devops`) require `nottoei` personal approval in addition to platform owner.

---

## Related Documents

- `agent-instruction-registry.md` — Per-agent instruction sets (more granular than system prompt)
- `prompt-versioning-policy.md` — Version rules
- `agent-behavior-policy.md` — Behavioral rules encoded in system prompts
- `prompt-review-checklist.md` — Review gate

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial registry for all 12 Cerebra agents |
