# Prompt Readiness Checklist

**Standard ID:** STD-LLMOPS-PROMPT-READY-001
**Category:** llmops/quality-gates
**Priority:** high
**Applies To:** all prompt version promotions to active
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

10 items that must ALL pass before a prompt version can be promoted from `review` to `active`. This is the final gate before production deployment.

---

## Checklist

- [ ] **1. Review checklist complete** — All 10 items in `prompt-review-checklist.md` have been checked by both submitter and second reviewer. Review checklist status: `review_checklist_completed: true` in the registry.

- [ ] **2. Regression eval passed** — Regression eval (see `prompt-regression-test-policy.md`) has been run and the result is recorded with `status: pass`. `eval_result_id` is present in the prompt registry entry.

- [ ] **3. Pass rate above threshold** — The regression eval `weighted_pass_rate` meets or exceeds the required threshold for this prompt's risk level (80% / 85% / 90%).

- [ ] **4. No weight-1.0 failures** — No critical-weight eval case (weight=1.0) failed in the regression run. Even if the overall pass rate is above threshold, any weight-1.0 failure blocks promotion.

- [ ] **5. Token budget verified** — The prompt has been tested with max-sized inputs and the total token count stays within `max_input_tokens` for the bound model. Budget verification is logged.

- [ ] **6. Model binding confirmed** — The `model_binding` field in the registry matches the model the prompt was evaluated against. If the model changed since authoring, re-run regression on the new model.

- [ ] **7. Output schema validated** — If the prompt declares an `output_schema_id`, at least 5 representative inputs have been tested and the output validated against the schema. All 5 pass.

- [ ] **8. Adversarial inputs tested** — At minimum 5 adversarial inputs were tested (injection override, exfiltration, role injection, SQL/code injection, encoding bypass). None caused unintended behavior.

- [ ] **9. Rollback plan confirmed** — The prior active version of this prompt (if any) is still in `superseded` state and can be re-activated within 5 minutes if needed. Rollback procedure is confirmed with platform team.

- [ ] **10. Promotion approved** — A second reviewer (not the submitter, not the same person who approved review) has explicitly approved the promotion. Approval is logged with `approved_by` and `approved_at`.

---

## How to Record Completion

Add to the prompt registry entry:

```json
{
  "readiness_checklist_completed": true,
  "readiness_checked_by": "<reviewer_id>",
  "readiness_completed_at": "ISO 8601",
  "regression_eval_result_id": "eval-run-<uuid>",
  "promotion_approved_by": "<approver_id>",
  "promotion_approved_at": "ISO 8601"
}
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 10-item gate |
