# Sensitive Context Policy

**Standard ID:** STD-LLMOPS-SENSITIVE-CONTEXT-001
**Category:** llmops/context
**Priority:** critical
**Applies To:** all LLM context assembly
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines what sensitive data must NEVER enter LLM context, how sensitive data is detected, and what happens when it is detected.

This policy is enforced as a mandatory guardrail before every LLM call.

---

## 2. Categories of Sensitive Data

### 2.1 Category A — Absolutely Forbidden (Block Call)

If any of the following are detected in the assembled context, the LLM call is blocked immediately:

| Data Type | Examples | Detection Method |
|-----------|---------|----------------|
| API keys / tokens | `sk-...`, `Bearer eyJ...`, `AKIA...` | Regex pattern match |
| Private keys / certificates | `-----BEGIN RSA PRIVATE KEY-----` | Regex pattern match |
| Database connection strings | `postgresql://user:password@...` | Regex pattern match |
| Passwords in clear text | `password: "..."` in YAML/JSON | Pattern + context analysis |
| JWT secret / signing keys | `JWT_SECRET=...` | Pattern match |
| OAuth client secrets | `client_secret: ...` | Pattern match |

**Action:** Block call. Return `{ "blocked": true, "reason": "SENSITIVE_DATA_DETECTED", "category": "credentials" }`. Log the detection (not the content). Emit `security_violation` gap signal.

### 2.2 Category B — PII (Block or Scrub)

| Data Type | Examples | Action |
|-----------|---------|--------|
| Full name + email combination | `John Smith <john@example.com>` | Scrub + warn |
| Government ID numbers | Social security numbers, passport numbers | Block |
| Financial account numbers | Credit card, bank account | Block |
| Medical records | Diagnosis, treatment, medication | Block |
| Biometric data | Fingerprint hashes, face recognition data | Block |
| Precise geolocation | GPS coordinates, precise address | Scrub + warn |
| Email address (standalone) | `user@domain.com` | Scrub if not task-relevant |

**Action for Block:** Same as Category A.
**Action for Scrub:** Replace with `[REDACTED:PII]`. Log the scrub. Continue the call with scrubbed context.

### 2.3 Category C — Internal System Sensitive (Warn + Log)

| Data Type | Examples | Action |
|-----------|---------|--------|
| Internal IP addresses | `10.x.x.x`, `192.168.x.x` | Log + warn |
| Internal hostnames | `cerebra-auth.internal` | Log + warn |
| Internal port numbers in stack traces | `:5432`, `:6379` | Log |
| Tenant data from a different tenant | Any data with wrong `tenant_id` | Block + alert |

**Action:** Allow the call but log a warning. The trace records `sensitive_context_detected: true` with category `internal_system`.

---

## 3. Detection Process

Sensitive context detection runs as a pre-call guardrail in this order:

```
1. Assemble raw context (documents + code + graph nodes)
2. Run regex pattern scanner (Category A + B)
   → If Category A match: BLOCK immediately
   → If Category B match: SCRUB and continue
3. Run semantic PII scanner (Category B patterns that regex misses)
   → If PII detected: SCRUB and continue
4. Run tenant isolation check (Category C)
   → If wrong tenant data: BLOCK immediately
   → If internal system data: LOG and continue
5. Context is clean → proceed to LLM call
```

---

## 4. Handling LLM Outputs

The sensitive context policy also applies to LLM outputs:

1. After the LLM response is received, run the same Category A + B scanner on the output
2. If Category A content appears in the output (model invented or echoed credentials): block delivery, flag as `hallucination_security`
3. If Category B content appears in the output: scrub before delivery, log
4. If output appears to have been prompted to reveal sensitive data: block + escalate

---

## 5. Audit Requirements

Every sensitive context detection event MUST be logged with:

```json
{
  "event": "sensitive_context_detected",
  "category": "credentials | pii | internal_system",
  "action": "blocked | scrubbed | warned",
  "source": "knowledge_doc | code_node | user_input | llm_output",
  "agent_id": "...",
  "task_id": "...",
  "tenant_id": "...",
  "detected_at": "ISO 8601"
}
```

The CONTENT of the detected sensitive data is NOT logged — only the category and source.

---

## 6. Exceptions

There are NO exceptions to Category A blocking. Credentials and private keys never enter LLM context under any circumstances.

For Category B, the platform owner may configure specific fields as task-relevant (e.g., email is expected in a contact management workflow). This must be documented in the tenant configuration with a justification.

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 3 sensitivity categories |
