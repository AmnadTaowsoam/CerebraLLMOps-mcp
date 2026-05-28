# LLMOps Release Readiness Checklist

**Standard ID:** STD-LLMOPS-RELEASE-READY-001
**Category:** llmops/quality-gates
**Priority:** critical
**Applies To:** any LLMOps policy or registry change released to production
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

15 items that must ALL pass before any LLMOps policy, registry, or routing change is released. This is the broadest gate — it applies to the LLMOps service itself, not individual prompts or agents.

---

## Checklist

### Policy & Registry Changes (Items 1–5)

- [ ] **1. Change is documented** — The change is documented in a ticket or PR with: what is changing, why, who requested it, and what the rollback plan is.

- [ ] **2. Proposal workflow completed** — For non-trivial changes: an Orchestrator proposal has been created, reviewed, and approved. Proposal ID is recorded.

- [ ] **3. Governance rules followed** — The change has been authorized by the appropriate party per `llmops-governance.md`. Permission matrix has been checked.

- [ ] **4. Affected registries updated consistently** — If a model is added, model-registry, routing policy, cost profile, and fallback policy are ALL updated. No partial updates.

- [ ] **5. Audit log entry planned** — The change will generate a complete audit log entry with all required fields (actor, action, target, old value, new value, reason).

### Testing & Validation (Items 6–10)

- [ ] **6. Regression suite passes** — The full 20-case regression suite has been run against the new configuration. `weighted_pass_rate ≥ 80%`. Result ID recorded.

- [ ] **7. No critical case failures** — No weight=1.0 regression case failed (GC-006, GC-009, GC-011, GC-012, GC-015, GC-018).

- [ ] **8. Eval suite consistency** — All agent-bound eval suites still pass against the new configuration. No agent's pass rate dropped > 5 percentage points.

- [ ] **9. Cost impact within bounds** — Estimated cost delta from this change is within ±20% of current baseline. If outside: additional approval required.

- [ ] **10. Latency impact within SLO** — Estimated latency impact does not cause SLO breaches for any agent or task type.

### Deployment Safety (Items 11–15)

- [ ] **11. Shadow mode completed** — For routing policy changes: shadow mode ran for ≥ 24 hours with acceptable metrics.

- [ ] **12. Rollback tested** — A rollback to the prior configuration has been tested (in staging) and confirmed to work within the 10-minute rollback SLA.

- [ ] **13. Alert thresholds reviewed** — Alert thresholds in `alerting-policy.md` are still appropriate after this change. If the change alters baseline costs or latency, alert thresholds have been updated accordingly.

- [ ] **14. Documentation updated** — All relevant Markdown files in this MCP have been updated to reflect the change. `llmops-index.md` still accurately describes all files.

- [ ] **15. Platform owner sign-off** — The platform owner has personally reviewed and approved this checklist. Sign-off timestamp recorded.

---

## Release Record

```json
{
  "release_id": "llmops-release-<uuid>",
  "change_type": "model_routing_policy | prompt_version | agent_instruction | guardrail | eval_suite | observability",
  "change_description": "<one-line summary>",
  "proposal_id": "<uuid or null>",
  "all_15_items_checked": true,
  "failed_items": [],
  "platform_owner_approved_by": "<approver_id>",
  "platform_owner_approved_at": "ISO 8601",
  "effective_at": "ISO 8601",
  "rollback_plan": "<brief description>",
  "rollback_by": "<who is responsible>",
  "monitoring_plan": "<who watches, for how long, what signals>"
}
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 15-item release gate |
