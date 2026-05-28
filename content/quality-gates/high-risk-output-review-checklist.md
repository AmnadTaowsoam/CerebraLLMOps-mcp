# High-Risk Output Review Checklist

**Standard ID:** STD-LLMOPS-HIGH-RISK-REVIEW-001
**Category:** llmops/quality-gates
**Priority:** critical
**Applies To:** all critical-risk agent outputs requiring human review
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

12 items for a human reviewer to check before approving a critical-risk agent output. This checklist is mandatory — outputs cannot be acted upon until a qualified reviewer completes and signs off on all 12 items.

---

## Checklist

- [ ] **1. Identity verified** — The agent that produced this output is the expected agent for this task type. Agent ID and instruction version match the registered values in `agent-registry.md`.

- [ ] **2. Prompt version correct** — The prompt version used for this run is the current active version in `prompt-registry.md`. An outdated prompt version is a warning sign.

- [ ] **3. Automated eval passed** — The automated eval result for this run is `status: pass`. If automated eval failed, human review must include a specific finding for each failed eval case.

- [ ] **4. No sensitive data in output** — The output has been scanned for: credentials, API keys, PII, internal system details. None present. The `sensitive_context_detected: false` field is confirmed.

- [ ] **5. Citations are real** — All `[Source: ...]` citations in the output correspond to documents that were actually retrieved for this run (verified against `documents_used` in the trace).

- [ ] **6. Reasoning chain is present** — For factual claims and recommendations, the reasoning chain is visible (not just the conclusion). Reviewer can follow the logic.

- [ ] **7. Standards compliance** — The output references or complies with all relevant CerebraStandards. No known standard is violated. Reviewer has checked at minimum the standards most relevant to this task type.

- [ ] **8. No scope creep** — The output addresses the declared task and does not make unrequested changes, decisions, or recommendations outside the task scope.

- [ ] **9. Action is reversible (if applicable)** — If the output recommends or initiates an action (e.g., deployment, DB change, config update), the action is reversible OR the irreversibility has been explicitly acknowledged and accepted.

- [ ] **10. Confidence is appropriate** — The output's confidence language matches the evidence quality. Claims are not stated as certain when sources are limited. Uncertain findings are flagged.

- [ ] **11. Security implications checked** — The reviewer has specifically assessed: Does this output change auth? Multi-tenant isolation? Security policies? If yes, a security specialist has also reviewed.

- [ ] **12. Ready to act** — The reviewer is personally satisfied that acting on this output is safe and correct. If there is any doubt on any item, the output is returned to the agent with specific instructions for improvement.

---

## Review Decision

| Decision | Meaning |
|---------|---------|
| `approved` | All 12 items pass — output may be acted upon |
| `conditional` | Output may proceed IF specific items are noted — reviewer documents the conditions |
| `rejected` | Output must NOT be acted upon — returned to agent for revision |

---

## Review Record

```json
{
  "review_type": "high_risk_output",
  "trace_id": "trace-<uuid>",
  "reviewer_id": "<reviewer_id>",
  "review_started_at": "ISO 8601",
  "review_completed_at": "ISO 8601",
  "all_12_items_checked": true,
  "failed_items": [],
  "decision": "approved",
  "conditions": null,
  "rejection_reason": null,
  "notes": "<any additional notes>"
}
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 12-item human review gate |
