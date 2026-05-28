# Prompt Versioning Policy

**Standard ID:** STD-LLMOPS-PROMPT-VERSION-001
**Category:** llmops/prompts
**Priority:** critical
**Applies To:** all prompt registrations and updates
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines how prompt templates and system prompts are versioned, promoted, rolled back, and retired in CerebraMCP. This policy is the implementation of the `STD-AI-PROMPT-VERSION-001` standard referenced in CerebraStandards-mcp.

---

## 2. Semantic Versioning Rules

All prompts use **semantic versioning** (`MAJOR.MINOR.PATCH`):

| Version Component | When to Increment | Examples |
|------------------|------------------|---------|
| `MAJOR` | Fundamental purpose or structure change; breaking change to expected output format | `1.x.x → 2.0.0` |
| `MINOR` | New capability added (new variable, new instruction block) without breaking existing behavior | `1.2.x → 1.3.0` |
| `PATCH` | Clarification, typo fix, minor wording improvement with no behavioral change | `1.2.0 → 1.2.1` |

### Rules

1. Version `0.x.x` indicates a draft prompt — not yet production-approved
2. First production version MUST be `1.0.0`
3. Once a version is promoted to `active`, its number is frozen — it cannot be reused or modified
4. Version numbers are always three-part integers (no pre-release suffixes in the registry)

---

## 3. Promotion States

```
draft → review → active
                      ↘ superseded (when a newer version becomes active)
         ↑
         └── rejected (from review — must restart as new draft)
```

| State | Meaning | Editable? |
|-------|---------|-----------|
| `draft` | Work in progress — not yet in review | YES — freely editable |
| `review` | Under review — no changes allowed | NO |
| `active` | Production version — immutable | NO |
| `superseded` | Prior active — retained for rollback | NO |
| `rejected` | Failed review — cannot be re-promoted | NO — must create new draft |

---

## 4. Immutability Rule

**A prompt version in `active` state is immutable.** Once active:

- The prompt template text cannot be changed
- The variable bindings cannot be changed
- The model binding cannot be changed

If any change is needed, a new version MUST be registered. The prior version is moved to `superseded` when the new version is promoted to `active`.

**Enforcement:** The `llmops` schema in Postgres uses a `CHECK` constraint that prevents `UPDATE` operations on rows where `status = 'active'`. Any attempt to directly modify an active prompt version will fail at the database layer.

---

## 5. Quality Gate Before Promotion

No prompt version may be promoted from `draft` to `review` without passing:

1. The prompt review checklist (see `prompt-review-checklist.md`) — all 10 items
2. Manual adversarial input test by the submitter

No prompt version may be promoted from `review` to `active` without passing:

1. Approval from a second reviewer (not the submitter)
2. Regression eval (see `prompt-regression-test-policy.md`) with result ≥80%

---

## 6. Rollback Naming

When rolling back to a prior version:

1. The prior `superseded` version does NOT get a new version number
2. The rollback action sets the target version back to `active`
3. The current `active` version is set to `superseded`
4. The rollback is logged with: `reason`, `initiated_by`, `timestamp`, `target_version`

**Example:** Active is `2.1.0`, rollback target is `2.0.0`:
- `2.1.0` → `superseded`
- `2.0.0` → `active`
- Log: `{ action: "rollback", from: "2.1.0", to: "2.0.0", reason: "..." }`

---

## 7. Deprecation Policy

When a prompt is no longer needed:

1. Submit a deprecation proposal with: reason, affected task_types, migration plan
2. Platform owner approves
3. Status set to `deprecated` — prompt is no longer selectable for new runs
4. After 30-day grace period: status set to `archived` — prompt is read-only history
5. Archived prompts are never deleted

---

## 8. Forbidden Actions

- Editing a prompt in `active` or `superseded` state
- Re-using a version number that was previously rejected
- Promoting a prompt with failing eval (eval_result = fail)
- Promoting a prompt without passing the review checklist
- Deploying a prompt version that was never reviewed (skipping the review state)

---

## 9. Related Documents

- `prompt-review-checklist.md` — 10-item review gate
- `prompt-regression-test-policy.md` — Eval requirements
- `system-prompt-registry.md` — System prompts (stricter promotion)
- `llmops-governance.md` — Permission matrix for who can promote

## 10. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
