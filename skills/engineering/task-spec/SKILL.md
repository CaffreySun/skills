---
name: task-spec
description: >
  Plan and carry out work with effort matched to uncertainty, consequence, and coordination
  needs. Use for ambiguous or multi-step changes, consequential design decisions, tasks
  needing an inspectable plan or handoff, and explicit requests to use task-spec. Clarify
  outcomes, resolve decision-relevant unknowns, adapt implementation as evidence arrives,
  and verify the actual result. Routine, clear, reversible work needs no formal spec or
  mandatory planning ceremony; a request for a plan alone does not authorize execution.
---

# Plan enough to act; adapt with evidence

Use planning to reduce costly mistakes and coordinate work, not to prove that a process ran.
Trust routine judgment. Spend effort on decisions whose uncertainty or consequences justify
it, and verify against the user's intended result. A successful task may need no loop.

## 1. Anchor the work in the request

Identify the intended outcome, relevant constraints, authorization, and what evidence would
show success. Inspect the current state and owning sources enough to avoid acting on a false
premise. Reuse clear requirements and existing plans rather than rewriting them for ceremony.

Keep two things distinct:

- **Requirements and commitments:** user instructions, agreed behavior, scope, compatibility,
  safety and permission boundaries. An assistant-authored plan cannot override them or turn
  an omission into an exclusion. Explicitly approved implementation choices and prescribed
  procedures are constraints too, until the user authorizes a change.
- **Working plan:** hypotheses, implementation choices, step order, and proposed checks. These
  can change as evidence arrives within those constraints. A draft is not a new authority.

Ask when a missing fact or preference materially changes the outcome or authorization and
cannot be resolved from available sources. Routine reversible implementation choices belong
to the agent; choose a reasonable approach and proceed. Do not exhaust every possible source
before asking a focused question. If a necessary answer is pending, continue unaffected work
without assuming permission for the dependent action.

## 2. Match planning depth to the decision

Choose the least structure that makes the next meaningful action sound:

- Clear, local, reversible work: inspect, act, and check. No spec file, alternative list,
  exemption statement, or independent challenge is needed merely to use this skill.
- Work with dependencies or a meaningful design choice: briefly state the approach, relevant
  trade-off, and success checks. Use a short plan when it helps the user follow the work.
- High-consequence, hard-to-reverse, or coordinated work: make the important decisions and
  safeguards inspectable before committing. Address critical assumptions, affected interfaces,
  failure recovery, and validation. A one-line command may belong here; file count is not risk.

Increase depth when evidence reveals a larger consequence or unknown. Reduce it when checks
settle the uncertainty. Do not turn these examples into mandatory tiers or a classification
report. Honor an explicit request for a detailed spec, formal review, or approval gate.

Investigate questions that could change the approach. Compare alternatives only when there
is a real choice; describe the trade-off that matters, without inventing an inferior option
or proving that no other approach exists. A small experiment can be better than a long plan:
keep it within authorization, reversible, and isolated from consequential state. Stop exploring
when another search is unlikely to change the next decision. Do not guess critical facts to
save time; expose unresolved uncertainty and avoid dependent commitments.

## 3. Make a useful plan when needed

A plan should make the intended result and important decisions understandable, without
pretending every implementation detail is known. Include only what helps this task:

- Outcome and relevant requirements, with sources where ambiguity matters.
- Approach and dependencies; the reason for a consequential choice.
- Observable success criteria derived from the request, and how to check them.
- Important uncertainty, scope boundaries, or recovery conditions.

Describe behavior rather than arbitrary test counts: for example, “legacy and new payloads
both preserve their meaning,” with the relevant compatibility check. Existing tests can be
part of the evidence; passing them alone does not establish a requirement they never cover.
Do not soften a criterion because implementation failed it. Correct an inaccurate criterion
against the original requirement and disclose a consequential correction.

Save a plan when requested, needed for a handoff, or useful for longer work. Use an existing
project convention, otherwise `.task_spec/<slug>.md` is a reasonable location. The optional
[plan outline](references/spec-template.md) is for that situation, not a required form. Keep
the current plan readable; retain only decisions or previous attempts needed to explain or
resume the work. No append-only cycle log or separate spec per subtask is required.

A plan-only request ends with the requested plan and material unknowns. Do not implement it
or seek execution approval merely because the plan is ready.

## 4. Challenge consequential assumptions selectively

Ask what could invalidate the approach before an expensive commitment. Check the relevant
edge cases, dependencies, and assumptions; there is no quota of alternatives, flaws, or
simplifications to produce. Straightforward work needs no separate Challenge phase.

Use independent scrutiny when requested, or when a critical assumption for an irreversible
or externally binding decision needs a second perspective. It also helps with consequential
disagreement or uncertainty that direct checks have not settled. Target the decision, not the
whole workflow by default. An opinion cannot substitute for missing operational evidence or
user authorization. If independence is unavailable, disclose that limit and do not treat it
as a passed gate.

When substantive adversarial review is useful and `adversarial-review-loop` is available,
use its **review-only / judge-only** mode for the plan or relevant changes. Give the reviewer
the original requirements, focused question, source locations, and meaningful exclusions;
request supported findings and material unknowns. The task owner handles repairs once.
Without that skill, apply the same evidence and risk principles directly; do not invent a
second review hierarchy. Neither availability of a reviewer nor this skill's invocation
requires routine work to go through independent review.

## 5. Execute and revisit only what failed

Act within the authorized outcome and constraints. Reorder or combine steps, reuse an existing
helper, and refine implementation details when evidence supports it. Update a recorded plan
when the change affects coordination or a meaningful decision; do not stop for a new planning
cycle over routine learning. Explain material changes in approach briefly.

When a check fails or a new fact appears, diagnose what it invalidates:

| What changed or failed | Response |
|---|---|
| Local implementation defect; approach remains sound | Repair it and rerun affected checks. |
| Better implementation detail within agreed constraints | Adjust it and check affected behavior. |
| Assumption or design choice no longer holds | Revisit that decision and its dependent steps; preserve unaffected work and valid evidence. |
| Requirement conflict, changed external commitment, or missing authorization | Resolve the constraint or ask for the necessary decision before dependent work. |

Repeated failure without new evidence is a reason to reconsider the diagnosis, seek a focused
independent check, or report a blocker, not to keep applying patches or restart every phase.
Do not widen scope to fix unrelated problems. A discovered omission needed to satisfy the
original request is not automatically out of scope just because the plan missed it; check
its consequences and authorization before acting.

Break complex work into useful pieces with clear inputs and outcomes. Delegate when it adds
coverage or useful parallelism, not to reproduce this entire skill in every subtask. Give each
worker relevant constraints and a verification responsibility; the owner checks integration.
Use a progress list when it improves coordination, at whatever point it becomes useful.

## 6. Verify the result and close honestly

Compare the actual result with the original request and agreed constraints, as well as the
plan's criteria. Inspect actual changes and affected paths for omissions or unintended effects;
preserve unrelated user work. Verify proportionately: direct inspection, focused tests,
reproductions, or broader checks when impact warrants them. Add independent review for a
remaining consequential question, not as an automatic second gate.

Reuse evidence still applicable to the final state. Invalidate only the checks affected by
later changes. Group related evidence where clear; no mandatory per-criterion table or raw
output dump. A supported failure routes to the relevant repair or decision above, not
necessarily back to exploration. Required repository or user checks still apply.

Finish when the authorized outcome is met and relevant verification supports it. For planning
or analysis work, that means the requested deliverable, not executing the proposed work.
Report the result, material decisions, verification, and remaining limitations concisely.
Do not claim success from a completed plan, an empty finding list, or an exhausted budget.
Respect effort limits; when blocked or no longer making progress, name the unresolved issue,
what was tried, and the next useful action. Do not recommend a consequential commitment while
its critical prerequisites remain unverified.
