# LLMOpsContextPackage Schema

**Standard ID:** STD-LLMOPS-CONTEXT-PACKAGE-001
**Category:** llmops
**Priority:** high
**Applies To:** orchestrator, all-tasks
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the `LLMOpsContextPackage` data shape that CerebraLLMOps-mcp returns to the Orchestrator before each managed LLM run. The Orchestrator uses this package to configure the LLM call correctly: selecting the right model, enforcing token budgets, applying guardrails, and deciding whether human review is required.

---

## 2. Full Schema

```typescript
interface LLMOpsContextPackage {
  // Identity
  package_id: string;             // UUID — unique per request
  generated_at: string;           // ISO 8601 timestamp
  expires_at: string;             // ISO 8601 — package is valid for 10 minutes
  tenant_id: string;
  agent_id: string;
  task_id: string;

  // Prompt
  prompt_version: string;         // semver of the active prompt, e.g. "2.3.1"
  prompt_id: string;              // from prompt registry
  system_prompt_version: string;  // semver of the agent's system prompt

  // Model
  model_id: string;               // e.g. "claude-sonnet-4-5"
  model_provider: string;         // "anthropic" | "ollama" | "openai"
  fallback_model_id: string;      // e.g. "claude-haiku-3-5"
  routing_reason: string;         // human-readable explanation of selection

  // Token Budget
  token_budget: {
    max_input_tokens: number;     // hard limit for this call
    max_output_tokens: number;    // hard limit on response length
    estimated_input_tokens: number;   // pre-call estimate
    budget_remaining_today: number;   // tenant's remaining daily budget in tokens
    overage_policy: "block" | "warn" | "allow";
  };

  // Evaluation
  eval_requirement: "none" | "automated" | "automated+human";
  eval_suite_id: string | null;   // null if eval_requirement = "none"
  regression_eval_required: boolean;  // true if this is a new prompt version run

  // Guardrails
  guardrail_level: "standard" | "strict" | "maximum";
  active_guardrails: string[];    // IDs of active guardrails, e.g. ["guardrail-pii-scrub", "guardrail-output-schema"]
  output_schema_required: boolean;
  output_schema_id: string | null;    // JSON Schema ID to validate against

  // Review
  human_review_required: boolean;
  human_review_reason: string | null; // populated when human_review_required = true
  review_sla_minutes: number | null;  // SLA for human review turnaround

  // Context
  context_budget: {
    max_documents: number;        // max Knowledge docs to include
    max_code_nodes: number;       // max CodeGraph nodes to include
    max_graph_nodes: number;      // max GraphLayer nodes to include
    compression_required: boolean;    // true if context must be compressed before call
    sensitive_context_detected: boolean; // true if PII/secret scan found issues (run blocked)
  };

  // Cost
  cost_budget: {
    max_cost_usd: number;         // per-call cost cap
    estimated_cost_usd: number;   // pre-call estimate
    tenant_daily_budget_remaining_usd: number;
  };

  // Latency
  latency_budget: {
    slo_ms: number;               // target latency for this risk level
    slo_p95_ms: number;           // p95 threshold before alert
    streaming_required: boolean;  // true for high-latency risk tasks
  };

  // Risk
  risk_level: "low" | "medium" | "high" | "critical";
  risk_factors: string[];         // list of detected risk factors

  // Tool Permissions
  allowed_tools: string[];        // tools this agent may call during this run
  forbidden_tools: string[];      // explicitly denied tools
}
```

---

## 3. Field-by-Field Notes

### `prompt_version`
- Always populated from the prompt registry's `current_version` for the active prompt
- If the active prompt has not yet completed regression eval, the previous stable version is used and `regression_eval_required = true` is set for the run

### `token_budget.overage_policy`
- `block`: run is not initiated if estimated_input_tokens > max_input_tokens
- `warn`: run proceeds but a warning is recorded in the trace
- `allow`: run proceeds with no warning (only for low-risk tenants with explicit permission)

### `guardrail_level`
| Level | Active Guardrails |
|-------|------------------|
| `standard` | PII scrub, output schema validation (if required) |
| `strict` | Standard + citation grounding, tool permission check |
| `maximum` | Strict + human escalation pre-check, output content filter |

### `eval_requirement`
| Risk Level | Default Requirement |
|-----------|-------------------|
| `low` | `none` |
| `medium` | `automated` |
| `high` | `automated` |
| `critical` | `automated+human` |

### `human_review_required`
Set to `true` when:
1. `risk_level = critical`
2. `eval_requirement = automated+human`
3. A previous run for this task had `eval_result = fail`
4. The agent's instruction version changed within the last 24 hours
5. A security policy violation was flagged in the last 7 days for this agent

---

## 4. Minimal Package (Low-Risk Fast Path)

For low-risk, single-MCP, read-only tasks, the package is simplified:

```typescript
{
  package_id: "pkg_...",
  generated_at: "...",
  expires_at: "...",
  tenant_id: "default",
  agent_id: "agent-skills-retrieval",
  task_id: "task_...",
  prompt_version: "1.0.0",
  prompt_id: "prompt-skills-search",
  system_prompt_version: "1.2.0",
  model_id: "claude-haiku-3-5",
  model_provider: "anthropic",
  fallback_model_id: "ollama/llama-3.1-8b",
  routing_reason: "low-risk single-MCP read task → haiku",
  token_budget: { max_input_tokens: 8000, max_output_tokens: 2000, ... },
  eval_requirement: "none",
  eval_suite_id: null,
  regression_eval_required: false,
  guardrail_level: "standard",
  active_guardrails: ["guardrail-pii-scrub"],
  output_schema_required: false,
  output_schema_id: null,
  human_review_required: false,
  human_review_reason: null,
  review_sla_minutes: null,
  context_budget: { max_documents: 5, max_code_nodes: 0, max_graph_nodes: 10, ... },
  cost_budget: { max_cost_usd: 0.05, ... },
  latency_budget: { slo_ms: 2000, slo_p95_ms: 5000, streaming_required: false },
  risk_level: "low",
  risk_factors: [],
  allowed_tools: ["knowledge_search", "skills_search"],
  forbidden_tools: [],
}
```

---

## 5. JSON Schema

See `schemas/llmops-context-package.schema.json` for the machine-readable version.

---

## 6. Related Documents

- `llmops-routing-rules.md` — When to request the context package
- `content/models/model-routing-policy.md` — How model_id is selected
- `content/context/context-budget-policy.md` — How token budgets are set
- `content/guardrails/human-escalation-policy.md` — human_review_required triggers
- `content/evaluation/evaluation-strategy.md` — eval_requirement assignment

## 7. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
