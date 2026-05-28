# LLMOps Governance Rules

**Standard ID:** STD-LLMOPS-GOVERNANCE-001
**Category:** llmops
**Priority:** critical
**Applies To:** all-tasks
**Owner MCP:** CerebraLLMOps-mcp

## 1. Purpose

Defines who can make changes to LLMOps registries and policies, what approval workflows apply, what audit requirements must be met, and which changes are completely restricted.

---

## 2. Permission Matrix

### 2.1 Prompt Registry

| Action | Who Can Do It | Approval Required |
|--------|--------------|-------------------|
| Register a new prompt (status: draft) | Any agent with `operator` role | No |
| Promote prompt from draft → review | Owning MCP's service account | No |
| Promote prompt from review → active | Reviewer with `operator` role + second reviewer | Yes — requires 2 approvals |
| Rollback active prompt to prior version | Platform owner or `nottoei` | Yes — requires explicit reason |
| Delete a prompt version | `nottoei` only | Yes — requires audit note |
| Modify an active prompt version | **FORBIDDEN** — versions are immutable once active | N/A |

### 2.2 Agent Instruction Registry

| Action | Who Can Do It | Approval Required |
|--------|--------------|-------------------|
| Register a new agent instruction version (status: draft) | Any agent with `operator` role | No |
| Promote instruction from draft → review | Owning MCP's service account | No |
| Promote instruction from review → active | Platform owner | Yes — 1 approval |
| Rollback agent instructions | Platform owner or `nottoei` | Yes — reason required |
| Delete an instruction version | `nottoei` only | Yes — audit note required |

### 2.3 Model Routing Policy

| Action | Who Can Do It | Approval Required |
|--------|--------------|-------------------|
| View routing policy | Any authenticated agent | No |
| Update routing policy (per-risk-level model assignments) | Platform owner only | Yes — review proposal required |
| Override routing for a single run (cost override) | Platform owner only | Logged — no approval gate |
| Change fallback chain | Platform owner only | Yes — review proposal required |
| Add a new model to registry | Platform owner | Yes — readiness checklist must pass |
| Remove a model from registry | `nottoei` only | Yes — impact analysis required |

### 2.4 Guardrail Overrides

| Action | Who Can Do It | Approval Required |
|--------|--------------|-------------------|
| Override a guardrail for a single run | `nottoei` only | Logged — emergency override only |
| Disable a guardrail permanently | **FORBIDDEN** | N/A |
| Add a new guardrail | Platform owner | Yes — review proposal |
| Modify a guardrail's threshold | Platform owner | Yes — review proposal |

### 2.5 Evaluation Suites

| Action | Who Can Do It | Approval Required |
|--------|--------------|-------------------|
| Add a new eval case to a suite | Any agent with `operator` role | No (but logged) |
| Modify a golden case | Platform owner | Yes — reason required |
| Lower the pass threshold (from 80%) | `nottoei` only | Yes — risk justification |
| Raise the pass threshold | Platform owner | No |
| Delete an eval case | Platform owner | Yes — impact note required |

---

## 3. Versioning Immutability Rules

### 3.1 Prompt Versions

Once a prompt version is promoted to `active` status, it is **immutable**:

- No field in the prompt template may be changed
- If a change is needed, a new version must be registered (version bump required)
- The prior version remains in the registry with `status: superseded`
- Rollback is always available — any prior `active` version can be re-activated

### 3.2 Agent Instruction Versions

Same immutability rule as prompt versions:

- Active instruction versions cannot be modified
- Each change creates a new version entry
- Rollback restores a prior version to active status (the current active moves to `superseded`)

### 3.3 Eval Suite Cases

Golden eval cases are **append-only** in normal operation:

- Cases can be added without approval
- Cases can be disabled (soft delete) by platform owner
- Hard delete requires `nottoei` approval and a migration note

---

## 4. Audit Requirements

### 4.1 What Must Be Logged

Every change to a LLMOps registry MUST be logged with:

| Field | Description |
|-------|-------------|
| `actor_id` | Who made the change (agent_id or user_id) |
| `action` | What was done (e.g. `promote_prompt`, `update_routing_policy`) |
| `target_id` | The affected resource ID |
| `old_value` | Previous state (for updates) |
| `new_value` | New state |
| `reason` | Mandatory for all changes — cannot be empty |
| `timestamp` | ISO 8601 |
| `approval_ids` | IDs of approvals if required |

### 4.2 Log Retention

- Prompt and agent instruction change logs: **forever** (immutable append-only audit log)
- LLM run traces: **90 days** (then archived, not deleted)
- Eval results: **90 days** (then archived)
- Cost/token records: **2 years** (for billing compliance)

### 4.3 Audit Access

- Audit logs readable by: `admin`, `platform owner`, `nottoei`
- Audit logs NOT readable by: agents (no self-audit), `viewer` role
- Audit log tampering: **FORBIDDEN** — append-only enforced at DB level

---

## 5. Emergency Override Procedures

In production incidents where a guardrail or routing policy must be bypassed:

1. **Only `nottoei` may authorize emergency override**
2. Emergency must be declared: log reason + expected duration + rollback plan
3. Override is time-bounded: maximum 4 hours, then auto-reverted
4. Post-incident review MUST be completed within 48 hours
5. Override is logged with `type: emergency` and linked to the incident ticket

---

## 6. Self-Improvement Governance

When an agent proposes a change to its own instructions or prompts via the feedback loop:

1. Agent submits a `gap_signal` (see CLAUDE.md Rule 7)
2. Gap aggregator clusters signals
3. If threshold crossed, auto-proposal created via Orchestrator proposal workflow
4. Proposal includes: current version, proposed change, evidence (failure patterns), expected improvement
5. Platform owner reviews and approves or rejects
6. Approved proposals are implemented by LLMOps service (not by the proposing agent)
7. Post-implementation eval runs to verify improvement
8. Result logged to feedback loop

**Agents may NOT modify their own instructions directly.** All improvements go through this workflow.

---

## 7. Forbidden Actions

The following actions are absolutely forbidden and will be blocked at the enforcement layer:

1. Modifying an `active` prompt or instruction version in-place
2. Bypassing the promotion workflow (draft → review → active)
3. Disabling guardrails permanently
4. Accessing another tenant's LLMOps data
5. Deleting trace records before the 90-day retention period
6. Writing directly to the `llmops` Postgres schema without `SET LOCAL app.actor_id`
7. Calling LLM APIs directly without going through LLMOps routing
8. Lowering eval pass threshold below 60% (hard floor — cannot be changed by anyone)

---

## 8. Related Documents

- `content/quality-gates/llmops-release-readiness-checklist.md` — 15 items before any change release
- `content/guardrails/llm-guardrail-policy.md` — Active guardrail definitions
- `content/evaluation/evaluation-strategy.md` — Eval pass threshold details
- `CLAUDE.md § Rule 7` — Gap signal workflow

## 9. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial |
