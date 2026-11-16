---
name: adversarial-review-loop
description: >
  Risk-proportionate adversarial review of changes, proposals, specifications, migrations,
  and other artifacts against their intended outcome. Use when asked to review carefully,
  find substantive defects, review with subagents, adjudicate disputed findings, or verify
  fixes; also use when a consequential change warrants adversarial scrutiny. Review, handle
  supported findings, and verify with effort matched to risk. Supports review-only
  (judge-only) and authorized review-and-fix work. Routine proofreading needs no review loop.
---

# Adversarial review with a cost boundary

Find and resolve problems that materially affect the result, at reasonable cost. Trust the
reviewer's ability to investigate and discard weak suspicions. Spend extra effort where
impact, uncertainty, or disagreement makes it useful. Neither a long finding list nor an
empty one proves review quality.

## 1. Establish the review boundary

Use the user's request, applicable specification, and owning sources to identify the object,
what success means, and what is outside scope. Reuse available context; do not create a spec
or copy files just to start a review. State consequential assumptions briefly. Ask a focused
question when a missing decision changes correctness, scope, or authorization; no exhaustive
search or second agent is needed to earn the right to ask. Continue independent work.

Choose the mode from authorization and ownership:

- **Review-only / judge-only:** inspect and return supported findings and material unknowns.
  Do not edit the object or run an internal fix loop. A caller that owns repairs also owns
  re-entry; do not duplicate its verification.
- **Review-and-fix / full round:** make authorized, in-scope repairs and verify the result.
  A request to review alone does not authorize repairs.

Default to one review pass followed by necessary verification. Honor user time/token limits.
For a large or uncertain review, state a practical coverage and effort boundary before
starting. Prioritize consequential paths; disclose unreviewed areas rather than implying full
coverage. Do not reject a large object solely because of its file or line count.

## 2. Review for substantive failures

Read the actual artifact or diff and enough surrounding context to understand its effects.
For changes, include relevant staged, unstaged, and new files; inspect them without modifying
the Git index just to make a diff. Follow affected callers, contracts, and failure paths where
there is a plausible dependency. Check what should have changed alongside the edit.

A finding needs a concrete location, a condition under which something goes wrong, its impact,
and enough evidence to check the claim. For a document, that may be a conflicting requirement
or a decision that cannot achieve its stated outcome. Severity follows impact, not rhetoric.
A useful fix direction is welcome; a ready-to-apply patch is not required.

Investigate doubts before reporting them. Drop disproven or unsupported speculation without
writing a defense of every discarded idea. Deduplicate shared causes and narrow overstated
claims to the part supported by evidence. Do not invent findings to satisfy a quota, report
personal preferences as defects, or turn excluded work into omissions.

Keep consequential unknowns distinct from confirmed defects: explain the plausible risk,
what is missing, and what would resolve it. Lack of proof is neither proof of a defect nor
proof of safety. Low-impact suggestions need not enter the repair queue.

## 3. Handle findings; escalate selectively

The lead can accept, narrow, or dismiss findings using the available evidence. Straightforward
findings do not need a separate adjudicator. Resolve material disagreement with evidence,
not a vote or automatic deference to either author or reviewer.

Seek an independent check when a consequential dispute remains, a high-impact claim rests on
uncertain evidence, or the proposed repair would change an agreed constraint. Independently
review critical assumptions before relying on them for an irreversible or externally binding
decision, even if the first reviewer found nothing. Deterministic checks can establish facts;
another opinion cannot settle a missing user decision.

Give the independent checker the disputed claim, relevant evidence and constraints, and the
specific question to settle. They should inspect owning sources rather than merely agree.
Return a short conclusion and its decisive basis: supported, narrowed, unsupported, or
unresolved. An unsupported claim needs an explanation, not an exhaustive proof of absence.
Unresolved material risk remains visible and must not be described as a pass.

Fix supported defects within authorization and scope. If the cause is broader than the
reported instance, investigate its necessary reach; do not automatically authorize a wider
redesign. Report unrelated existing defects only when useful, and keep them out of the repair
set. Defer low-impact work explicitly when it matters to the user's decision.

## 4. Verify repairs and decide whether to continue

Verify the actual changes, not the proposed patch alone. Use a baseline or before/after copy
when useful; inspect the final diff and preserve unrelated user changes.

Choose verification for the remaining risk:

- Local, deterministic repair: a focused test, reproduction, or direct consistency check.
- Changes across contracts or paths: inspect affected dependencies and run relevant checks.
- Consequential uncertainty or newly introduced substantive defects: targeted independent
  re-review of the changed area and its dependencies.

The original reviewer may check repairs. Use a fresh reviewer when repeated mistakes,
anchoring, or a persistent disagreement makes that worthwhile, not merely because a new pass
started. Reuse evidence that still applies to the final state; rerun checks only when changes
invalidate it or leave a relevant question unanswered. Do not run a full suite by default.

Stop when supported in-scope defects are handled and verification adequately addresses the
remaining risk. No mandatory zero-finding round is needed. Before any additional review pass,
name the unresolved substantive risk and the check likely to resolve it; “there may be more”
is not a reason. Stop cycling when new passes produce no useful evidence or repeat the same
dispute. At an effort limit, report what remains and the next useful action. A budget stop or
missing evidence is not a successful verification; do not recommend proceeding with an
unresolved critical risk.

## 5. Use agents only where they help

The lead coordinates directly by default. Review alone for routine work. Use an independent
reviewer when the user requests one or when an outside perspective is valuable for a
consequential assumption or change. If independent review is needed but unavailable, state
the limitation; do not label another pass in the same context independent.

A single reviewer can investigate, filter, and explain findings. Add an adjudicator only for
the escalation cases above. Split substantial independent areas when it improves coverage or
latency enough to justify extra context; avoid duplicate reading. Use a separate orchestrator
only when coordination would otherwise overwhelm the lead, not as a mandatory layer.

Each delegated task needs the object location, relevant criteria, exclusions, a focused scope,
and a read-only constraint unless edits are explicitly assigned. Share concise context and
source pointers; copy excerpts only when the recipient cannot access the source. Request
supported findings and material unknowns, not an exhaustive investigation diary. Parallelize
independent work and serialize edits to the same files. These rules apply to this review,
not to every unrelated multi-agent task.

## 6. Report what matters

Lead with the outcome. Include substantive findings (location, failure/impact, decisive basis),
what was fixed or deferred, relevant verification, and material unknowns or coverage limits.
Scale the report to the work. Link evidence once; quote or attach raw output only when it helps
someone reproduce or assess a result. No mandatory tables, empty sections, confidence scores,
per-round ledgers, or repeated evidence blocks.

For a longer review, keep a short checkpoint only if needed to resume reliably. Record open
issues, relevant decisions, and evidence locations rather than duplicating the artifact.

**Caller compatibility:** `judge-only` still returns findings without repairs. A caller can
request severity labels or the legacy verdicts: `valid`, `partially valid`, `invalid`, and
`part of a larger problem`. Return supported findings in their narrowed or corrected form;
keep unresolved risks separate instead of forcing them into one of those verdicts. The names
do not require universal independent adjudication or a zero-finding loop. Explicit caller
acceptance criteria still apply; do not silently weaken them to close a gate.
