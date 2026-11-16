# adversarial-review-loop: judgment before ceremony

[中文版](./adversarial-review-loop.zh.md) | English

The [skill](../../skills/engineering/adversarial-review-loop/SKILL.md) aims to find
and resolve substantive defects at reasonable cost. It trusts routine reviewer
judgment and adds independent scrutiny where risk, uncertainty, or disagreement
makes it valuable. A long list of suspicions is not a measure of quality.

## What changed in 2.0

The previous design compensated for possible mistakes with universal independent
adjudication, a default orchestrator, fresh contexts on re-review, and a loop that
had to reach zero findings. Each safeguard had a reason, but their combined cost
was paid even for simple repairs. Keeping intermediate output out of the lead's
context did not remove the system's total reading and reporting work.

The new default is **review → handle supported findings → verify appropriately**.
The lead coordinates directly. A reviewer can investigate and discard weak claims.
Consequential disputes, uncertain high-impact claims, and critical assumptions for
irreversible decisions receive independent checks. There is no obligation to write
counter-evidence for every abandoned suspicion. Material unknowns remain visible;
uncertainty is not relabeled as either a proven defect or a pass.

## Two ownership modes

- **Review-only / judge-only:** return supported findings and material unknowns;
  leave repairs and re-entry to the caller.
- **Review-and-fix / full round:** perform authorized, in-scope repairs and verify
  the actual result. Asking for review alone does not authorize changes.

`task-spec` uses judge-only mode when a consequential question warrants review;
it owns repairs and routes failures to the affected implementation or decision.
Legacy verdict labels remain available to callers, without restoring universal
adjudication. A broader cause is useful evidence, not permission for a redesign.

## Verification follows risk

A local deterministic repair can end with a focused test or consistency check.
A contract change needs checks of affected dependencies. A consequential unresolved
risk can justify targeted independent re-review. The original reviewer may verify
repairs, and evidence still valid for the final state can be reused.

Inspect actual changes, including relevant new files, rather than assuming the
proposed patch landed exactly. Snapshots and baselines are allowed when useful.
Additional review needs a named substantive risk and a useful next check. Repeated
speculation is not a reason for another round. At a cost boundary, report remaining
risk and the next action; do not claim successful verification merely because time
ran out. An empty finding list also cannot prove correctness.

## How to assess the upgrade

Use local repairs, changes spanning files, and high-risk proposals to check both
quality and restraint: catch the important defect, avoid speculative edits, preserve
review-only boundaries, and escalate consequential uncertainty. Evaluation cases
live in [evals.json](../../skills/engineering/adversarial-review-loop/evals/evals.json).

A shorter skill and fewer mandatory handoffs reduce prescribed work. Actual token
and latency savings require comparable execution traces; static size reductions
and scenario checks alone do not establish those savings or universal quality.
