# Eval Result Template

**Standard ID:** STD-LLMOPS-EVAL-RESULT-TEMPLATE-001
**Category:** llmops/evaluation
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

Template for recording evaluation run results. Used for both automated eval runs and human review sessions. Stored in `llmops.eval_results` table.

---

## Template (JSON)

```json
{
  "run_id": "eval-run-<uuid>",
  "suite_id": "eval-suite-<name>",
  "triggered_by": "version_promotion | per_run_automated | periodic_baseline | on_demand",
  "trigger_details": {
    "prompt_id": "<if triggered by prompt version change>",
    "prompt_version": "<new version being evaluated>",
    "agent_id": "<if triggered by agent instruction change>",
    "instruction_version": "<new version>",
    "run_id_ref": "<if triggered by a specific LLM run>"
  },
  "model_id": "claude-sonnet-4-5",
  "agent_id": "agent-knowledge",
  "tenant_id": "default",
  "run_at": "2026-05-28T10:00:00Z",
  "run_duration_ms": 12340,
  "total_cases": 20,
  "passed_cases": 17,
  "failed_cases": [
    {
      "case_id": "GC-011",
      "case_name": "Hallucination Guard — Unknown Entity",
      "failure_reason": "Model described features of non-existent CerebraFinance-mcp",
      "actual_output_excerpt": "[first 200 chars of actual output]",
      "expected": "Model should have said it has no information",
      "weight": 1.0
    }
  ],
  "weighted_pass_rate": 87.5,
  "pass_threshold": 85.0,
  "status": "pass",
  "recommended_decision": "promote | reject | review",
  "human_review_required": false,
  "human_review_completed": null,
  "human_reviewer_id": null,
  "human_review_result": null,
  "human_review_notes": null,
  "feedback_submitted": true,
  "feedback_id": "feedback-<uuid>",
  "metadata": {
    "context_tokens_used": 14200,
    "eval_model_id": "claude-haiku-3-5",
    "eval_cost_usd": 0.02
  }
}
```

---

## Field Definitions

| Field | Required | Description |
|-------|---------|-------------|
| `run_id` | YES | Unique UUID for this eval run |
| `suite_id` | YES | Which eval suite was run |
| `triggered_by` | YES | What caused this eval run |
| `total_cases` | YES | Number of cases in the suite |
| `passed_cases` | YES | Number of cases that passed |
| `failed_cases` | YES | List of failed cases with details |
| `weighted_pass_rate` | YES | Pass rate (0–100) weighted by case weights |
| `pass_threshold` | YES | Minimum required pass rate for this suite + agent |
| `status` | YES | `pass` if weighted_pass_rate ≥ pass_threshold, else `fail` |
| `recommended_decision` | YES | `promote` (pass), `reject` (fail, clear), `review` (borderline) |
| `human_review_required` | YES | Whether human review is required post-eval |
| `human_review_completed` | Conditional | ISO timestamp when human review finished |
| `human_reviewer_id` | Conditional | Who performed human review |
| `human_review_result` | Conditional | `approved` \| `rejected` \| `conditional` |
| `human_review_notes` | Conditional | Reviewer notes |
| `feedback_submitted` | YES | Whether llmops_record_feedback was called for failures |
| `feedback_id` | Conditional | ID of the submitted feedback item |

---

## Status Values

| status | Meaning |
|--------|---------|
| `pass` | `weighted_pass_rate ≥ pass_threshold` — ready to promote or deliver |
| `fail` | Below threshold — block promotion or flag delivery |
| `pending` | Human review not yet complete (for runs requiring human review) |
| `error` | Eval run itself encountered an error (not a test failure) |

---

## Recommended Decision Logic

```
if status = "pass" AND human_review_required = false → "promote"
if status = "pass" AND human_review_required = true AND human_review_completed = null → "review" (pending)
if status = "pass" AND human_review_result = "approved" → "promote"
if status = "pass" AND human_review_result = "rejected" → "reject"
if status = "fail" AND weighted_pass_rate ≥ threshold - 5 → "review" (borderline)
if status = "fail" AND weighted_pass_rate < threshold - 5 → "reject"
```

---

## Markdown Reporting Format

For PR descriptions and ticket evidence:

```markdown
### Eval Run: <suite_id>
- **Run ID:** eval-run-<uuid>
- **Triggered by:** version_promotion (prompt-knowledge-rag-search v2.1.0)
- **Date:** 2026-05-28
- **Model:** claude-sonnet-4-5
- **Cases:** 20 total, 17 passed, 3 failed
- **Weighted pass rate:** 87.5% (threshold: 85%)
- **Status:** PASS
- **Recommended decision:** promote

**Failed cases:**
| Case | Weight | Failure Reason |
|------|--------|---------------|
| GC-011 | 1.0 | Model described non-existent MCP |
| GC-013 | 0.8 | Used 10 sources instead of max 8 |
| GC-017 | 0.8 | Did not suggest gap signal |

**Human review:** Not required
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial template |
