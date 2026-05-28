# Output Format Policy

**Standard ID:** STD-LLMOPS-OUTPUT-FORMAT-001
**Category:** llmops/guardrails
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines requirements for schema validation of LLM outputs. When a task declares an output schema, the output MUST conform. This policy defines the retry and escalation process.

---

## 2. When Output Schema Validation Is Required

Schema validation is required when any of the following are true:

1. The task's skill definition declares an `output_schema_id`
2. The caller includes `output_schema_required: true` in the request
3. The task type is: `code_generation`, `review`, `proposal_evaluation`, `security_analysis`, `deployment`
4. The LLMOpsContextPackage has `output_schema_required: true`

---

## 3. Validation Process

```
LLM response received
       |
       v
Parse response as JSON
  → If parsing fails: record schema_validation_failure (parse_error)
       |
       v
Validate against JSON Schema (output_schema_id)
  → If validation fails: record schema_validation_failure (validation_error)
       |
       v
If validation passes → deliver output
```

---

## 4. On Validation Failure

### First Failure — Retry

Retry once with an explicit schema reminder appended to the prompt:

```
[SCHEMA CORRECTION REQUIRED: Your previous response did not match the required output schema.
Required schema: {schema_id}
Please reformat your response to match this schema exactly.
Do not include any text outside the JSON object.]
```

Record `retry_attempted: true` in the trace.

### Second Failure — Escalate

If the retry also fails:
- For `low/medium` risk: return error to caller with: `{ "error": "schema_validation_failure", "schema_id": "...", "attempts": 2, "validation_errors": [...] }`
- For `high/critical` risk: block output, require human review, alert platform team

### Persistent Failure Pattern

If schema validation fails > 3 times for the same `prompt_id + schema_id` combination within 7 days:
- Flag as `schema_mismatch_pattern` in the failure pattern registry
- Create improvement backlog item: review the prompt's output format instructions
- Reduce the schema validation retry count to 1 (prevent wasted API calls on a broken prompt)

---

## 5. Common Schema Validation Issues

| Issue | Typical Cause | Fix |
|-------|-------------|-----|
| Required field missing | Prompt doesn't list all required fields | Add field list to prompt |
| Wrong field type | Prompt says "list" but model returns string | Clarify type in prompt |
| Extra fields present | Model adds explanatory fields | Instruct "no extra fields" |
| Nested structure wrong | Schema nesting not explained clearly | Add example JSON to prompt |
| Array of wrong type | Confusion about array element type | Provide array example |

---

## 6. Schema Registry

Schemas are stored in `schemas/` directory and referenced by `schema_id`. All schemas use JSON Schema draft-07.

| schema_id | File | Used By |
|-----------|------|--------|
| `prompt-metadata` | `schemas/prompt-metadata.schema.json` | Prompt registry validation |
| `eval-case` | `schemas/eval-case.schema.json` | Eval case authoring |
| `eval-result` | `schemas/eval-result.schema.json` | Eval result recording |
| `llm-trace` | `schemas/llm-trace.schema.json` | Trace recording |
| `feedback` | `schemas/feedback.schema.json` | Feedback submission |
| `llmops-context-package` | `schemas/llmops-context-package.schema.json` | Orchestrator context package |

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
