# 2.0 evaluation — 2026-11-16

The [three behavioral cases](../../skills/engineering/adversarial-review-loop/evals/evals.json)
were executed in separate agent contexts using the new skill. The author graded
reports and executable evidence against the ten assertions: all ten passed.
These are small synthetic cases, not a representative quality or performance benchmark.

| Case | Observed outcome | Additional review machinery |
|---|---|---|
| Local boundary repair | Changed `< 100` to `<= 100`; original failure reproduced and 15 focused checks passed, preserving bool/non-integer rejection | One review pass; no extra agents or rounds |
| Cross-file compatibility | Reproduced missed consumer failure on modern responses and modern client failure on legacy responses; recommended explicit-unit fallback; no source edits | One review pass; no extra agents or rounds |
| Irreversible migration | Declined approval; identified insufficient row-count gate and incomplete recovery plan; kept concurrent writes, reader migration and restoration as unknowns | One targeted independent rollback check; it narrowed an overbroad loss claim; no migration or edits |

The scenarios exercise both restraint and escalation. In particular, independent
review remained useful in the third case; it was not required for every finding.

The skill body/file decreased from 39,631 to 9,059 UTF-8 bytes (77.1%). This is a
static size comparison, **not a measured token or latency saving**. No paired
old/new runtime benchmark was run, and per-agent token accounting was not available
in the evaluation results. The old skill snapshot and raw local reports are in
`.review-scratch/adversarial-upgrade/`; that scratch directory is not distributed.

Repository checks: plugin/skill consistency, release metadata against pre-change
HEAD, JSON parsing, changed Markdown relative links, and `git diff --check` passed.
Further validation should use representative real tasks with matched models,
inputs, permissions and budgets, measuring defect recall, false-positive edits,
total tokens and wall-clock time across repeated old/new runs.
