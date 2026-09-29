---
name: task-spec
description: >
  Before acting on any task request, explore the solution space, produce an
  inspectable spec, challenge it adversarially, then execute and verify. The
  spec is a binding contract — Execute follows it, Verify judges by it. Works
  on everything from one-line commands to multi-file features.
---

# task-spec

> The spec is not a template to fill in. It is the output of a quality-control
> process. If the process doesn't loop, quality didn't happen.

## Core contract: the spec binds execution and verification

The spec produced by Explore+Spec+Challenge is not a "reference plan" — it is a
**binding contract**:
- **Execute** may only carry out what the spec has planned
- **Verify** may only judge pass/fail against the spec's stated acceptance criteria
- Anything not in the spec → outside this task's scope

The fundamental purpose of Explore+Spec+Challenge is not "write a plan first" —
it is **establish the sole, non-deviable contract that Execute and Verify will
follow**.

## The two loops

```
┌─────────────── INNER LOOP ──────────────────────┐
│                                                  │
│  Explore ──→ Spec ──→ Challenge ──(fail)──→ Spec
│                          │                ↑      │
│                          │(fail)          │      │
│                          └────────→ Explore      │
│                             ↑                    │
└─────────────────────────────│────────────────────┘
            (pass)            │
              ↓               │
           Execute ──→ Verify ──(fail)──→ Explore
                           │                ↑
                           └──(pass)────────┘
                └──────── OUTER LOOP ────────┘
```

**State transition rules (explicit):**

| Current state | Condition | Next state |
|---|---|---|
| Start | — | Explore |
| Explore | finished | Spec |
| Explore | all directions dead ends | Terminate (report to user) |
| Explore | critical info missing, cannot obtain | Terminate (report to user) |
| Explore | trade-off decision needed, not covered by docs | Terminate (report to user) |
| Spec | spec drafted | Challenge |
| Challenge | no surviving finding | Execute |
| Challenge | surviving finding, minor (wording, detail, measurability) | Spec |
| Challenge | surviving finding, major (wrong direction, incomplete traversal, flawed assumption) | Explore |
| Execute | all steps complete | Verify |
| Execute | hit something spec doesn't cover | Explore |
| Execute | blocker exceeds capability/permission | Terminate (report to user) |
| Verify | no surviving finding | Terminate (task complete) |
| Verify | surviving finding (after analysis) | Explore |

Inner loop (Explore → Spec → Challenge) inspects the plan before acting; may run
multiple rounds. A surviving minor finding routes to Spec, a surviving major one
to Explore. Outer loop (Execute → Verify → Explore) inspects results after
acting; a surviving finding at Verify triggers a new full cycle.

Each loop narrows the problem.

---

## Phase 1: Explore

**Goal**: Understand the problem and traverse the solution space before committing
to a direction. Do not produce a spec yet — produce a map.

**Output**: problem understanding, directions considered, directions eliminated
and the reasons for elimination.

**Trivial tasks**: if the task is a single command with a clear verification,
output "Trivial task: [description]. No exploration needed." Skip to Spec.

**MUST**:
- Read relevant context (code, docs, specs, history)
- Understand current state and desired outcome
- Consider at least the first direction that comes to mind AND one alternative
- State task boundaries: what you will do, what you will NOT do

**MUST NOT**:
- Jump to a solution without considering alternatives
- Guess or assume when information is available via tools or codebase
- Skip Explore and jump to Spec

---

## Phase 2: Spec

**Goal**: Lock in a direction, anticipate risks, and define measurable acceptance
criteria. The spec becomes the binding contract for Execute and Verify.

**The spec form depends on the task**:

| Task type | Spec contains |
|---|---|
| New feature | Plan (steps + acceptance criteria per step) |
| Bug fix | Root cause hypothesis + fix approach + verification |
| Code review | Scope + checkpoints + related docs |
| Debug | Execution path analysis + hypotheses |
| Architecture | Decision criteria + trade-offs + migration path |
| Write docs | Outline + key arguments |
| Trivial instruction | One line: "Execute: X. Verify: Y." |

The test: **could another engineer read this spec and execute the task without
ambiguity?**

**MUST**:
- Lock in a specific direction based on the Explore output
- Anticipate risks: what could go wrong? what would early detection look like?
- Define acceptance criteria that are measurable — not "tests pass" but
  "`pnpm test` exit code 0, all 373 pass"
- State reasoning: why this direction over alternatives considered in Explore
- Write down **what this round does not do**: what this change deliberately
  leaves out, which alternatives were considered and rejected, which details are
  deliberately left unwritten. Write "none" if there is nothing on it. Both
  Challenge and Verify hand this list to every finder — without it, a finder
  reports the things you deliberately left out as defects

**MUST NOT**:
- Produce vague specs ("fix the bug", "refactor the module")
- Skip measurable criteria

---

## Phase 3: Challenge

**Goal**: Adversarial review of the spec before execution. This is a quality
gate, not a formality. You do not execute until the spec survives this phase.

**Run this phase as a judge-only round of the `adversarial-review-loop` skill.**
The object is the Spec body; the standard is the task request plus the full
Explore output; the items below are what the hunt looks for. Take its steps 1–4 —
get the material ready, hunt for problems, dedupe, adjudicate every finding in a
context that did not write the spec — and **stop there**. Steps 5–6
are this skill's inner loop instead: nothing is fixed in Challenge, the routing
below sends each finding to Spec or Explore, and this phase runs again on what
comes back. Convergence is measured across those rounds, not inside one.

**The challenge must be concrete and adversarial.** One task carries every one
of these, and the answers must be concrete:

1. **Edge cases**: list at least 2. What happens with empty input? Concurrent
   calls? Already existing state? Partial failure? Scale (N=0, N=1, N=large)?
2. **Wrong assumptions**: state at least 1 assumption in the spec. What breaks
   if it is wrong? How would you detect the error early?
3. **Overengineering**: point out at least 1 place the spec could be simpler.
   Is the simplest thing that could possibly work?
4. **Risk**: is this a destructive change? What is the blast radius? Is there a
   rollback path?
5. **Traversal thoroughness**: was the solution space thoroughly explored
   during Explore? Are the eliminations defensible? Was any direction missed?
6. **What should have moved with it**: walk the spec itself, not just the five
   questions above. What does this change touch that the spec never mentions?
   Does every reference it makes still resolve? Does every claim it makes come
   with evidence?

**Give every finder what this round does not do** (see
`references/spec-template.md`). Without it, a finder reports the things the spec
deliberately left out, and that buries the real findings.

**Severity vocabulary**: the finders' table carries a severity column, and here
it takes exactly two values — **minor** (wording, detail, measurability) or
**major** (wrong direction, incomplete traversal, flawed assumption) — because
the routing below keys on it.

**Trivial tasks**: the Challenge can be one line: "No edge cases. No assumptions
beyond tool availability. No overengineering."

**Executor**: dispatch the hunt to a subagent that can judge and is read-only
(pick the type from your own tool list). The read-only constraint, what its task
must carry, and the shape of what it must return are all specified in the review
loop's §5 and §7.

**Then route what survived adjudication**, by severity:

- minor → Spec
- major → Explore
- mixed → major dominates

**Do NOT fix a problem in Challenge** — return to Spec or Explore instead.
Challenge is a gate, not a repair shop. Do not re-score the adjudicator's
verdicts either: in this process the verdict belongs to the context that did not
find the problem.

**Inner loop may run multiple rounds.** This is normal. Each round sharpens
the spec.

**MUST NOT**:
- Pass with "looks fine" without listing what you checked
- Notice a problem but stay silent to "get to execution faster"
- Fix a problem yourself in Challenge rather than returning to Spec or Explore
- Drop a finding because it fits neither the minor nor the major list — route it
  by severity and let Spec or Explore decide what to do with it

---

## Phase 4: Execute

**Goal**: Follow the spec precisely.

**Every action must be traceable to a specific entry in the spec.**

**MUST**:
- Before starting, initialize your harness's progress list with the spec's steps (see Progress
  visibility)
- Complete one step, confirm it locally, move to the next
- If you hit something the spec does not cover → PAUSE → return to Explore
  (not Spec or Challenge — this is a new problem to plan for)

**MUST NOT**:
- Deviate from the spec (unless Explore+Spec+Challenge approved a scope change)
- Skip steps or merge steps
- "While you're at it" — do anything outside the spec's stated boundaries
- Keep going when results don't match expectations (that's Verify, not Execute)

---

## Phase 5: Verify

**Goal**: Confirm every acceptance criterion is met — and that the change
carried what it should have and disturbed nothing else.

**Run this phase as a judge-only round of the `adversarial-review-loop` skill.**
The object is what you produced together with the change that produced it; the
standard is the acceptance criteria in the spec. Take its steps 1–4 — get the
material ready, hunt for problems, dedupe, adjudicate every finding in a context
that did not produce the work — and **stop there**. Steps 5–6 are this skill's outer
loop: nothing is fixed in Verify, the routing below sends each finding to
Explore, and this phase runs again on what comes back.

**The hunt has two halves, and one task covers both.** First, every acceptance
criterion gets its own PASS/FAIL with its own evidence — never "same as above",
and never a summary standing in for the individual results.

**Then walk the change itself, not just the criteria.** The criteria can only ask
about what the spec already thought of; ask the question they cannot: *this
change — what should have moved with it and didn't, and what moved that
shouldn't have?* Go after what the criteria cannot reach, and check every claim
of the form "this has no impact" against evidence. The change itself is that
half's primary material. The criteria set what you may judge PASS or FAIL on, not
what you may notice.

**Give the task what this round does not do** (see
`references/spec-template.md`), so nobody reports what the spec deliberately left
out.

- **Nothing survived adjudication** → task complete
- **Anything survived** → return to Explore with the finding list as input for a
  new cycle. The items are already classified, and anything "partially valid" or
  "subsumed" has already been rewritten — route the rewrites, not the originals.

**Executor**: dispatch the hunt to a subagent that can judge and is read-only
(pick the type from your own tool list). The read-only constraint, what its task
must carry, and the shape of what it must return are all specified in the review
loop's §5 and §7.

**MUST NOT**:
- Claim PASS when a problem exists
- Lower the standard to declare PASS
- Report the criteria result alone and skip the walk
- Fix the problem directly in Verify without going through Explore first
- Re-score the adjudicator's verdicts — in this process the verdict belongs to
  the context that did not produce the work

---

## Stop conditions

Stop and report to the user when:

| Phase | Condition |
|---|---|
| Explore | Critical information is missing and cannot be obtained from tools or codebase |
| Explore | A trade-off decision is needed that principle docs do not cover |
| Explore | All directions have been explored and eliminated as dead ends |
| Execute | A blocker exceeds current capability or permission scope |

**Report format**:
1. Current phase
2. What the blocker is
3. What you tried (paths already ruled out)
4. What decision or information you need from the user

---

## Recursive decomposition

If a step in the spec is itself complex (multi-level decisions, significant
uncertainty, or large blast radius), start a **new nested iteration** for that
step alone: Explore → Spec → Challenge → Execute → Verify within the outer
Execute phase.

This is not scope creep — it is the mechanism that keeps the outer spec
concrete while handling the inner complexity rigorously.

---

## Operational conventions

These are defaults. Override when the task calls for it.

### File location and naming

- **Non-trivial tasks** (spec longer than one line): write to `.task_spec/<slug>.md`
  - slug derives from the spec's "What" summary — lowercase, hyphenated. E.g.
    `add-tag-stats`
  - create the directory if it does not exist
- **Trivial instruction tasks** (spec is one line, e.g. `pnpm test`): skip the file
- **Recursively decomposed sub-tasks**: use `--` to connect parent and child slugs.
  E.g. `.task_spec/add-tag-stats--perf-optimize.md`

### The object of a round

Before a Challenge or Verify round starts, the spec file **is** that round's object.
It already satisfies what the review loop's §5 requires — subagents can read it
because it lives inside the working tree, it can be compared before and after, and
it can be rolled back — so there is no separate copy to make.

One rule follows: **the list of what this round does not do is part of that
object.** It states the standard the round judges against, and changing the
standard mid-round invalidates the verdicts already given (the review loop's §1).

### File structure: append cycles, never split

One file per task-slug. Append each cycle to the same file — do not create new
files for new cycles.

Four phases get recorded in the file. **Execute is NOT written to the file** —
track progress with your harness's progress list instead.

File structure template: see `references/spec-template.md`.
**Constraints**:
- Explore output must list directions considered and eliminated — "no alternatives
  to the first idea" is forbidden (trivial tasks excepted)
- Spec "How" must be executable — another engineer following it encounters zero
  ambiguity
- Spec "Verify" criteria must be measurable — not "tests pass" but
  "`pnpm test` exit code 0, all 373 pass"
- Challenge answers must be concrete — "no edge cases," "no assumptions," and
  "no missed directions" are forbidden without specifics (trivial tasks excepted)
- Verify must attach evidence per criterion — "looks correct" is forbidden
- After multiple cycles, only the last cycle's spec body is the authoritative
  contract; earlier cycles are the audit trail

### Progress visibility

- When entering the Execute phase, if the spec has **3 or more distinct steps**,
  use your harness's progress list to track progress. Map each step to a todo item; check off as
  you complete each one.
- Specs with 1–2 steps do not need a todo list
- **MUST NOT** create a todo list during Explore, Spec, or Challenge — the steps
  are not final until Challenge passes

### Delegating a recursive sub-step

Use a `task` subagent for a recursively decomposed sub-step when **all** of
these hold:
1. Self-contained with clear input/output boundaries
2. Touches multiple files or subsystems
3. Can run in parallel with other sub-steps

Otherwise, run the sub-iteration inline. Sub-task specs go in their own file
(see file location and naming); the subagent runs its own
Explore → Spec → Challenge → Execute → Verify cycle.

