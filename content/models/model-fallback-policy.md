# Model Fallback Policy

**Standard ID:** STD-LLMOPS-MODEL-FALLBACK-001
**Category:** llmops/models
**Priority:** high
**Applies To:** all model selection and API error handling
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the conditions under which model fallback is triggered and what actions are taken for each scenario. This matches spec §10.4. Fallback ensures that low/medium risk tasks can continue in degraded mode while high/critical tasks fail safely.

---

## 2. Fallback Triggers

| Trigger ID | Condition | Severity |
|-----------|-----------|---------|
| `FBK-01` | HTTP 429 (rate limit) from primary model | Medium |
| `FBK-02` | HTTP 500/503 (API error) from primary model | High |
| `FBK-03` | Request timeout (> 60s for any single call) | High |
| `FBK-04` | Primary model returns empty/null response | Medium |
| `FBK-05` | Primary model returns malformed JSON (when schema required) | Medium |
| `FBK-06` | Primary model unavailable (DNS/connectivity failure) | Critical |
| `FBK-07` | Budget constraint — primary model too expensive for tenant budget | Low |
| `FBK-08` | Primary model deprecated or removed from registry | Critical |

---

## 3. Fallback Actions by Trigger and Risk Level

### For `low` risk tasks

| Trigger | Fallback Action |
|---------|----------------|
| FBK-01 | Wait 2s, retry primary; if fail → use fallback model |
| FBK-02 | Immediately use fallback model |
| FBK-03 | Immediately use fallback model (ollama if sonnet/haiku) |
| FBK-04 | Retry once; if still empty → use fallback |
| FBK-05 | Retry with schema reminder; if fail → use fallback |
| FBK-06 | Use ollama/llama-3.1-8b (local) immediately |
| FBK-07 | Route to haiku-3-5 or ollama |
| FBK-08 | Route to fallback model specified in registry |

### For `medium` risk tasks

| Trigger | Fallback Action |
|---------|----------------|
| FBK-01 | Wait 5s (exponential backoff), retry × 2; if fail → fallback model |
| FBK-02 | Retry × 1; if fail → fallback model with degraded warning |
| FBK-03 | Fallback to haiku; log latency SLO violation |
| FBK-04 | Retry × 2; if fail → fallback |
| FBK-05 | Retry with explicit schema; if fail → escalate |
| FBK-06 | Use ollama/llama-3.1-8b with warning |
| FBK-07 | Route to haiku-3-5 |
| FBK-08 | Fallback per registry; alert platform team |

### For `high` risk tasks

| Trigger | Fallback Action |
|---------|----------------|
| FBK-01 | Retry × 3 with exponential backoff; if fail → fallback (never ollama) |
| FBK-02 | Retry × 1; if fail → fallback to next model tier (never ollama) |
| FBK-03 | Log SLO violation; retry × 1; if fail → escalate to human |
| FBK-04 | Retry × 2; if fail → escalate |
| FBK-05 | Retry × 2 with schema; if fail → escalate |
| FBK-06 | **DO NOT use ollama** — return service degraded error |
| FBK-07 | Sonnet → haiku only; if still insufficient budget → block |
| FBK-08 | Alert + block until registry is updated |

### For `critical` risk tasks

| Trigger | Fallback Action |
|---------|----------------|
| FBK-01 | Retry × 5 with 30s max backoff; if fail → block task |
| FBK-02 | Retry × 2; if fail → block task + notify platform owner |
| FBK-03 | Log; wait up to 120s total; if still timeout → block |
| FBK-04 | Retry × 3; if fail → block |
| FBK-05 | Retry × 3 with schema; if fail → block + escalate |
| FBK-06 | **Block task immediately** — no fallback allowed for critical |
| FBK-07 | **Budget constraint does NOT apply** — always use opus-4 |
| FBK-08 | Block task; alert `nottoei` immediately |

---

## 4. Fallback Chain

```
claude-opus-4
  ├── trigger: FBK-01/02/03/04/05 (for medium/low risk only)
  └── fallback → claude-sonnet-4-5
                  ├── trigger: FBK-01/02/03/04/05 (for low risk only)
                  └── fallback → claude-haiku-3-5
                                  ├── trigger: FBK-06 (low/medium only)
                                  └── fallback → ollama/llama-3.1-8b
                                                  └── fallback → CIRCUIT BREAKER (fail with error)
```

**Critical tasks:** Never traverse below `claude-opus-4`. If opus-4 is unavailable, the task is blocked.

---

## 5. Fallback Logging

Every fallback event MUST be logged in the LLM trace with:

```json
{
  "fallback_triggered": true,
  "fallback_trigger_id": "FBK-02",
  "primary_model_id": "claude-opus-4",
  "fallback_model_id": "claude-sonnet-4-5",
  "fallback_reason": "HTTP 503 from Anthropic API",
  "attempt_count": 1,
  "fallback_at": "2026-05-28T10:15:00Z"
}
```

---

## 6. Circuit Breaker

If more than 5 fallback events occur within a 10-minute window for the same model:

1. Circuit breaker opens for that model (all traffic routed away)
2. Alert sent: `model_circuit_breaker_open`
3. Circuit breaker checks status every 60 seconds
4. If model returns 200 on health check → circuit breaker closes (traffic resumes)
5. Circuit breaker status is visible in `orchestrator_health_detailed()`

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 8 triggers × 4 risk levels + circuit breaker |
