# Tool Permission Policy

**Standard ID:** STD-LLMOPS-TOOL-PERM-001
**Category:** llmops/guardrails
**Priority:** critical
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines the per-role tool permission matrix for Cerebra agents. This matches spec §14.3. The guardrail G-05 enforces this at runtime. Any attempted tool call not in the agent's `allowed_tools` is blocked.

---

## 2. Role-Based Permission Matrix

### `admin` Role

Admins have broad tool access. The three critical-risk agents use `admin` role.

| Tool Category | Allowed |
|-------------|--------|
| All orchestrator tools (read + write) | YES |
| All downstream MCP tools | YES |
| Proposal create/review/approve | YES |
| DB write tools | YES (with `SET LOCAL app.actor_id`) |
| Emergency override tools | YES (with audit) |
| System config tools | YES |

### `operator` Role

Operators have task execution permissions but limited governance permissions.

| Tool Category | Allowed |
|-------------|--------|
| All orchestrator read tools | YES |
| Downstream MCP read tools (their own MCP + cross-MCP reads) | YES |
| Downstream MCP write tools (their own MCP only) | YES |
| Proposal create | YES |
| Proposal approve | NO (review only) |
| Emergency override | NO |
| System config | NO |

### `viewer` Role

Viewers are read-only.

| Tool Category | Allowed |
|-------------|--------|
| Orchestrator read tools | YES |
| Downstream MCP read tools | YES |
| Any write tool | NO |
| Proposals (any) | NO |

### `service` Role

Service accounts for machine-to-machine calls.

| Tool Category | Allowed |
|-------------|--------|
| Specific tools declared in service account config | YES |
| All other tools | NO |

---

## 3. Per-Agent Tool Permission Table (spec §14.3)

| agent_id | role | additional_allowed_tools | additional_forbidden_tools |
|---------|------|------------------------|--------------------------|
| `agent-orchestrator` | admin | All tools | None explicitly forbidden |
| `agent-security` | admin | `security_policy_check`, `security_alert`, `security_inbox` | Direct DB writes outside security schema |
| `agent-devops` | admin | `devops_*`, `deployment_*` | Bypassing readiness check |
| `agent-knowledge` | operator | `knowledge_search`, `knowledge_index`, `graph_lookup` | `security_*`, `deployment_*` |
| `agent-skills` | operator | `skills_search`, `skills_compose` | `security_*`, `deployment_*`, `devops_*` |
| `agent-debugs` | operator | `debugs_diagnose`, `debugs_postmortem`, `knowledge_search` | `deployment_*`, `security_policy_update` |
| `agent-review` | operator | `review_proposal`, `review_checklist`, `review_simulate_apply` | `review_approve` (cannot approve own work) |
| `agent-testing` | operator | `testing_strategy`, `testing_quality_gate`, `testing_regression_risk` | `deployment_*` |
| `agent-codegraph` | operator | `codegraph_analyze`, `codegraph_impact`, `knowledge_search` | `security_policy_update`, `deployment_*` |
| `agent-standards` | operator | `standards_check`, `standards_search` | All write tools |
| `agent-graphlayer` | operator | `graphlayer_query`, `graphlayer_compress` | `graph_node_approve` |

---

## 4. Tool Permission Override

A tool permission override allows an agent to temporarily use a tool outside its normal permissions.

**Conditions:**
1. Only `nottoei` or platform owner may grant overrides
2. Override is time-bounded (maximum 1 hour)
3. Override is logged with reason
4. Override is automatically revoked when the time expires or the task completes

**Override is NOT available for:**
- Tools that modify security policies
- Tools that bypass multi-tenant isolation
- Tools that write to another MCP's schema

---

## 5. New Tool Onboarding

When a new tool is added to any MCP:

1. The tool must be classified by default as: `deny_all` (no agent has access by default)
2. The owning MCP's team proposes which roles/agents should have access
3. Platform owner approves the permission grant
4. Permission is added to this policy and to the agent's context package

---

## Related Documents

- `llm-guardrail-policy.md` — G-05 enforces this policy at runtime
- `human-escalation-policy.md` — Tool permission violations trigger escalation
- `agent-behavior-policy.md` — Rule B-3: No tool outside permissions

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — role matrix + per-agent overrides |
