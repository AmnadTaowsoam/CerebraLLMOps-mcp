# Failure Pattern Registry

**Standard ID:** STD-LLMOPS-FAILURE-PATTERN-001
**Category:** llmops/feedback-loop
**Priority:** medium
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Registry of known failure patterns observed in Cerebra agent runs. Patterns are identified from repeated feedback items with similar characteristics. This registry helps:
1. Route new failures to known patterns quickly (faster triage)
2. Track which patterns have been addressed
3. Prioritize improvement proposals by frequency/impact

---

## Pattern Table

| pattern_id | description | linked_agent | linked_prompt | frequency | severity | improvement_status |
|-----------|-------------|------------|-------------|----------|---------|-------------------|
| `FP-RAG-NO-CITATION` | Knowledge RAG outputs claim facts without citing source documents | `agent-knowledge` | `prompt-knowledge-rag-search` | 12 occurrences | medium | in_progress |
| `FP-SCOPE-EXCEED` | Agent attempts tasks outside declared task_type scope | `agent-orchestrator` | `prompt-orchestrator-compose` | 5 occurrences | medium | open |
| `FP-UNCERTAIN-CLAIM` | Agent makes definitive claims when sources are incomplete or partial | multiple | multiple | 8 occurrences | high | in_progress |
| `FP-MISSING-STD-REF` | Output references a standard by name but not by Standard ID (STD-XX) | multiple | multiple | 15 occurrences | low | open |
| `FP-TOOL-PERM-BYPASS` | Agent attempts to call a tool not in its allowed_tools list | `agent-debugs` | `prompt-debug-root-cause` | 2 occurrences | high | resolved |
| `FP-TICKET-CLOSE-NOEVIDIDENCE` | Agent marks task complete without providing acceptance test evidence | multiple | multiple | 7 occurrences | high | in_progress |
| `FP-CONTEXT-OVERRUN` | Context exceeds budget causing truncation of high-relevance documents | `agent-codegraph` | `prompt-codegraph-impact` | 4 occurrences | medium | open |
| `FP-HALLUCINATED-NODE-ID` | Agent references graph node_ids that don't exist in the registry | `agent-graphlayer` | multiple | 3 occurrences | high | open |

---

## Pattern Status Definitions

| status | Meaning |
|--------|---------|
| `open` | Pattern identified, improvement not yet started |
| `in_progress` | Improvement proposal exists and is being implemented |
| `resolved` | Pattern has been addressed; verify via regression eval |
| `wont_fix` | Pattern accepted as acceptable trade-off; documented with reason |
| `monitoring` | Fix deployed; monitoring to confirm pattern rate has dropped |

---

## Adding a New Pattern

A pattern is added when:
1. 3 or more feedback items with matching `summary` keywords exist within 30 days, OR
2. A single `critical` severity feedback item arrives, OR
3. A platform engineer manually identifies a pattern from trace analysis

Pattern detection runs automatically weekly; manual additions are always welcome.

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8 known patterns |
