# Improvement Backlog

**Standard ID:** STD-LLMOPS-IMPROVEMENT-BACKLOG-001
**Category:** llmops/feedback-loop
**Priority:** medium
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Open improvement items derived from the feedback loop. Each item is linked to one or more feedback items or failure patterns, has a priority, and tracks the proposed change and current status.

---

## Backlog Table

| item_id | type | priority | linked_feedback | linked_pattern | proposed_change | status |
|---------|------|---------|----------------|---------------|----------------|--------|
| `IMP-001` | prompt_update | high | FP-RAG-NO-CITATION, 12 feedback items | `FP-RAG-NO-CITATION` | Add explicit citation instruction to `prompt-knowledge-rag-search` v2.2.0 | in_progress |
| `IMP-002` | agent_instruction | high | FP-TICKET-CLOSE-NOEVIDENCE, 7 items | `FP-TICKET-CLOSE-NOEVIDIDENCE` | Strengthen ticket closure evidence requirement in orchestrator and review agent instructions | in_progress |
| `IMP-003` | eval_case | medium | FP-UNCERTAIN-CLAIM | `FP-UNCERTAIN-CLAIM` | Add 3 new eval cases to regression suite testing uncertainty flagging | open |
| `IMP-004` | prompt_update | low | FP-MISSING-STD-REF, 15 items | `FP-MISSING-STD-REF` | Add instruction to all prompts: "always use Standard ID format STD-XX when referencing standards" | open |
| `IMP-005` | context_budget | medium | FP-CONTEXT-OVERRUN, 4 items | `FP-CONTEXT-OVERRUN` | Increase `max_code_nodes` from 15→20 for `agent-codegraph` high-risk tasks | open |
| `IMP-006` | eval_case | high | FP-HALLUCINATED-NODE-ID, 3 items | `FP-HALLUCINATED-NODE-ID` | Add hallucination eval case: verify all referenced node_ids exist in context | open |
| `IMP-007` | agent_instruction | medium | FP-SCOPE-EXCEED | `FP-SCOPE-EXCEED` | Strengthen scope containment in orchestrator system prompt v3.2.0 | open |
| `IMP-008` | guardrail | high | 2 feedback items about credential exposure | None | Add guardrail: scan all LLM outputs for credential patterns before delivery | open |

---

## Priority Definitions

| Priority | Description |
|---------|-------------|
| `critical` | Safety or security issue — must be resolved before next release |
| `high` | Frequent or high-severity failure pattern — resolve within 2 weeks |
| `medium` | Moderate impact — resolve within next sprint (2–4 weeks) |
| `low` | Minor improvement — resolve within next quarter |

---

## Status Definitions

| Status | Description |
|--------|-------------|
| `open` | Not yet started; in backlog |
| `in_progress` | Actively being worked — PR or proposal exists |
| `review` | Change ready for review; blocked on approval |
| `completed` | Implemented and verified via regression eval |
| `wont_do` | Declined with documented reason |
| `deferred` | Postponed — reason documented |

---

## How Items Are Added

1. A failure pattern crosses its threshold (HIGH: 1 occurrence, MEDIUM: 3 in 7 days, LOW: 5 in 30 days)
2. The auto-proposal mechanism (CLAUDE.md Rule 7) creates a candidate improvement item
3. Platform owner reviews and either: adds to backlog, rejects, or defers
4. Once in backlog: assigned a priority and owner
5. Owner implements via the appropriate change workflow (prompt, agent, eval, guardrail)
6. On completion: regression eval verifies the pattern rate drops
7. Item marked `completed`; failure pattern status set to `monitoring`

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8 improvement items |
