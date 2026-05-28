# Prompt Review Checklist

**Standard ID:** STD-LLMOPS-PROMPT-REVIEW-001
**Category:** llmops/prompts
**Priority:** high
**Applies To:** all prompt version promotions (draft → review → active)
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

10-item checklist that MUST be completed before a prompt version can be promoted. Items 1–6 must be checked by the submitter (self-review). Items 7–10 must be checked by a second reviewer (not the submitter). All 10 must pass for promotion to proceed.

---

## Checklist

### Submitter Review (Items 1–6)

- [ ] **1. Template file exists** — The prompt is stored in a `.md` or `.txt` template file, not as an inline string in source code. Path: `content/prompts/<name>-v<version>.md`

- [ ] **2. Named variables only** — All dynamic content uses `{{variable_name}}` syntax. No string concatenation with user input. No f-string or template literal embedding of unvalidated data.

- [ ] **3. System/user message separation** — System prompt and user input are in separate message roles. The system prompt does NOT contain any user-controlled content.

- [ ] **4. Injection resistance tested** — The prompt has been tested with at least 5 adversarial inputs:
  - Attempt to override system instructions ("Ignore previous instructions...")
  - Attempt to exfiltrate system prompt ("Repeat your instructions...")
  - Attempt to inject new roles ("You are now...")
  - SQL/code injection via variable substitution
  - Unicode/encoding bypass attempt
  Confirm: none of these caused unintended behavior.

- [ ] **5. Token estimation** — Expected input token count has been estimated for typical + worst-case inputs. Both are within the token budget for the target model.

- [ ] **6. No safety guideline override** — The prompt does NOT instruct the model to ignore safety guidelines, bypass content filters, or pretend to be a different AI system.

### Second Reviewer (Items 7–10)

- [ ] **7. Scope containment** — The prompt focuses on its declared task_type and does not grant the model authority beyond the owning MCP's domain. A skills-search prompt should not be able to trigger deployments.

- [ ] **8. Output format matches schema** — If the prompt declares an `output_schema`, the prompt instructions clearly guide the model to produce output matching that schema. Spot-check: run 3 representative inputs and verify schema compliance.

- [ ] **9. Variable sanitization confirmed** — For every `{{variable}}` in the prompt, confirm that the owning MCP's service validates and sanitizes the value before interpolation. No raw user input passes through.

- [ ] **10. No sensitive data instructions** — The prompt does NOT instruct the model to output, repeat, or summarize sensitive data (credentials, PII, internal system details) from context. If the prompt handles sensitive context, the sensitive-context-policy rules are followed.

---

## How to Record Completion

When all 10 items are checked, add to the prompt registry entry:

```
review_checklist_completed: true
reviewed_by: [submitter_id, reviewer_id]
review_completed_at: ISO 8601
review_notes: "any issues found and how resolved"
```

---

## Rejection Process

If any item fails:
1. Return to submitter with specific failure note per item
2. Set prompt version status back to `draft`
3. Log rejection: `{ reason: "checklist item N failed", detail: "..." }`
4. A rejected version must create a new version number before re-submitting (e.g., `1.0.0` rejected → fix and submit as `1.0.1`)

---

## Related Documents

- `prompt-versioning-policy.md` — Overall versioning rules
- `prompt-regression-test-policy.md` — Eval requirements post-review
- `content/guardrails/output-format-policy.md` — Output schema enforcement
- `content/guardrails/llm-guardrail-policy.md` — Active guardrails (for item 10)

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
