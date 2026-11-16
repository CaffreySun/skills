# task-spec: planning that supports judgment

[中文版](./task-spec.zh.md) | English

The [skill](../../skills/engineering/task-spec/SKILL.md) helps an agent decide how
much planning a task needs, what to investigate, and when to update its approach.
Its purpose is to achieve the user's outcome with evidence, not to make every task
pass through a fixed set of phases.

## Requirements stay authoritative; implementation plans can change

User instructions, agreed behavior, permissions, and explicit approval gates are
constraints. A plan written by the assistant is a working model of how to satisfy
them. It cannot silently narrow the request or override a prescribed procedure.

That distinction permits useful adaptation: reuse a discovered helper, combine
steps, or correct a mistaken hypothesis without restarting the task. If the user
explicitly approved an implementation choice or procedure, changing it requires
the corresponding authorization; “adaptive” does not mean free to ignore it.

Verification returns to the original request and the actual result. If a draft
criterion says “unique sorted names” but the request says to preserve duplicates,
correct the draft and implementation. Passing the faulty criterion is not success.

## Planning depth follows uncertainty and consequences

Routine, reversible work can proceed after inspection and finish with a focused
check. Work with meaningful dependencies or choices benefits from a short approach
and observable acceptance criteria. Hard-to-reverse decisions need inspectable
assumptions, safeguards, recovery, and validation before commitment. A one-line
destructive command can require more planning than a broad mechanical edit.

These are examples for judgment, not mandatory tiers to announce. There is no
minimum number of alternatives, edge cases, or simplification findings. Explore
only questions that can affect the decision; a reversible isolated experiment may
settle one more effectively than a long speculative spec.

A persisted plan is useful for handoff, long work, or an explicit request. The
[outline](../../skills/engineering/task-spec/references/spec-template.md) is
optional. Keep the current approach readable, with only useful decision history.
A plan-only request ends with the deliverable and its limitations, not execution.

## Failure routes to the decision it invalidates

| Evidence | Appropriate response |
|---|---|
| Local implementation error | Fix it and rerun affected checks |
| Better implementation detail | Adapt within constraints |
| Invalid design assumption | Revisit that choice and its dependents |
| Requirement or authorization conflict | Resolve it before dependent action |

This replaces the old rule that every verification finding goes back through
Explore → Spec → Challenge → Execute → Verify. Repeated failed attempts still
require a new diagnosis or targeted help; local repair is not endless patching.
Complex substeps do not automatically inherit another full workflow.

## Independent review is a tool, not two compulsory gates

Use independent scrutiny for an explicit request, a critical assumption before
an irreversible commitment, or consequential disagreement and uncertainty. If
`adversarial-review-loop` is available, use its review-only mode on the relevant
plan or changes. Share the original requirements and source evidence. The task
owner handles repairs once and verifies affected results.

No review skill is required for routine work. An independent opinion cannot prove
backup recoverability or grant permission. If the reviewer or necessary evidence
is unavailable, disclose the gap rather than treating the decision as validated.

## What was removed, and what remains

The old design enforced universal triggering, immutable assistant-authored plans,
challenge quotas, two independent gates, full-cycle retries, and recursive phase
loops. Those safeguards imposed fixed costs even where the model could make a
sound local decision. The new design keeps goal understanding, scope control,
real trade-offs, evidence, and consequential independent scrutiny.

Planning depth and verification still require judgment, and a short prompt cannot
prove that judgment is always correct. The [behavioral cases](../../skills/engineering/task-spec/evals/evals.json)
check routine repair, correction of a faulty draft plan, and a consequential
plan-only request. Static prompt reduction is not a runtime token or latency
benchmark; those claims require comparable repeated executions.
