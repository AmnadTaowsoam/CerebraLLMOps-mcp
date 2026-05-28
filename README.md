# CerebraLLMOps-mcp

**MCP Number:** 13
**Port:** 4300
**Status:** content-phase (Phase 1 scaffold complete)
**Owner Team:** platform
**Schema:** `llmops`

## Purpose

CerebraLLMOps-mcp is the **LLM/Agent Operational Control Layer** for the CerebraMCP platform. It governs every aspect of how AI models and agents are operated in production: prompt versioning, agent instruction versioning, model routing decisions, token/cost/latency tracking, quality evaluation, feedback loops, and safety guardrails.

It is the 13th MCP in the Cerebra fleet and sits between the Orchestrator (which coordinates tasks) and all downstream MCPs (which execute them), ensuring that every AI interaction is observable, versioned, evaluated, and improvable.

## What It Controls

### 1. Prompt Versioning
- Semantic versioning (semver) for all prompt templates
- Immutable version history — published versions cannot be modified
- Promotion gates: every new version must pass regression eval before going active
- Registry of all prompt templates with ownership, task-type binding, and status

### 2. Agent Instruction Versioning
- Versioned system instructions for each Cerebra agent
- Change request workflow with approval requirements
- Risk-level classification per agent (Low / Medium / High / Critical)
- Rollback support: any agent can revert to a prior instruction version

### 3. Model Routing
- Decision matrix: task_type × risk_level → model_id
- Fallback chains: primary → secondary → circuit-breaker model
- Cost-aware routing: budget constraints can override default selection
- Dynamic routing policy updatable by platform owner (with audit trail)

### 4. Token / Cost / Latency Tracking
- Every managed LLM run records input_tokens, output_tokens, cost_estimate, latency_ms
- Per-tenant budgets with overage alerts
- Monthly cost/latency reports by agent and model
- SLO enforcement: p95 latency thresholds per risk level

### 5. Quality Evaluation
- Automated eval for every run: schema validation, grounding check, instruction compliance
- Regression eval suite: 20 golden cases across task types
- Pass threshold: ≥80% on automated eval; human review required for critical-risk outputs
- Eval results stored and queryable per run/agent/prompt version

### 6. Feedback Loop
- Feedback ingested from: Review, Debug, Testing, Security, Standards MCPs + human reviewers
- Failure pattern registry: tracks recurring issues with frequency and improvement status
- Improvement backlog: proposed changes, priority, and status
- 10-step continuous improvement workflow (collect → classify → link → backlog → propose → eval → review → release → monitor)

### 7. Guardrails
- Output schema validation (retry/escalate on failure)
- PII and credential scrubbing — sensitive context never enters LLM calls
- Citation grounding requirements for Knowledge RAG outputs
- Tool permission matrix: per-role permissions enforced at runtime
- Human escalation triggers: 8 defined conditions (critical risk, security flag, low confidence, eval failure, etc.)

## MCP Tools (Phase 2 — planned)

The following tools will be exposed by the Phase 2 service implementation:

| Tool | Purpose |
|------|---------|
| `llmops_get_model_routing_decision` | Returns model_id + context_budget for a given task + risk level |
| `llmops_get_prompt_version` | Returns active prompt template for a given prompt_id |
| `llmops_get_agent_instructions` | Returns active instruction set for an agent_id |
| `llmops_record_llm_trace` | Records a completed LLM run (tokens, cost, latency, eval) |
| `llmops_record_feedback` | Submits feedback from a downstream MCP |
| `llmops_evaluate_output` | Runs quality eval against a given output |
| `llmops_get_context_package` | Returns LLMOpsContextPackage for Orchestrator pre-call |
| `llmops_list_eval_suites` | Lists available eval suites for an agent or prompt |
| `llmops_propose_prompt_version` | Initiates a prompt version promotion workflow |
| `llmops_get_token_budget` | Returns token budget for a given risk level + tenant |
| `llmops_cost_report` | Returns cost/latency breakdown for a period |
| `llmops_health` | Service health check |

## Integration with All 12 MCPs

| MCP | Integration |
|-----|-------------|
| **CerebraOrchestrator-mcp** | Primary consumer: receives `LLMOpsContextPackage` before every managed run; Orchestrator calls `llmops_get_context_package` and `llmops_get_model_routing_decision` |
| **CerebraRole-mcp** | Agent identity + role → maps to risk level + allowed tool permissions |
| **CerebraSkills-mcp** | Skills declare `task_type` → model routing uses task_type for decision matrix |
| **CerebraKnowledge-mcp** | RAG outputs must meet citation grounding policy; knowledge context subject to context budget |
| **CerebraSecurity-mcp** | Security rules + DLP policies enforced as guardrails; security findings feed feedback loop |
| **CerebraDebugs-mcp** | Debug findings feed failure pattern registry; debug runs tracked as LLM traces |
| **CerebraReview-mcp** | Review findings trigger feedback; high-risk output review gates defined here |
| **CerebraTesting-mcp** | Eval suites linked to test strategies; regression eval coordinated with testing |
| **CerebraDevOps-mcp** | Deployment readiness checks include LLMOps policy validation |
| **CerebraStandards-mcp** | Standards compliance checked as part of every agent eval; STD-AI-PROMPT-VERSION-001 enforced |
| **CerebraCodeGraph-mcp** | Code-generation tasks routed to appropriate model; code output evaluated for correctness |
| **CerebraGraphLayer** | Graph context included in model routing decisions; cross-MCP relationship intelligence |

## Directory Structure

```
CerebraLLMOps-mcp/
├── README.md                          — This file
├── mcp.json                           — MCP manifest
├── llmops-index.md                    — Content navigation index
├── llmops-routing-rules.md            — When to call which LLMOps tool
├── llmops-context-package-schema.md   — LLMOpsContextPackage definition
├── llmops-governance.md               — Governance + permission rules
│
├── content/
│   ├── prompts/                       — Prompt registry + versioning policy
│   ├── agents/                        — Agent registry + behavior policy
│   ├── models/                        — Model registry + routing policy
│   ├── context/                       — Context budget + compression policy
│   ├── evaluation/                    — Eval suites + templates
│   ├── observability/                 — Tracking standards + dashboard metrics
│   ├── quality-gates/                 — Readiness checklists
│   ├── feedback-loop/                 — Feedback collection + improvement workflow
│   ├── guardrails/                    — Output safety + escalation policy
│   └── reports/                       — Report templates
│
├── schemas/                           — JSON Schemas for data structures
└── graph/                             — Graph nodes + edges for GraphLayer
```

## Phase Plan

- **Phase 1 (current):** Content scaffold — Markdown policies, JSON schemas, graph metadata
- **Phase 2:** Fastify HTTP service (`apps/llmops-api/`) with Postgres schema (`llmops` schema in `cerebra` DB)
- **Phase 3:** Orchestrator integration — `llmops_get_context_package` pre-call in compose flow
- **Phase 4:** Feedback loop automation — auto-ingest from downstream MCPs

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Phase 1 content scaffold created |
