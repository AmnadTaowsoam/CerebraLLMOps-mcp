# Golden Answer Template

**Standard ID:** STD-LLMOPS-GOLDEN-TEMPLATE-001
**Category:** llmops/evaluation
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

Template for documenting a new golden eval case. Fill in all fields before adding to a regression or eval suite.

---

## Template

```markdown
### GC-XXX: <Short Descriptive Name>

**Suite:** <suite_id>
**Task type:** <task_type from model-routing-policy.md>
**Risk:** low | medium | high | critical
**Added by:** <author_id>
**Added at:** <ISO date>
**Rationale:** <Why this case was added — what failure or gap prompted it?>

**Input:**
<Exact input or prompt variable values that will be used. Be specific — vague inputs produce vague expected outputs.>

**Context (if relevant):**
<If this case requires specific retrieved documents or graph nodes, describe what should be in the context.>

**Expected output criteria:**
<What must be true about the output. Use declarative statements:>
- Output MUST contain: <...>
- Output MUST NOT contain: <...>
- Output schema MUST validate against: <schema_id or "none">
- Output MUST cite: <specific source IDs if applicable>
- Output MUST flag: <specific issue if applicable>

**Assertion type:**
output_contains | output_not_contains | citation_present | citation_in_context |
schema_valid | escalation_triggered | behavior_unchanged | does_not_call_forbidden_tool |
sensitive_data_not_echoed | standard_id_exists | node_id_in_context | custom:<description>

**Weight:** 0.0–1.0
(1.0 = critical, must pass; 0.8–0.9 = important; 0.5–0.7 = moderate)

**Failure mode documented:** YES | NO
(If YES, describe what a failing output typically looks like — helps reviewers spot edge cases)

**Linked failure pattern:** <failure_pattern_registry entry ID, if this case was created after a real failure>
```

---

## Example (Filled)

```markdown
### GC-021: Knowledge RAG — Citation Required for Policy Claim

**Suite:** eval-suite-knowledge-rag
**Task type:** knowledge_retrieval
**Risk:** medium
**Added by:** platform-owner
**Added at:** 2026-05-28
**Rationale:** GC-002 tests that JWT content is correct, but doesn't verify citation is present. Two real incidents where agents made JWT claims without citing sources.

**Input:**
"What signing algorithm does CerebraMCP use for JWTs?"

**Context:**
Retrieved: knowledge-article-auth-jwt-001 (contains: "RS256 is mandatory per STD-AUTH-JWT-TOKEN-001")

**Expected output criteria:**
- Output MUST contain: "RS256"
- Output MUST cite: knowledge-article-auth-jwt-001 or std-auth-jwt-token
- Output MUST NOT claim a different algorithm (HS256, HS512, etc.)
- Output MUST NOT state RS256 without citing a source

**Assertion type:** citation_present + output_contains

**Weight:** 0.95

**Failure mode documented:** YES
Typical failure: model states "RS256" without any citation. Output is factually correct but ungrouped — no audit trail for why the claim was made.

**Linked failure pattern:** FP-RAG-NO-CITATION
```

---

## Adding a Case to a Suite

1. Fill in the template above
2. Assign the next `GC-NNN` number in sequence
3. Add to the appropriate suite file
4. Update the suite's `Golden Case Count` in the header
5. Run the new case against the current production agent/prompt to verify the expected behavior is already met (i.e., this is a regression guard, not a new requirement)
6. If the current production version fails the new case, document it as a known failure and create an improvement backlog item

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial template |
