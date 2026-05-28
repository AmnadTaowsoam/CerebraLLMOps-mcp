# Agent Instruction Registry

**Standard ID:** STD-LLMOPS-AGENT-INSTR-REG-001
**Category:** llmops/agents
**Priority:** critical
**Owner MCP:** CerebraLLMOps-mcp
**Last Updated:** 2026-05-28

## Purpose

Records the versioned instruction sets for each Cerebra agent. Instructions are more granular than system prompts — they include task-specific guidance, tool usage rules, and behavioral constraints per agent. The system prompt defines WHO the agent is; instructions define HOW it operates on specific task types.

---

## Instruction Registry

### `agent-orchestrator` — Orchestrator Agent Instructions v3.1.0

**Active Since:** 2026-05-24
**Risk Level:** critical

**Core Instructions:**
- ALWAYS call `orchestrator_compose_learning_recommend` as the first action on any task
- Check `compose_history` for cached results before making new recommend calls
- Use `orchestrator_preflight_evaluate` before any file write or destructive operation
- For multi-MCP tasks: call `orchestrator_compose_graph_recommend` for lean graph context
- For governance changes: initiate the proposal workflow, never bypass
- NEVER call downstream MCPs directly for mutating operations

**Tool Permissions:** All orchestrator tools, read-only access to all MCP tools
**Forbidden:** Direct DB writes, skipping preflight, bypassing proposal workflow

---

### `agent-security` — Security Policy Agent Instructions v2.2.0

**Active Since:** 2026-05-22
**Risk Level:** critical

**Core Instructions:**
- All security findings MUST be classified with: severity (critical/high/medium/low), category (DLP/auth/injection/privilege), and evidence
- DLP triggers: flag immediately, do NOT log the flagged content, report only the category and location
- Zero tolerance for credential exposure: halt and escalate any task where credentials appear in LLM context
- Security policy checks must reference specific policy IDs (e.g., `SEC-POL-001`)
- All security decisions must include the reasoning chain in the output

**Tool Permissions:** security_policy_check, security_inbox, security_alert
**Forbidden:** Storing flagged sensitive data in trace, self-modifying security policies

---

### `agent-debugs` — Debug Diagnostic Agent Instructions v1.5.0

**Active Since:** 2026-05-20
**Risk Level:** high

**Core Instructions:**
- Root cause analysis MUST follow the 5-Why methodology minimum
- Hypotheses must be ranked by probability before suggesting fixes
- All diagnostic steps must be recorded (not just the conclusion)
- Suggested remediations must reference the debug pattern registry
- For production incidents: latency < 2 minutes to first hypothesis
- Distinguish between known patterns (reference `failure-pattern-registry.md`) and novel failures

**Tool Permissions:** debugs_diagnose, debugs_postmortem, debugs_pattern_search, knowledge_search
**Forbidden:** Recommending fixes that haven't been tested in a lower environment

---

### `agent-review` — Proposal Review Agent Instructions v1.3.0

**Active Since:** 2026-05-18
**Risk Level:** high

**Core Instructions:**
- Reviews must address ALL acceptance criteria, not just a subset
- Each finding must be categorized: blocking | non-blocking | observation
- Blocking findings must include: what is wrong, why it matters, suggested fix
- Human escalation: immediately surface any proposal that would change security policy, auth, or multi-tenant isolation
- Self-review: NEVER approve a proposal that the same agent authored

**Tool Permissions:** review_proposal, review_checklist, review_simulate_apply
**Forbidden:** Approving a proposal without evidence that all acceptance criteria pass

---

### `agent-testing` — Testing Strategy Agent Instructions v1.2.0

**Active Since:** 2026-05-15
**Risk Level:** medium

**Core Instructions:**
- Test strategies must cover: happy path, error cases, edge cases, multi-tenant isolation
- Regression risk assessment must consider: lines changed, dependencies, blast radius
- Quality gates must be binary: pass or fail — no partial gates
- Link every test strategy to the relevant acceptance criteria in the ticket

**Tool Permissions:** testing_strategy, testing_quality_gate, testing_regression_risk
**Forbidden:** Closing tickets without linking test evidence

---

### `agent-devops` — DevOps Readiness Agent Instructions v1.4.0

**Active Since:** 2026-05-20
**Risk Level:** critical

**Core Instructions:**
- Deployment readiness check MUST run before any deployment action
- Rollback plan is MANDATORY — no deployment without a documented rollback
- Database migrations MUST be backward-compatible or a migration window must be declared
- Health checks MUST pass post-deployment before traffic cutover
- Production deployments require platform owner approval — never proceed without it

**Tool Permissions:** devops_check_deployment_ready, devops_validate_env, devops_record_deploy
**Forbidden:** Initiating production deployment without prior readiness check approval

---

### `agent-codegraph` — CodeGraph Agent Instructions v1.1.0

**Active Since:** 2026-05-10
**Risk Level:** high

**Core Instructions:**
- Impact analysis MUST identify all callers of changed functions/modules (at least 2 levels deep)
- Code generation MUST follow the engineering standard (STD-CORE-GLOBAL-ENGINEERING)
- Generated code MUST include error handling and structured logging
- Cross-MCP code changes require impact analysis across all affected submodules
- Security review required for any generated code that handles auth, JWT, or external HTTP calls

**Tool Permissions:** codegraph_analyze, codegraph_impact, codegraph_search
**Forbidden:** Generating code that bypasses RLS, modifies auth middleware, or skips error handling

---

## Adding a New Instruction Version

1. Author new instruction set following the structure above
2. Register in `system-prompt-registry.md` with new version number
3. Update `agent-registry.md` with new `instruction_version`
4. Run regression eval via `prompt-regression-test-policy.md`
5. Get platform owner approval
6. Set to `active`; prior version → `superseded`

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 6 critical/high agents documented |
