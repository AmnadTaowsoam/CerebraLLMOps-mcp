# Agent Readiness Checklist

**Standard ID:** STD-LLMOPS-AGENT-READY-001
**Category:** llmops/quality-gates
**Priority:** critical
**Applies To:** all agent instruction version promotions to active
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

10 items that must ALL pass before an agent instruction version can be promoted to active. Agent changes are higher-risk than prompt changes — an agent's instructions govern ALL its tasks, not just one.

---

## Checklist

- [ ] **1. Versioning policy followed** — The version number follows semver rules from `agent-versioning-policy.md`. MAJOR bump for permission/role changes, MINOR for new capability, PATCH for clarification.

- [ ] **2. Change request approved** — The change request has been reviewed and approved per the process in `agent-versioning-policy.md`. For MAJOR changes to critical-risk agents: `nottoei` personal approval required.

- [ ] **3. Impact analysis complete** — For MINOR or MAJOR changes: impact analysis has been performed (affected task_types, integrated prompts, eval suites). Analysis is documented and attached to the change request.

- [ ] **4. Regression eval passed** — The agent's bound eval suite + `eval-suite-agent-behavior` (AB-001 through AB-010) have been run against the new instruction version. Both suites pass.

- [ ] **5. Pass rate above threshold** — `weighted_pass_rate ≥ threshold` (80% medium, 85% high, 90% critical). No weight-1.0 case may fail.

- [ ] **6. Self-modification prohibition checked** — The new instruction set does NOT instruct the agent to modify its own instructions, system prompt, or version numbers. Verified by second reviewer.

- [ ] **7. Tool permissions validated** — The `allowed_tools` and `forbidden_tools` lists in the new instruction version are correct for the agent's role. Any additions to `allowed_tools` require an additional approval.

- [ ] **8. Escalation triggers present** — All 8 human escalation triggers from `agent-behavior-policy.md` are explicitly encoded in the new instructions. Reviewer has verified each trigger is present.

- [ ] **9. System prompt synchronized** — If the agent instruction change requires a corresponding system prompt update, the system prompt version has also been updated and promoted (they should be promoted together atomically).

- [ ] **10. Rollback verified** — The prior active instruction version is confirmed available for rollback. Rollback can be completed within 5 minutes. Rollback test has been run in staging (for critical-risk agents).

---

## Critical-Risk Agent Additional Items

For `agent-orchestrator`, `agent-security`, `agent-devops`:

- [ ] **11.** `nottoei` has personally reviewed and signed off
- [ ] **12.** Staging environment soak for 24 hours with no incidents
- [ ] **13.** Post-deployment monitoring plan in place (who watches? for how long?)

---

## How to Record Completion

```json
{
  "agent_readiness_checklist_completed": true,
  "readiness_checked_by": "<reviewer_id>",
  "readiness_completed_at": "ISO 8601",
  "regression_eval_result_id": "eval-run-<uuid>",
  "promotion_approved_by": "<approver_id>",
  "nottoei_approval_required": true,
  "nottoei_approved_at": "ISO 8601"
}
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 10+3 items for critical agents |
