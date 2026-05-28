# Continuous Improvement Workflow

**Standard ID:** STD-LLMOPS-CI-WORKFLOW-001
**Category:** llmops/feedback-loop
**Priority:** high
**Owner MCP:** CerebraLLMOps-mcp

## Purpose

10-step continuous improvement loop from spec §15.3. This is the operational workflow that converts raw feedback signals into verified improvements.

---

## The 10-Step Loop

### Step 1: Collect

**What:** Ingest feedback from all sources (Review, Debug, Testing, Security, Standards, human reviewers, eval failures).

**How:** All sources call `llmops_record_feedback`. Feedback is written to `llmops.feedback_items` table.

**Frequency:** Continuous (real-time ingestion).

**Output:** New feedback items in `open` status.

---

### Step 2: Classify

**What:** Classify each feedback item by type and severity.

**How:** Automated classification using feedback metadata:
- `feedback_type` → which domain this affects (prompt / agent / model / policy)
- `severity` → how urgent the response is
- `target_id` → which specific artifact is affected

**Frequency:** Every 5 minutes (batch job).

**Output:** Feedback items updated with `classified: true` and `classification_confidence`.

---

### Step 3: Link

**What:** Link each feedback item to existing failure patterns (if any match).

**How:** Semantic similarity search against `failure-pattern-registry.md` entries. If similarity > 0.8 → link to existing pattern. If < 0.8 → mark as `novel_signal`.

**Frequency:** Every 5 minutes (same batch as classify).

**Output:** Feedback items linked to patterns; `linked_pattern_id` populated.

---

### Step 4: Check for Repeat (Threshold Check)

**What:** Determine if the linked pattern (or novel signal) has crossed the threshold for auto-proposal.

**Thresholds (per CLAUDE.md Rule 7):**
- `critical` severity: threshold = 1 occurrence
- `high` severity: threshold = 2 occurrences within 7 days
- `medium` severity: threshold = 3 occurrences within 7 days
- `low` severity: threshold = 5 occurrences within 30 days

**Frequency:** Every hour.

**Output:** Patterns that crossed threshold are flagged for backlog addition.

---

### Step 5: Backlog

**What:** Add crossed-threshold patterns as improvement backlog items.

**How:** Auto-create an entry in `improvement-backlog.md` with:
- Linked pattern ID(s)
- Linked feedback item IDs
- Suggested change (generated from pattern + feedback detail)
- Priority (derived from severity)
- Status: `open`

Platform owner reviews and confirms/modifies the backlog item.

**Frequency:** Daily review by platform owner.

**Output:** Confirmed improvement backlog items.

---

### Step 6: Propose

**What:** Create a formal change proposal via the Orchestrator proposal workflow.

**How:** For each `in_progress` backlog item:
- Create Orchestrator proposal (`orchestrator_proposal_create`) with: change description, rationale, linked evidence, expected improvement
- Assign to the appropriate change workflow (prompt versioning / agent instruction / eval case / guardrail update)

**Frequency:** As each backlog item is ready for implementation.

**Output:** Proposal ID linked to backlog item; implementation begins.

---

### Step 7: Eval

**What:** Evaluate the proposed change before releasing it.

**How:**
- For prompt changes: run `prompt-regression-test-policy.md` regression eval
- For agent instruction changes: run agent eval suite + agent behavior eval
- For eval case additions: run the full suite with the new cases added
- For guardrail changes: run the full regression suite under the new guardrail

Pass threshold must be met before proceeding to review.

**Frequency:** Triggered by implementation completion.

**Output:** Eval result with pass/fail; linked to the proposal.

---

### Step 8: Review

**What:** Human review of the proposed change.

**How:** Submit eval result to CerebraReview-mcp for review. Reviewer checks:
- Change addresses the identified pattern
- Eval pass rate is above threshold
- No regressions introduced
- Rollback plan is in place

**Frequency:** Within 24 hours of eval completion (high priority) or 1 week (low priority).

**Output:** Review decision: `approved` / `rejected` / `conditional`.

---

### Step 9: Release

**What:** Promote the approved change to production.

**How:**
- Run `llmops-release-readiness-checklist.md` (15 items)
- Set new version to `active`; prior version to `superseded`
- Update registry entries
- Log change with all audit fields

**Frequency:** After review approval.

**Output:** Change is live in production.

---

### Step 10: Monitor

**What:** Verify that the change reduced the failure pattern's occurrence rate.

**How:**
- Monitor the linked pattern's frequency for 30 days post-release
- Compare post-release rate to pre-release rate
- Evaluation criteria:
  - > 80% reduction → pattern `resolved` → improvement `completed` (effective)
  - 50–80% reduction → pattern `monitoring` → improvement `partially effective` (review further)
  - < 50% reduction → pattern `open` → improvement `incomplete` (re-escalate)

**Frequency:** Weekly check for 30 days; final assessment at 30 days.

**Output:** Improvement effectiveness verdict; failure pattern status updated.

---

## Loop Timing Summary

| Step | Frequency |
|------|-----------|
| Collect | Real-time |
| Classify + Link | Every 5 minutes |
| Threshold check | Every hour |
| Backlog review | Daily |
| Propose | As-needed (when backlog item moves to in_progress) |
| Eval | After implementation |
| Review | 24h or 1 week |
| Release | After review |
| Monitor | 30 days |

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-05-28 | sonnet | Initial — 10-step loop from spec §15.3 |
