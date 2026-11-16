# task-spec 2.0 evaluation — 2026-11-16

Three [behavioral cases](../../skills/engineering/task-spec/evals/evals.json) were
executed in separate agent contexts using the new skill. The author graded the
reports and executable evidence: **12 of 12 assertions passed**. These are small
synthetic scenarios, not a representative quality or performance benchmark.

| Case | Observed behavior | Additional workflow |
|---|---|---|
| Routine local repair | Changed the clamp upper bound from 99 to 100; seven focused executable checks passed | No plan file, extra agent, or phase restart |
| Adapt a mistaken draft plan | Corrected assistant-authored uniqueness criterion against the user's duplicate-preservation requirement; inspected/reused existing helper; four behavior checks passed; helper unchanged | No unnecessary approval, extra agent, or phase restart |
| Consequential plan-only request | Delivered a migration plan preserving the cutover approval gate; addressed content reconciliation, concurrency, readers and tested recovery; did not execute or request immediate approval | One focused independent recovery check; clarified fault-domain requirements; no additional review round |

A separate focused read-only check of the final skill and outline found no
supported loophole permitting unauthorized work, weakening user requirements, or
omitting necessary verification. This is limited reviewer evidence, not proof of
absence. The risk scenario's plan coverage is not proof of operational feasibility.

The SKILL.md file decreased from **18,042 to 9,942 UTF-8 bytes (44.9%)**, compared
with the integration-adapted version immediately before this rewrite. The old
snapshot, execution reports, and generated review viewer are retained locally in
`.review-scratch/task-spec-upgrade/`, which is not distributed. No old/new runtime
A/B benchmark was run and total token/latency savings were not measured. Static
size reduction and observed absence of routine gates do not establish universal
quality or production-time savings.

Repository validation covers plugin/skill and release metadata, changed JSON and
relative Markdown links, evaluation fixture syntax, and whitespace checks. Further
validation should include ambiguous real tasks, explicit implementation commitments,
repeated local failures, and multi-worker integration, with matched model versions,
inputs, permissions and budgets across repeated old/new executions.
