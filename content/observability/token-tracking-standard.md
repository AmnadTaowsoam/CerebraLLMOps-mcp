# Token Tracking Standard

**Standard ID:** STD-LLMOPS-TOKEN-TRACK-001
**Category:** llmops/observability
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp

## 1. Token Counting Method

### Input Tokens

Input tokens are counted using the model provider's native tokenizer:
- **Anthropic models:** Counted by the API response field `usage.input_tokens` (exact)
- **Ollama/local models:** Counted by the `prompt_eval_count` field in the API response

**Pre-call estimation:** Before the LLM call, an estimate is made using `claude-haiku-3-5` as a tokenizer proxy (fast and cheap). The estimate is recorded as `estimated_input_tokens`; the actual count is recorded after the call.

### Output Tokens

- **Anthropic models:** `usage.output_tokens` from the API response
- **Ollama/local models:** `eval_count` from the API response

### Cache Tokens (Anthropic)

When prompt caching is active:
- `usage.cache_read_input_tokens` — tokens served from cache (lower cost)
- `usage.cache_creation_input_tokens` — tokens written to cache (standard cost)

All three token counts (input, output, cache) are stored in the trace record.

---

## 2. Token Budget Enforcement

### Pre-call Enforcement (Soft)

Before initiating the LLM call:

1. Estimate input tokens from the assembled context
2. Compare to `token_budget.max_input_tokens` from the `LLMOpsContextPackage`
3. If `estimated_input_tokens > max_input_tokens`:
   - Apply context compression (see `context-compression-policy.md`)
   - If still over after compression: truncate lowest-priority context
4. Set `max_tokens` API parameter to `token_budget.max_output_tokens`

### At-call Enforcement (Hard)

The `max_tokens` API parameter is sent on every call. This is the hard limit — the model cannot generate beyond this.

### Post-call Verification

After the response:
1. Record `actual_input_tokens` from API response
2. If `actual_input_tokens > max_input_tokens`: log `token_budget_exceeded` event
3. If `output_tokens == max_output_tokens`: the response may have been truncated — log `output_truncated_warning`

---

## 3. Daily Budget Tracking (Per Tenant)

Each tenant has a daily token budget (configured by platform owner):

| Field | Type | Description |
|-------|------|-------------|
| `daily_token_budget` | integer | Total input+output tokens per day |
| `tokens_used_today` | integer | Running total, reset at midnight UTC |
| `overage_policy` | enum | `block`, `warn`, `allow` |

**Tracking:**
- Token count is incremented atomically in the `llmops.tenant_token_usage` table after each run
- LLMOps checks `tokens_remaining = daily_token_budget - tokens_used_today` before routing
- If `estimated_cost > tokens_remaining`: apply `overage_policy`

---

## 4. Token Efficiency Metrics

The dashboard tracks:
- `avg_input_tokens` per task type (trend: is context growing?)
- `avg_output_tokens` per task type (trend: are responses getting longer?)
- `cache_hit_rate` = `cache_read_tokens / total_input_tokens` (target: ≥40% for system prompts)
- `budget_utilization` = `tokens_used / daily_budget` per tenant

---

## 5. Overage Handling

| Overage Policy | Action |
|---------------|--------|
| `block` | New LLM calls are refused until budget resets or increases |
| `warn` | Run proceeds; tenant owner receives notification |
| `allow` | Run proceeds; overage tracked but no limit enforced |

Default for new tenants: `warn`.

Overage events are logged as:
```json
{
  "event": "token_budget_overage",
  "tenant_id": "...",
  "budget": 1000000,
  "used": 1050000,
  "overage_tokens": 50000,
  "policy": "warn",
  "timestamp": "..."
}
```

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
