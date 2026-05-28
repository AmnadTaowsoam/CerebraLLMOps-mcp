# Agent Registry

**Standard ID:** STD-LLMOPS-AGENT-REG-001
**Category:** llmops/agents
**Priority:** critical
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Master registry of all Cerebra agents. Each agent has a declared identity, mapped role, instruction version, risk level, and evaluation suite binding. This registry is the source of truth for `llmops_get_agent_instructions`.

---

## Agent Registry Table

| agent_id | name | mapped_role | instruction_version | risk_level | eval_suite | sys_prompt_id | status |
|---------|------|------------|--------------------|-----------|-----------|--------------|----|
| `agent-orchestrator` | Cerebra Orchestrator Agent | `admin` | `3.1.0` | critical | `eval-suite-orchestration` | `sysprompt-orchestrator` | active |
| `agent-skills` | Skills Discovery Agent | `operator` | `2.0.0` | low | `eval-suite-general-task` | `sysprompt-skills` | active |
| `agent-knowledge` | Knowledge Retrieval Agent | `operator` | `2.0.0` | medium | `eval-suite-knowledge-rag` | `sysprompt-knowledge` | active |
| `agent-security` | Security Policy Agent | `admin` | `2.2.0` | critical | `eval-suite-security-analysis` | `sysprompt-security` | active |
| `agent-debugs` | Debug Diagnostic Agent | `operator` | `1.5.0` | high | `eval-suite-debug-root-cause` | `sysprompt-debugs` | active |
| `agent-review` | Proposal Review Agent | `operator` | `1.3.0` | high | `eval-suite-review-quality` | `sysprompt-review` | active |
| `agent-testing` | Testing Strategy Agent | `operator` | `1.2.0` | medium | `eval-suite-general-task` | `sysprompt-testing` | active |
| `agent-devops` | DevOps Readiness Agent | `admin` | `1.4.0` | critical | `eval-suite-devops-deploy` | `sysprompt-devops` | active |
| `agent-codegraph` | Code Graph Agent | `operator` | `1.1.0` | high | `eval-suite-code-generation` | `sysprompt-codegraph` | active |
| `agent-standards` | Standards Compliance Agent | `operator` | `1.0.0` | medium | `eval-suite-general-task` | `sysprompt-standards` | active |
| `agent-graphlayer` | Graph Layer Context Agent | `operator` | `1.0.0` | medium | `eval-suite-general-task` | `sysprompt-graphlayer` | active |
| `agent-llmops` | LLMOps Management Agent | `operator` | `0.1.0` | high | `eval-suite-general-task` | `sysprompt-llmops` | draft |

---

## Risk Level Summary

| Risk Level | Count | Agents |
|-----------|-------|--------|
| `critical` | 3 | orchestrator, security, devops |
| `high` | 3 | debugs, review, codegraph, llmops (draft) |
| `medium` | 4 | knowledge, testing, standards, graphlayer |
| `low` | 1 | skills |

---

## How to Register a New Agent

1. Choose `agent_id` following the pattern: `agent-{mcp-short}` (kebab-case)
2. Map to a `mapped_role`: `admin | operator | viewer | service`
3. Set `risk_level` using `agent-risk-classification.md`
4. Set `instruction_version: 0.1.0` (draft)
5. Bind to an `eval_suite` from `agent-evaluation-policy.md`
6. Create system prompt in `system-prompt-registry.md`
7. Submit for promotion review
8. On approval: set `status: active`

---

## Version History (Recent)

| agent_id | instruction_version | changed_at | changed_by | reason |
|---------|--------------------|-----------|-----------|----|
| `agent-orchestrator` | `3.1.0` | 2026-05-24 | platform-owner | SIM-16 stateless guard guidance |
| `agent-security` | `2.2.0` | 2026-05-22 | platform-owner | DLP trigger strengthening |
| `agent-devops` | `1.4.0` | 2026-05-20 | platform-owner | Deployment gate language |

---

## Related Documents

- `agent-instruction-registry.md` — Instruction content per agent
- `agent-risk-classification.md` — How risk_level is assigned
- `agent-evaluation-policy.md` — Which eval suites map to which risk levels
- `system-prompt-registry.md` — System prompts linked here

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 12 agents registered |
