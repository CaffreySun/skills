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


## Why this skill exists

You — the LLM reading this — have a fundamental limitation. You generate tokens
based on statistical likelihood, not logical necessity. This has consequences:

1. **Your default is the first idea.** The highest-probability continuation is
   the first "thought," and you run with it. You don't naturally explore
   alternatives or question whether the problem is even the right problem.
2. **You have no quality gradient.** You orient toward "most likely," not
   "better." You can't tell which direction leads to deeper work.
3. **You can't distinguish "looks right" from "is right."** A plausible wrong
   answer and a correct answer have the same statistical shape.
4. **You don't check your work.** "Done" equals "done well." You won't catch
   contradictions or missed criteria without being forced to.

This skill is the external scaffolding that compensates. It doesn't make you
better — it makes you **unable to bypass** the thinking and verification you
would otherwise skip. Every phase, every yield, every adversarial question
exists because of these four facts.

Read them again before you start any task.
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
| Challenge | spec passes quality gate | Execute |
| Challenge | FAIL — minor defect (wording, detail, measurability) | Spec |
| Challenge | FAIL — major defect (wrong direction, incomplete traversal, flawed assumption) | Explore |
| Execute | all steps complete | Verify |
| Execute | hit something spec doesn't cover | Explore |
| Execute | blocker exceeds capability/permission | Terminate (report to user) |
| Verify | all acceptance criteria pass | Terminate (task complete) |
| Verify | any criterion fails (after analysis) | Explore |

Inner loop (Explore → Spec → Challenge) inspects the plan before acting; may run
multiple rounds. A Challenge failure routes to Spec (minor) or Explore (major).
Outer loop (Execute → Verify → Explore) inspects results after acting; a Verify
failure triggers a new full cycle.

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
**To yield**, run: `bash -c 'sleep 0.1'`
This creates a turn boundary — do not continue to Spec in the same response.

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

**MUST NOT**:
- Produce vague specs ("fix the bug", "refactor the module")
- Skip measurable criteria
**To yield**, run: `bash -c 'sleep 0.1'`
This creates a turn boundary — do not continue to Challenge in the same response.

---

## Phase 3: Challenge

**Goal**: Adversarial review of the spec before execution. This is a quality
gate, not a formality. You do not execute until the spec survives this phase.

**The challenge must be concrete and adversarial.** Answer all five:

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

**Trivial tasks**: the Challenge can be one line: "No edge cases. No assumptions
beyond tool availability. No overengineering."

**Subagent delegation**: for non-trivial tasks, SHOULD delegate Challenge to a
subagent (task type `reviewer`). The subagent assignment MUST include: problem
description, full Explore output, full Spec body, and the five adversarial
questions above. The subagent answers the five questions. The parent then handles
defect classification and routing.

**When defects are found (FAIL)**, apply analysis-first discipline:

1. **Classify each defect**:
   - **Valid**: correct and actionable as stated
   - **Partially valid**: real issue but wrong diagnosis or scope — treat the
     valid core by its severity (minor/major)
   - **Invalid**: doesn't apply — discard
   - **Subsumed**: symptom of a larger problem — fix the root, not the symptom
2. **Route**: minor defects (wording, detail, measurability) → Spec.
   Major defects (wrong direction, incomplete traversal, flawed assumption) →
   Explore. Mixed defects → major dominates.
3. **Do NOT fix defects in Challenge** — return to Spec or Explore instead.
   Challenge is a gate, not a repair shop.

**Inner loop may run multiple rounds.** This is normal. Each round sharpens
the spec.

**MUST NOT**:
- Pass with "looks fine" without listing what you checked
- Notice a problem but stay silent to "get to execution faster"
- Fix a problem yourself in Challenge rather than returning to Spec or Explore
**To yield**, run: `bash -c 'sleep 0.1'`
This creates a turn boundary — do not continue to Execute in the same response.

---

## Phase 4: Execute

**Goal**: Follow the spec precisely.

**Every action must be traceable to a specific entry in the spec.**

**MUST**:
- Before starting, initialize `todo_write` with the spec's steps (see Progress
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

**Goal**: Confirm every acceptance criterion from the spec is met.

**Check each criterion from the spec against what you actually produced.**
Give each a PASS/FAIL with evidence.

- **All PASS** → task complete
- **One or more FAIL** → analysis-first discipline:
  1. **Classify each failure**: valid / partially valid / invalid / subsumed
  2. Only after analysis, return to Explore with the confirmed deviations
     as input for a new cycle

**Subagent delegation**: for non-trivial tasks, SHOULD delegate Verify to a
subagent (task type `reviewer`). The subagent assignment MUST include: the
spec body (with acceptance criteria) and the actual output to verify. The
subagent checks each criterion and returns PASS/FAIL with evidence. The
parent handles failure analysis and routing.

**MUST NOT**:
- Claim PASS when a problem exists
- Lower the standard to declare PASS
- Fix the problem directly in Verify without going through Explore first

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

### File structure: append cycles, never split

One file per task-slug. Append each cycle to the same file — do not create new
files for new cycles.

Four phases get recorded in the file. **Execute is NOT written to the file** —
track progress with `todo_write` instead.

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
  use `todo_write` to track progress. Map each step to a todo item; check off as
  you complete each one.
- Specs with 1–2 steps do not need a todo list
- **MUST NOT** create a todo list during Explore, Spec, or Challenge — the steps
  are not final until Challenge passes

### Subagent delegation

Use a `task` subagent for a recursively decomposed sub-step when **all** of
these hold:
1. Self-contained with clear input/output boundaries
2. Touches multiple files or subsystems
3. Can run in parallel with other sub-steps

Otherwise, run the sub-iteration inline. Sub-task specs go in their own file
(see file location and naming); the subagent runs its own
Explore → Spec → Challenge → Execute → Verify cycle.

