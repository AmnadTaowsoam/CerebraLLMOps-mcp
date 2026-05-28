# RAG Context Policy

**Standard ID:** STD-LLMOPS-RAG-CONTEXT-001
**Category:** llmops/context
**Priority:** high
**Applies To:** all knowledge_retrieval and rag_grounding task types
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines grounding requirements for RAG (Retrieval-Augmented Generation) outputs. All LLM outputs that reference knowledge base content must be grounded — they must cite the source documents used.

---

## 2. Grounding Requirements

### When Grounding Is Required

Grounding (source citation) is REQUIRED for:

| Condition | Grounding Level |
|-----------|----------------|
| task_type = `knowledge_retrieval` | Full citation (document ID + section) |
| task_type = `rag_grounding` | Full citation |
| Output contains factual claims about Cerebra system behavior | Standard citation |
| Output references a Standard, policy, or rule | Reference the Standard ID |
| Output references a specific graph node | Reference the node_id |
| Output makes a recommendation based on retrieved content | Cite the retrieved source |

### When Grounding Is Not Required

- Creative generation tasks (no factual retrieval involved)
- Purely structural tasks (formatting, schema validation)
- Tasks where the output is generated entirely from the input context (no external retrieval)

---

## 3. Citation Format

Citations must follow this format in the output:

```
[Source: <document_id>, section: "<section_name>"]
```

Examples:
- `[Source: knowledge-article-auth-001, section: "JWT Token Structure"]`
- `[Source: STD-AUTH-JWT-TOKEN-001]`
- `[Source: graph-node: std-backend-api-design]`

For multiple sources:
```
This recommendation is based on:
- [Source: knowledge-article-001, section: "Overview"]
- [Source: knowledge-article-003, section: "Error Handling"]
```

---

## 4. Hallucination Prevention Rules

1. **MUST NOT invent knowledge article IDs** — only cite documents that were actually retrieved and included in context
2. **MUST NOT synthesize** new factual claims by combining source documents without explicitly noting the inference
3. **MUST flag uncertainty** when the retrieved sources do not fully address the question: `"Based on available sources, ... [Note: this inference may need verification]"`
4. **MUST NOT claim** a Standard, rule, or policy exists if it was not retrieved and explicitly present in context

---

## 5. Minimum Retrieval Quality

Before RAG output is delivered, the retrieved documents must meet:

| Metric | Minimum | Action if Fails |
|--------|---------|----------------|
| Minimum relevance score | 0.65 | Discard document; note "no high-relevance sources found" |
| Minimum number of relevant documents | 1 | If 0 found: respond with "No relevant knowledge found — answer based on training data only" |
| Source documents accessible | All cited must be in context | Remove citation if document was not actually retrieved |

---

## 6. Grounding Eval

The `eval-suite-knowledge-rag` includes grounding checks:
- Does the output cite at least 1 source for each factual claim?
- Are all cited document IDs real (present in the retrieved context)?
- Does the output avoid making claims not supported by the sources?

Grounding failures cause the eval to fail for the corresponding case.

---

## 7. Citation Grounding in Production

At inference time (not eval), citation grounding is checked by the `citation-grounding-policy.md` guardrail:
- Extracts all `[Source: ...]` citations from the output
- Verifies each cited document_id was present in the assembled context
- Invalid citations → strip and log a `hallucination_detected` flag in the trace

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
