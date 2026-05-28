# Model Selection Matrix

**Standard ID:** STD-LLMOPS-MODEL-SELECT-001
**Category:** llmops/models
**Priority:** medium
**Applies To:** routing decision explanation and debugging
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

Provides detailed per-task routing decisions with reasoning, supplementing the `model-routing-policy.md` decision matrix. Use this document when debugging why a specific model was selected or when designing new task types.

---

## Detailed Selection Reasoning

### `skills_retrieval` — Low/Medium Risk → `claude-haiku-3-5`

Skills retrieval is a structured lookup against an indexed dataset. The task requires speed, not deep reasoning. Haiku's fast latency (< 500ms p50) makes it ideal. The output format is deterministic (JSON schema).

**When to override to sonnet:** If the retrieval requires multi-hop reasoning (e.g., "find skills that compose well with skill X for task Y"), use sonnet for medium+ risk.

---

### `knowledge_retrieval` (RAG) — Medium+ Risk → `claude-sonnet-4-5`

RAG tasks require the model to synthesize multiple retrieved documents into a coherent, grounded response. Sonnet provides the balance of comprehension depth and reasonable latency.

**When to use opus:** If the knowledge domain is highly technical and errors in synthesis would have significant consequences (e.g., security policy synthesis), use opus.

---

### `code_generation` — Medium+ Risk → `claude-opus-4`

Code generation for CerebraMCP is always high-impact because generated code may be deployed. Opus-4 provides the highest code quality, security awareness, and error handling correctness. Sonnet is acceptable for low-stakes scaffolding (not directly deployed), but opus is preferred for anything that will run in production.

**Exception:** Simple boilerplate generation (config files, type stubs) may use sonnet.

---

### `security_analysis` — Medium+ Risk → `claude-opus-4`

Security analysis requires maximum precision. False negatives (missed vulnerabilities) are worse than false positives. Opus-4's stronger reasoning reduces false negative rate. Even medium-risk security checks use opus because the cost of a missed vulnerability far exceeds the API cost difference.

---

### `root_cause_analysis` — Medium+ Risk → `claude-opus-4`

Root cause analysis for production incidents requires:
- Multi-step causal reasoning across system logs
- Distinguishing correlation from causation
- Generating actionable hypotheses ranked by probability

Opus-4's extended reasoning depth is required. Sonnet-4-5 is used for low-risk (non-production) debugging.

---

### `deployment` — Medium+ Risk → `claude-opus-4`

Deployment decisions are irreversible in the short term. Even a "simple" deployment may have unforeseen consequences. Opus-4 is required for all deployment readiness checks and approval generation. The cost premium is acceptable given the blast radius of a wrong deployment decision.

---

### `compose_learning` — All Risks → `claude-sonnet-4-5` (critical → `claude-opus-4`)

The Orchestrator's compose_learning call coordinates across 8 MCPs and must synthesize diverse context efficiently. Sonnet-4-5 handles this well. Opus is reserved for critical-risk compositions where the orchestration involves security or deployment decisions.

---

### `standards_check` — Low/Medium → `claude-haiku-3-5`

Standards compliance checks are pattern-matching against known rules. Haiku is fast and cost-effective for this. Rules are deterministic (either the code matches the standard or it doesn't), so deep reasoning is not required.

**When to use sonnet:** If the check requires interpreting ambiguous code patterns against standard intent (not literal matching), use sonnet.

---

### `emergency_override` — All → `claude-opus-4`

Emergency overrides require maximum caution, clear reasoning, and thorough impact assessment. Only opus-4 is authorized for emergency override decision support. No exceptions.

---

## New Task Type Registration

When adding a new task_type to the system:

1. Determine the typical output structure (schema)
2. Determine the expected reasoning depth needed
3. Determine the blast radius if the output is wrong
4. Select default model from the matrix above based on these factors
5. Add the task_type row to `model-routing-policy.md`
6. Document reasoning in this file

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8 task types documented with detailed reasoning |
