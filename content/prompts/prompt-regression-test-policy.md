# Prompt Regression Test Policy

**Standard ID:** STD-LLMOPS-PROMPT-REGRESS-001
**Category:** llmops/prompts
**Priority:** high
**Applies To:** all prompt version promotions from review → active
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines when regression evaluation is required for prompt changes, what the pass threshold is, which eval suite binds to each prompt, and what happens when regression fails.

---

## 2. When Regression Eval Is Required

Regression eval is REQUIRED before any prompt version can be promoted from `review` to `active` in the following cases:

| Case | Regression Required | Eval Type |
|------|--------------------|-----------| 
| MAJOR version bump (e.g., 1.x.x → 2.0.0) | YES — mandatory | Full regression (all 20 golden cases) |
| MINOR version bump (new capability added) | YES — mandatory | Full regression |
| PATCH version bump (wording/clarification only) | YES — lightweight | Affected golden cases only (min 5) |
| New prompt (first version, 0.x.x → 1.0.0) | YES — mandatory | Full regression |
| System prompt change (any version component) | YES — mandatory | Full regression + additional agent behavior cases |
| Rollback to prior version | NO — prior version already passed | Skip (prior result reused) |

---

## 3. Pass Threshold

| Prompt Type | Pass Threshold | Human Review Required if Fails? |
|------------|--------------|--------------------------------|
| Task prompt (low/medium risk task_type) | ≥ 80% | No — reject and iterate |
| Task prompt (high risk task_type) | ≥ 85% | Yes — human reviews failure cases |
| System prompt | ≥ 85% | Yes — always |
| Security or DevOps prompt | ≥ 90% | Yes — always |

A "pass" on a single eval case means ALL assertions in that case pass. Partial passes within a case count as failure.

---

## 4. Eval Suite Binding

Each prompt must be bound to an eval suite before promotion. The binding is recorded in the prompt registry as `eval_suite_id`.

| Prompt Category | Default Eval Suite |
|----------------|------------------|
| Knowledge RAG prompts | `eval-suite-knowledge-rag` |
| Security analysis prompts | `eval-suite-security-analysis` |
| Debug/diagnostic prompts | `eval-suite-debug-root-cause` |
| Code generation prompts | `eval-suite-code-generation` |
| Review/proposal prompts | `eval-suite-review-quality` |
| Agent orchestration prompts | `eval-suite-orchestration` |
| General task prompts | `eval-suite-general-task` |

If no specific suite is listed above, use `eval-suite-general-task` plus the regression suite from `content/evaluation/regression-eval-suite.md`.

---

## 5. Regression Eval Execution

### Running Regression

1. Fetch the current golden cases for the bound eval suite
2. For each case: substitute the `input` variables into the new prompt version
3. Execute against the target model (must be the model specified in `model_binding`)
4. Score each case against `expected_output_criteria` and `assertion_type`
5. Calculate `pass_rate = (passed_cases / total_cases) × 100`
6. If `pass_rate ≥ threshold` → PASS
7. If `pass_rate < threshold` → FAIL

### Recording Results

Every regression run MUST be recorded via `llmops_record_eval_result`:

```json
{
  "run_id": "eval-run-uuid",
  "suite_id": "eval-suite-knowledge-rag",
  "prompt_id": "prompt-knowledge-rag-search",
  "prompt_version": "2.1.0",
  "model_id": "claude-sonnet-4-5",
  "pass_rate": 87.5,
  "total_cases": 8,
  "passed_cases": 7,
  "failed_cases": [{ "case_id": "case-003", "failure_reason": "..." }],
  "recommended_decision": "promote",
  "run_at": "2026-05-28T10:00:00Z"
}
```

---

## 6. On Regression Failure

| pass_rate | Action |
|----------|--------|
| < threshold and risk ≤ medium | Return to draft; submitter reviews failed cases |
| < threshold and risk = high | Human review of failed cases required; may proceed after review+fix |
| < threshold and risk = critical | BLOCKED — cannot proceed; platform owner must review |
| Pass rate drops > 10% from prior version | Flag for human review even if above threshold |

### Debugging Failed Cases

1. Review `failed_cases` in the eval result
2. Identify pattern: is it a specific input type that fails? A specific assertion?
3. Fix in the draft version (new PATCH if small fix, MINOR/MAJOR if structural)
4. Re-run regression against the new version
5. Repeat until threshold is met

---

## 7. Regression Suite Maintenance

- New golden cases MAY be added to regression suites at any time (no approval needed)
- Existing golden cases MAY NOT be weakened (lowering assertion weight or removing assertions)
- If a golden case becomes stale (expected behavior has legitimately changed), a platform owner MUST explicitly mark it `superseded` and provide a replacement case
- Regression suites are reviewed quarterly to ensure coverage remains relevant

---

## Related Documents

- `content/evaluation/regression-eval-suite.md` — The 20 baseline golden cases
- `content/evaluation/golden-answer-template.md` — How to add a new golden case
- `content/evaluation/eval-result-template.md` — How to record eval results
- `prompt-review-checklist.md` — Checklist that runs before regression
- `content/quality-gates/prompt-readiness-checklist.md` — Final promotion gate

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
