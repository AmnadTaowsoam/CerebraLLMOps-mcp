# Model Change Readiness Checklist

**Standard ID:** STD-LLMOPS-MODEL-READY-001
**Category:** llmops/quality-gates
**Priority:** high
**Applies To:** any model routing policy change
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

8 items that must ALL pass before a model routing change takes effect in production. Model routing changes affect cost, latency, and quality across all agents simultaneously.

---

## Checklist

- [ ] **1. Change proposal approved** — The routing policy change has been submitted as a proposal via the Orchestrator proposal workflow and received platform owner approval. Proposal ID is recorded.

- [ ] **2. Cost impact estimated** — The estimated monthly cost impact of the change has been calculated (see `model-cost-latency-profile.md`). If cost increases > 20%, additional finance approval is required.

- [ ] **3. Latency impact assessed** — The expected latency change has been estimated and compared to SLO targets. If the change moves a task type to a slower model tier, SLO targets have been reviewed.

- [ ] **4. Regression baseline run** — The full 20-case regression suite (`eval-suite-regression-baseline`) has been run against the new routing configuration. Pass rate recorded.

- [ ] **5. Shadow mode completed** — The new routing has been run in shadow mode for 24 hours. Shadow mode metrics (cost, latency, quality) are within acceptable ranges of the production baseline.

- [ ] **6. Fallback chain intact** — The updated routing policy maintains a valid fallback chain for all affected task types. No task type is left without a fallback model.

- [ ] **7. Model registry updated** — If the change introduces a new model, the model has been added to `model-registry.md` with all required fields (capability, cost tier, latency tier, fallback model, status: active).

- [ ] **8. Rollback plan documented** — A rollback plan exists: which policy change to revert, how quickly it can be done, and who is responsible. Rollback SLA: < 10 minutes.

---

## How to Record Completion

```json
{
  "model_change_readiness_completed": true,
  "proposal_id": "proposal-<uuid>",
  "shadow_mode_duration_hours": 24,
  "shadow_mode_cost_delta": "+5%",
  "shadow_mode_latency_delta": "-2%",
  "shadow_mode_pass_rate": 89.0,
  "approved_by": "<platform_owner_id>",
  "effective_at": "ISO 8601"
}
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8-item gate |
