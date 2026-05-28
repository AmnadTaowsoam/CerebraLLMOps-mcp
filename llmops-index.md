# CerebraLLMOps-mcp — Content Index

**MCP:** CerebraLLMOps-mcp (MCP #13)
**Last Updated:** 2026-05-28
**Status:** Phase 1 content scaffold

This index lists all content files in this MCP, grouped by directory. Use it as the primary navigation document.

---

## Root Files

| File | Description |
|------|-------------|
| `README.md` | MCP overview — purpose, capabilities, integrations, tool surface |
| `mcp.json` | MCP manifest — name, version, port, schema, dependencies |
| `llmops-index.md` | This file — navigation index for all content |
| `llmops-routing-rules.md` | Decision rules for when to call which LLMOps tool |
| `llmops-context-package-schema.md` | `LLMOpsContextPackage` data shape definition for Orchestrator |
| `llmops-governance.md` | Governance rules — who can change what, audit requirements, immutability |

---

## `content/prompts/` — Prompt Registry & Versioning

| File | Description |
|------|-------------|
| `prompt-registry.md` | Master table of all registered prompts with current version and status |
| `system-prompt-registry.md` | System prompts (agent behavior definitions) with version tracking |
| `prompt-versioning-policy.md` | Semver rules, immutability, rollback naming, promotion quality gate |
| `prompt-review-checklist.md` | 10-item checklist required before a prompt change is approved |
| `prompt-regression-test-policy.md` | When regression eval is required, pass threshold, eval suite binding |

---

## `content/agents/` — Agent Registry & Behavior

| File | Description |
|------|-------------|
| `agent-registry.md` | Master table of Cerebra agents with risk level, eval suite, and instruction version |
| `agent-instruction-registry.md` | System instructions per agent with version tracking |
| `agent-versioning-policy.md` | How agent instructions are versioned (semver) and change request process |
| `agent-behavior-policy.md` | Mandatory rules all agents must follow — standards, tool permissions, escalation |
| `agent-risk-classification.md` | Low / Medium / High / Critical risk definitions with task type examples |
| `agent-evaluation-policy.md` | Which eval suites are required per risk level |

---

## `content/models/` — Model Registry & Routing

| File | Description |
|------|-------------|
| `model-registry.md` | Registered AI models with capability, cost tier, latency tier, and fallback |
| `model-routing-policy.md` | Decision matrix: task_type × risk_level → model selection |
| `model-selection-matrix.md` | Detailed per-task routing decisions with reasoning |
| `model-fallback-policy.md` | Fallback triggers and fallback chain actions |
| `model-cost-latency-profile.md` | Cost per 1M tokens and typical latency figures by model |

---

## `content/context/` — Context Budget & Compression

| File | Description |
|------|-------------|
| `context-budget-policy.md` | Default token budgets per risk level — max docs, code nodes, graph nodes |
| `context-compression-policy.md` | When to compress context, how Graph Layer reduces token usage |
| `rag-context-policy.md` | Grounding requirements for RAG outputs, citation policy |
| `sensitive-context-policy.md` | PII, secrets, credentials must never enter LLM context |

---

## `content/evaluation/` — Eval Suites & Templates

| File | Description |
|------|-------------|
| `evaluation-strategy.md` | Overall eval philosophy — automated, regression, human review triggers |
| `agent-eval-suite.md` | Eval cases for agent behavior compliance |
| `prompt-eval-suite.md` | Eval cases for prompt quality and injection resistance |
| `hallucination-eval-suite.md` | Grounding and source citation checks |
| `regression-eval-suite.md` | 20 golden cases baseline across task types |
| `golden-answer-template.md` | Template for documenting a golden eval case |
| `eval-result-template.md` | Template for recording eval run results |

---

## `content/observability/` — Tracking & Dashboard

| File | Description |
|------|-------------|
| `llm-observability-standard.md` | Mandatory fields for every managed LLM run trace |
| `token-tracking-standard.md` | Token counting method, budget enforcement, overage handling |
| `cost-tracking-standard.md` | Cost formula per model, budget alerts, per-tenant reporting |
| `latency-tracking-standard.md` | SLO targets by risk level, p95 thresholds, alerting rules |
| `dashboard-metrics.md` | 10 metric groups with KPIs and visualization guidance |
| `alerting-policy.md` | Alert conditions — cost spike, latency spike, eval failure, hallucination rate |

---

## `content/quality-gates/` — Readiness Checklists

| File | Description |
|------|-------------|
| `prompt-readiness-checklist.md` | 10 items before a prompt version can be promoted to active |
| `agent-readiness-checklist.md` | 10 items before an agent instruction version can be promoted |
| `model-change-readiness-checklist.md` | 8 items before a model routing change takes effect |
| `high-risk-output-review-checklist.md` | 12 items for reviewing critical-risk agent output |
| `llmops-release-readiness-checklist.md` | 15 items before any LLMOps policy/registry change is released |

---

## `content/feedback-loop/` — Feedback & Improvement

| File | Description |
|------|-------------|
| `feedback-collection-policy.md` | Sources, collection format, severity levels for feedback items |
| `failure-pattern-registry.md` | Known failure patterns with frequency and improvement status |
| `improvement-backlog.md` | Open improvement items with priority and proposed changes |
| `continuous-improvement-workflow.md` | 10-step loop from collect to monitor |

---

## `content/guardrails/` — Output Safety & Escalation

| File | Description |
|------|-------------|
| `llm-guardrail-policy.md` | Master guardrail document — all active guardrails and enforcement actions |
| `output-format-policy.md` | Schema validation requirements, retry and escalation on failure |
| `citation-grounding-policy.md` | Citation requirements for Knowledge RAG outputs |
| `tool-permission-policy.md` | Per-role tool permission matrix |
| `human-escalation-policy.md` | 8 triggers that require human review before proceeding |

---

## `content/reports/` — Report Templates

| File | Description |
|------|-------------|
| `llmops-report-template.md` | Full LLMOps Run Report — task/run IDs, context, cost, eval, final status |
| `agent-performance-report-template.md` | Weekly agent performance summary template |
| `cost-latency-report-template.md` | Monthly cost/latency breakdown by agent and model |

---

## `schemas/` — JSON Schemas

| File | Description |
|------|-------------|
| `prompt-metadata.schema.json` | Schema for a prompt registry entry |
| `eval-case.schema.json` | Schema for an evaluation case |
| `eval-result.schema.json` | Schema for an evaluation run result |
| `llm-trace.schema.json` | Schema for an LLM run trace record |
| `feedback.schema.json` | Schema for a feedback item |
| `llmops-context-package.schema.json` | Schema for LLMOpsContextPackage returned to Orchestrator |

---

## `graph/` — Graph Metadata

| File | Description |
|------|-------------|
| `nodes.json` | LLMOps graph nodes (mcp, skill, standard, review_gate, security_rule, task_type) |
| `edges.json` | Relationships between nodes |
| `metadata.json` | Graph registry summary — node/edge counts, last updated |
