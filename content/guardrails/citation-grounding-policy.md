# Citation Grounding Policy

**Standard ID:** STD-LLMOPS-CITATION-GROUND-001
**Category:** llmops/guardrails
**Priority:** high
**Applies To:** all RAG and knowledge retrieval outputs
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the citation grounding guardrail (G-04). Ensures that citations in LLM outputs are genuine — they reference documents that were actually retrieved and included in context, not invented by the model.

---

## 2. Citation Grounding Check

The grounding guardrail runs post-call on any output that contains `[Source: ...]` patterns.

### Step 1: Extract Citations

Extract all citation references from the output:
- Pattern: `\[Source:\s*([^\]]+)\]`
- Match: document IDs, knowledge article IDs, standard IDs, graph node IDs

### Step 2: Verify Against Context

For each extracted citation:
1. Check if the cited ID appears in `documents_used` (for knowledge documents)
2. Check if the cited ID appears in `graph_nodes_used` (for graph nodes)
3. Check if the cited Standard ID exists in the Standards registry (`std-*` node IDs)

### Step 3: Enforcement

| Verification Result | Action |
|--------------------|--------|
| All citations verified | Pass — deliver output unchanged |
| 1–2 invalid citations (< 30% of total) | Remove invalid citations from output; log `invalid_citation_removed`; deliver |
| > 30% invalid citations | Block delivery; log `hallucination_risk_high`; require re-run |
| > 50% invalid citations | Block delivery; log `hallucination_detected`; escalate to human review |

---

## 3. Standard ID Verification

Standard IDs follow the pattern `STD-*` and are verified against the CerebraStandards-mcp registry. A Standard ID is valid if:
- It matches a node in `CerebraStandards-mcp/graph/nodes.json`
- OR it was explicitly present in the assembled graph context

Standard IDs NOT in the registry are removed from the output with a log entry.

---

## 4. Grounding for RAG-Specific Task Types

For `knowledge_retrieval` and `rag_grounding` tasks:

| Requirement | Rule |
|-------------|------|
| Minimum citation count | At least 1 citation for any factual claim |
| All factual claims cited | Every non-trivial factual statement needs a `[Source: ...]` |
| Inference labeled | Combined-source inferences must be labeled as inference |
| No-source responses | If no source was found: say "No relevant source found; response based on training data" |

---

## 5. False Citation Detection Algorithm

The guardrail uses a simple but effective approach:

1. Extract `[Source: <id>]` → `cited_id`
2. Look up `cited_id` in the run's assembled context index
3. If not found in context index: flag as potential hallucination
4. Cross-check: if `cited_id` matches a known-good global node (std-*, mcp-*): allow (these are stable global references)
5. If still not matched: remove citation, log, increment `hallucination_counter`

If `hallucination_counter > 3` for a run: escalate regardless of percentage threshold.

---

## 6. Citation Quality Logging

In the trace:
```json
{
  "citations_found": 5,
  "citations_verified": 5,
  "citations_removed": 0,
  "invalid_citations": [],
  "hallucination_risk": "none"
}
```

If citations are removed:
```json
{
  "citations_found": 5,
  "citations_verified": 3,
  "citations_removed": 2,
  "invalid_citations": ["made-up-doc-123", "knowledge-article-999"],
  "hallucination_risk": "low"
}
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
