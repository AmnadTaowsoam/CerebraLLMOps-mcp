# Prompt Registry

**Standard ID:** STD-LLMOPS-PROMPT-REG-001
**Category:** llmops/prompts
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Master registry of all prompt templates used across CerebraMCP. Each prompt is versioned, owned by a specific MCP, and bound to one or more task types. This registry is the source of truth for `llmops_get_prompt_version`.

---

## Prompt Registry Table

| prompt_id | name | current_version | task_types | owner_mcp | model_binding | status |
|-----------|------|----------------|-----------|-----------|--------------|--------|
| `prompt-orchestrator-compose` | Orchestrator Compose Learning | `1.2.0` | `compose_learning`, `multi_mcp_coordination` | CerebraOrchestrator-mcp | `claude-sonnet-4-5` | active |
| `prompt-knowledge-rag-search` | Knowledge RAG Search | `2.1.0` | `knowledge_retrieval`, `rag_grounding` | CerebraKnowledge-mcp | `claude-sonnet-4-5` | active |
| `prompt-security-policy-eval` | Security Policy Evaluation | `1.0.3` | `security_analysis`, `policy_check` | CerebraSecurity-mcp | `claude-opus-4` | active |
| `prompt-debug-root-cause` | Debug Root Cause Analysis | `1.1.0` | `debug`, `incident_triage` | CerebraDebugs-mcp | `claude-sonnet-4-5` | active |
| `prompt-review-proposal-eval` | Proposal Review Evaluation | `1.0.0` | `review`, `proposal_evaluation` | CerebraReview-mcp | `claude-sonnet-4-5` | active |
| `prompt-skills-search` | Skills Discovery Search | `1.0.1` | `skills_retrieval`, `skill_composition` | CerebraSkills-mcp | `claude-haiku-3-5` | active |
| `prompt-testing-strategy-gen` | Test Strategy Generation | `1.0.0` | `test_planning`, `regression_risk` | CerebraTesting-mcp | `claude-sonnet-4-5` | active |
| `prompt-devops-readiness-check` | DevOps Readiness Check | `1.0.0` | `deployment`, `env_validation` | CerebraDevOps-mcp | `claude-opus-4` | active |
| `prompt-codegraph-impact` | Code Impact Analysis | `1.1.0` | `code_generation`, `impact_analysis` | CerebraCodeGraph-mcp | `claude-sonnet-4-5` | active |
| `prompt-standards-compliance` | Standards Compliance Check | `2.0.0` | `standards_check`, `code_review` | CerebraStandards-mcp | `claude-haiku-3-5` | active |

---

## Version History (Last 3 Changes)

| prompt_id | version | changed_at | changed_by | reason |
|-----------|---------|-----------|-----------|--------|
| `prompt-knowledge-rag-search` | `2.1.0` | 2026-05-22 | platform-owner | Added citation grounding instructions |
| `prompt-orchestrator-compose` | `1.2.0` | 2026-05-20 | platform-owner | Expanded graph context handling |
| `prompt-security-policy-eval` | `1.0.3` | 2026-05-18 | platform-owner | Fixed false-positive reduction for DLP |

---

## How to Register a New Prompt

1. Choose a `prompt_id` following the pattern: `prompt-{mcp-short}-{purpose}` (kebab-case)
2. Set `status: draft`
3. Assign `current_version: 0.1.0`
4. Bind to at least one `task_type`
5. Run prompt review checklist (see `prompt-review-checklist.md`)
6. Run regression eval (see `prompt-regression-test-policy.md`)
7. Submit for promotion review
8. On approval: set `status: active`

---

## Related Documents

- `system-prompt-registry.md` — System-level agent prompts
- `prompt-versioning-policy.md` — Version rules and immutability
- `prompt-review-checklist.md` — 10-item pre-promotion checklist
- `prompt-regression-test-policy.md` — Regression eval requirements

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial registry with 10 Cerebra prompts |
