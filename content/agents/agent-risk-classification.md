# Agent Risk Classification

**Standard ID:** STD-LLMOPS-AGENT-RISK-001
**Category:** llmops/agents
**Priority:** high
**Applies To:** all agent instruction assignments and model routing
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the four risk levels for Cerebra agents and agent tasks. Risk level determines: model selection, token budget, eval requirement, guardrail level, and human review requirement.

This classification matches spec §9.3 and is used in the model routing decision matrix.

---

## 2. Risk Level Definitions

### `low` — Minimal Impact

**Definition:** The agent's output, if incorrect, can be corrected without effort and has no systemic downstream effect.

**Characteristics:**
- Read-only operations
- No side effects (no DB writes, no file changes, no external calls)
- Output is informational only
- No sensitive data in context

**Task Type Examples:**
- `skills_retrieval` — searching the skills registry
- `knowledge_search` — searching knowledge base
- `status_check` — reading a service health endpoint
- `graph_lookup` — querying graph nodes (read-only)

**Controls Applied:**
- Model: `claude-haiku-3-5` (default) or `ollama/llama-3.1-8b`
- Token budget: 8,000 input / 2,000 output
- Eval: none (automated optional)
- Guardrail level: standard
- Human review: never required automatically

---

### `medium` — Moderate Impact

**Definition:** The agent's output affects one MCP's data or behavior. Errors are recoverable but require effort.

**Characteristics:**
- May write to one MCP's dataset
- Output feeds another automated system
- Context may include business data
- Errors are logged and correctable within minutes

**Task Type Examples:**
- `skill_composition` — composing skills into a workflow
- `test_planning` — generating a test strategy
- `standards_check` — checking code against standards
- `knowledge_indexing` — adding content to knowledge base
- `graph_node_registration` — adding a draft node to the graph

**Controls Applied:**
- Model: `claude-sonnet-4-5` (default)
- Token budget: 16,000 input / 4,000 output
- Eval: automated (required)
- Guardrail level: standard
- Human review: not required unless eval fails

---

### `high` — Significant Impact

**Definition:** The agent's output affects multiple MCPs, system behavior, or contains significant complexity. Errors may take hours to correct.

**Characteristics:**
- Cross-MCP coordination
- Complex reasoning chains (code analysis, root cause analysis)
- Output affects proposal workflow, review decisions, or agent behavior
- Errors require investigation to diagnose

**Task Type Examples:**
- `code_generation` — generating code that will be deployed
- `debug` / `root_cause_analysis` — diagnosing a production incident
- `review` — reviewing a proposal or PR
- `impact_analysis` — analyzing code change blast radius
- `agent_instruction_change (MINOR)` — updating agent behavior

**Controls Applied:**
- Model: `claude-sonnet-4-5` (default), `claude-opus-4` for complex reasoning tasks
- Token budget: 32,000 input / 8,000 output
- Eval: automated (required, threshold ≥85%)
- Guardrail level: strict
- Human review: required if eval fails; optional otherwise

---

### `critical` — Maximum Impact

**Definition:** The agent's output affects security, authentication, production deployments, or multi-tenant isolation. Errors may cause outages or data breaches.

**Characteristics:**
- Affects auth, security policies, or trust boundaries
- Production deployment decisions
- Multi-tenant data isolation changes
- Any action that, if wrong, could cause a security incident or data loss

**Task Type Examples:**
- `security_analysis` — evaluating security policies
- `deployment` — initiating or approving a production deployment
- `auth_change` — changing authentication or RBAC rules
- `agent_instruction_change (MAJOR)` — fundamental agent behavior change
- `emergency_override` — bypassing a guardrail in production

**Controls Applied:**
- Model: `claude-opus-4` (required, no exceptions)
- Token budget: 64,000 input / 16,000 output
- Eval: automated + human (both required)
- Guardrail level: maximum
- Human review: always required before output is acted upon

---

## 3. Risk Level Assignment Process

Risk level is assigned to an agent at registration and can only change via a `MAJOR` version bump with platform owner approval.

For individual task runs, the risk level is the MAX of:
- The agent's registered `risk_level`
- The task type's inherent risk from the table above
- Any runtime risk escalation signals (e.g., sensitive data detected in context)

### Runtime Risk Escalation

| Signal | Risk Escalation |
|--------|----------------|
| PII detected in context | Escalate to `critical` |
| Credentials detected in context | Escalate to `critical` + block |
| Multi-tenant data mixing detected | Escalate to `critical` |
| 3+ MCP coordination in single task | Escalate to `high` minimum |
| Production system is the target | Escalate to `critical` |

---

## 4. Risk Level in Routing Decision

See `content/models/model-routing-policy.md` for the full decision matrix mapping `task_type × risk_level → model_id`.

## 5. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 4 risk levels defined with examples |
