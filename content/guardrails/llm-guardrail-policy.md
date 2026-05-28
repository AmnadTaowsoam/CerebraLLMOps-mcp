# LLM Guardrail Policy

**Standard ID:** STD-LLMOPS-GUARDRAIL-001
**Category:** llmops/guardrails
**Priority:** critical
**Applies To:** all managed LLM runs
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Master guardrail document. Lists all active guardrails, their trigger conditions, enforcement actions, and which guardrail level activates them.

---

## 2. Guardrail Levels

| Level | Guardrails Active |
|-------|-----------------|
| `standard` | G-01, G-02, G-03 |
| `strict` | G-01 through G-06 |
| `maximum` | G-01 through G-09 |

---

## 3. Active Guardrails

### G-01: Sensitive Context Scan (All Levels)

**Type:** Pre-call
**Trigger:** Context assembly complete
**Check:** Scan assembled context for credentials, private keys, PII (Categories A, B from `sensitive-context-policy.md`)
**Action on trigger:**
- Category A (credentials/keys): BLOCK call immediately, return error
- Category B (PII): SCRUB and continue, log warning
**Cannot be disabled.**

---

### G-02: Output Schema Validation (All Levels)

**Type:** Post-call
**Trigger:** LLM response received; task declared `output_schema_id`
**Check:** Validate response JSON against declared schema
**Action on trigger:**
- First failure: retry once with explicit schema prompt
- Second failure: return error to caller; log `schema_validation_failure`
**Disable condition:** Only if `output_schema_required: false` in context package.

---

### G-03: PII Scan — Output (All Levels)

**Type:** Post-call
**Trigger:** LLM response received
**Check:** Scan output for PII patterns (Category B from `sensitive-context-policy.md`)
**Action on trigger:** SCRUB PII from output, log `pii_detected_in_output`, continue delivery with scrubbed output.

---

### G-04: Citation Grounding Check (Strict + Maximum)

**Type:** Post-call
**Trigger:** RAG task or output contains `[Source: ...]` citations
**Check:** Every cited document_id must be present in `documents_used` list for this run
**Action on trigger:** Remove invalid citations from output, log `invalid_citation_detected`; if > 50% of citations are invalid: block delivery, flag as `hallucination_risk`.

---

### G-05: Tool Permission Check (Strict + Maximum)

**Type:** At tool-call time
**Trigger:** Agent attempts to call a tool
**Check:** Tool ID must be in `allowed_tools` for this agent's context package
**Action on trigger:** DENY the tool call, return permission error to agent, log `forbidden_tool_attempt`.

---

### G-06: Output Content Filter (Strict + Maximum)

**Type:** Post-call
**Trigger:** LLM response received, guardrail_level = strict or maximum
**Check:** Output does not contain: instructions to bypass safety guidelines, role-modification injections, capability-expansion claims
**Action on trigger:** Block delivery, flag as `output_content_violation`, escalate to human review.

---

### G-07: Human Escalation Pre-check (Maximum Only)

**Type:** Pre-call
**Trigger:** task_type = deployment, security_analysis, agent_instruction_change
**Check:** Is there a human reviewer designated and available for this task?
**Action on trigger if no reviewer:** Queue task; notify platform owner; do NOT proceed without reviewer assignment.

---

### G-08: Multi-Tenant Isolation Check (Maximum Only)

**Type:** Pre-call
**Trigger:** Context assembly
**Check:** All context documents and graph nodes have `tenant_id` matching the current run's `tenant_id`
**Action on trigger:** BLOCK call; log `tenant_isolation_violation`; alert `nottoei` immediately.

---

### G-09: Self-Modification Attempt Detection (Maximum Only)

**Type:** Post-call
**Trigger:** Output analysis
**Check:** Output does not contain instructions to modify the agent's own system prompt, instructions, or version
**Action on trigger:** Block delivery, log `self_modification_attempt`, escalate to platform owner immediately.

---

## 4. Guardrail Level Assignment

| Risk Level | Guardrail Level |
|-----------|----------------|
| `low` | standard |
| `medium` | standard |
| `high` | strict |
| `critical` | maximum |

---

## 5. Guardrail Override

Only `nottoei` may override a guardrail. Override requires:
1. Emergency declaration with reason
2. Time bound (maximum 4 hours)
3. Immediate post-override review
4. Audit log entry

**G-01 (Sensitive Context Scan) and G-08 (Multi-Tenant Isolation) CANNOT be overridden under any circumstances.**

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 9 guardrails across 3 levels |
