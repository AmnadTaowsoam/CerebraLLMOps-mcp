# Model Registry

**Standard ID:** STD-LLMOPS-MODEL-REG-001
**Category:** llmops/models
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Master registry of all AI models available for routing in CerebraMCP. The routing policy (`model-routing-policy.md`) references model_ids from this registry. Only models with `status: active` may receive production traffic.

---

## Model Registry Table

| model_id | provider | capability | context_window | cost_tier | latency_tier | fallback_model | status |
|---------|---------|------------|---------------|----------|-------------|---------------|--------|
| `claude-opus-4` | anthropic | highest-accuracy, complex-reasoning, code, analysis | 200,000 | premium | high | `claude-sonnet-4-5` | active |
| `claude-sonnet-4-5` | anthropic | balanced-accuracy, general-purpose, code, analysis | 200,000 | standard | medium | `claude-haiku-3-5` | active |
| `claude-haiku-3-5` | anthropic | fast-retrieval, classification, simple-tasks | 200,000 | low | low | `ollama/llama-3.1-8b` | active |
| `ollama/llama-3.1-8b` | ollama (local) | basic-completion, offline-fallback | 128,000 | free | variable | none | active |

---

## Capability Definitions

| Capability Tag | Meaning | Appropriate Task Types |
|---------------|---------|----------------------|
| `highest-accuracy` | State-of-the-art reasoning and precision | security_analysis, deployment, critical-risk tasks |
| `complex-reasoning` | Multi-step analysis with high coherence | root_cause_analysis, code_review, impact_analysis |
| `balanced-accuracy` | High accuracy with reasonable cost | most medium/high-risk tasks |
| `general-purpose` | Works across many task types | compose_learning, knowledge_rag, test_planning |
| `fast-retrieval` | Optimized for speed over depth | skills_retrieval, standards_check, simple lookups |
| `basic-completion` | Text completion for simple patterns | offline fallback only |

---

## Cost Tier Definitions

| Tier | Estimated Input Cost (per 1M tokens) | Estimated Output Cost (per 1M tokens) |
|------|-------------------------------------|--------------------------------------|
| `premium` | $15.00 | $75.00 |
| `standard` | $3.00 | $15.00 |
| `low` | $0.80 | $4.00 |
| `free` | $0.00 (self-hosted) | $0.00 |

See `model-cost-latency-profile.md` for detailed per-model cost estimates.

---

## Latency Tier Definitions

| Tier | Typical p50 Latency | Typical p95 Latency |
|------|-------------------|-------------------|
| `low` | < 500ms | < 2,000ms |
| `medium` | 500ms – 2,000ms | 2,000ms – 8,000ms |
| `high` | 2,000ms – 10,000ms | 5,000ms – 30,000ms |
| `variable` | Depends on local hardware | Unpredictable |

---

## Fallback Chain

```
claude-opus-4
    └── fallback: claude-sonnet-4-5
            └── fallback: claude-haiku-3-5
                    └── fallback: ollama/llama-3.1-8b
                            └── fallback: NONE (circuit breaker — fail with clear error)
```

See `model-fallback-policy.md` for fallback triggers and conditions.

---

## Model Registration Checklist

Before adding a model to this registry with `status: active`:

1. Complete `model-change-readiness-checklist.md` (8 items)
2. Run 10 test cases across representative task types
3. Record cost/latency profile in `model-cost-latency-profile.md`
4. Define fallback model (cannot be null for production models)
5. Update `model-routing-policy.md` decision matrix to include the new model
6. Platform owner approval

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 4 models registered |
