# Context Compression Policy

**Standard ID:** STD-LLMOPS-CONTEXT-COMPRESS-001
**Category:** llmops/context
**Priority:** medium
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines when context compression is triggered and the compression strategies available. Compression reduces the token count of assembled context before the LLM call, enabling more content to fit within the budget.

---

## 2. Compression Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| Soft limit exceeded | Assembled context > 80% of `max_input_tokens` | Apply light compression (summarize low-priority items) |
| Hard limit exceeded | Assembled context > `max_input_tokens` | Apply aggressive compression or drop lowest-priority items |
| Many documents retrieved | `retrieved_documents > max_documents` | Drop lowest-relevance documents |
| Deep code graph context | `retrieved_code_nodes > max_code_nodes` | Truncate code nodes to function signatures only |

---

## 3. Compression Strategies (in order of preference)

### Strategy 1: Graph Layer Compression (Preferred)

Ask CerebraGraphLayer for a compressed context summary:

```
graphlayer_get_compressed_context({
  nodes: [node_id, ...],
  target_tokens: 500,
  summary_level: "key_relationships_only"
})
```

GraphLayer returns a compact representation (key relationships, skip individual node details). This typically reduces graph context by 60–80% while preserving the most important relationship signals.

### Strategy 2: Document Summarization

For knowledge documents that are low-relevance but required:
- Replace full document with a 200-token summary
- Summary must include: source citation, key facts, applicability to the task
- This is applied to the bottom 50% of documents by relevance score

### Strategy 3: Code Node Signature Truncation

For code nodes, reduce to function/method signatures + docstrings only:
- Remove function bodies (keep signatures + comments)
- Keep full bodies only for the top 5 most-relevant nodes
- Add note: "Full body available in CodeGraph — request if needed"

### Strategy 4: Priority Drop

If compression strategies 1–3 are insufficient:
1. Drop all background code nodes (callers/callees of non-primary files)
2. Drop all graph nodes below relevance score 0.5
3. Drop knowledge documents below relevance score 0.6

### Strategy 5: Hard Truncation (Last Resort)

If all above strategies still leave context over budget:
1. Truncate low-priority documents to their first 200 tokens
2. Add a marker: `[CONTENT TRUNCATED — request full document if needed]`
3. Log `context_truncated: true` in the trace

---

## 4. How Graph Layer Reduces Token Usage

CerebraGraphLayer provides relationship intelligence that replaces verbose document retrieval:

**Without Graph Layer:** Fetch 10 knowledge documents = 10,000 tokens of context
**With Graph Layer:** Query graph for relevant nodes → get compressed relationship map = 800 tokens

The graph approach is preferred because:
1. Fewer tokens used for the same semantic coverage
2. Relationships are pre-computed (no reasoning overhead)
3. Graph nodes are curated and authoritative (less noise than document retrieval)

The context budget policy preferentially allocates `max_graph_nodes` before `max_documents` for tasks where graph context is sufficient (e.g., standards checks, skill lookups, role queries).

---

## 5. Compression Logging

When compression is applied, the trace must record:

```json
{
  "compression_applied": true,
  "compression_strategies_used": ["graph_compression", "document_summarization"],
  "original_estimated_tokens": 48000,
  "compressed_tokens": 28000,
  "tokens_saved": 20000,
  "items_dropped": 3,
  "context_quality_impact": "low"
}
```

`context_quality_impact` is assessed by LLMOps based on the relevance scores of dropped items:
- `none`: only < 0.3 relevance items dropped
- `low`: 0.3–0.5 relevance items dropped
- `medium`: 0.5–0.7 relevance items dropped (flag for review)
- `high`: > 0.7 relevance items dropped (escalate — budget may need to be increased)

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
