# task-spec: why it is built this way

[中文版](./task-spec.zh.md) | English

> This one is for **humans**. [`SKILL.md`](../../skills/engineering/task-spec/SKILL.md) is the
> instruction set for the AI. Read this if you want to know why there are these five phases;
> if you want to use the skill, go straight to SKILL.md.

## Starting point: the model has four holes

An LLM generates text one token at a time, each time picking the statistically most likely
next word. That mechanism produces four holes:

1. **The default is the first idea.** The highest-probability continuation is the first
   "thought," and the model runs with it. It does not naturally consider other possibilities,
   and it does not ask "is this even the right problem?"
2. **There is no quality gradient.** It moves toward "most likely," not toward "better." It
   cannot tell which direction goes deeper.
3. **It cannot tell "looks right" from "is right."** A plausible wrong answer and a correct
   answer have the same statistical shape.
4. **It does not check its own work.** "Done" equals "done well." Without an outside force
   pushing it, it will not catch contradictions or missed items.

The first two happen **before acting**; the last two happen **after acting**. The two kinds of
problem differ in nature, and they need different fixes.

## Two kinds of problem need two strategies

**Verification** is the easy half. "Does the output match the spec?" is an objective question,
so it can be enforced from outside: a contract, a checklist, a set of evidence is enough. What
it is not is exhaustive. A checklist only asks about what the spec already thought of, and the
one thing that shows what the spec left out is the change itself. So Verify walks the change as
well as the criteria.

**Thinking** is the hard half. "Is the direction right?" "Is it good enough?" These need
something the model does not have: an internal compass pointing at "better." The model points
at "most likely" and can never point at "better." It does not end shallow because it is lazy;
it ends shallow because it cannot tell which direction goes deeper.

The human counterpart is **attitude**. A person who genuinely wants to do the work well
naturally explores alternatives, questions assumptions, and anticipates risks. The model has
no equivalent. It cannot "want" anything.

So: **verification can be enforced by contract; thinking can only be pushed by structure.**

## Where each of the five phases comes from

| Phase | Which hole it fills | What happens without it |
|---|---|---|
| **Explore** | holes 1, 2 | It grabs the first idea and runs, never having considered another path |
| **Spec** | — | There is no baseline to check against, so "done well" cannot be judged |
| **Challenge** | holes 1, 2 | The first plan goes straight into Execute, and its defects only surface in the output |
| **Execute** | — | There is no notion of "leaving the track," so drift while working cannot be noticed |
| **Verify** | holes 3, 4 | "It runs" counts as complete, and the parts that actually fall short are left in place |

## Why two loops instead of a straight line

A single pass cannot correct itself. Pairing the phases into loops lets problems be caught
**when they cost the least**:

- **Inner loop** (Explore → Spec → Challenge) sharpens the plan before acting. A minor defect
  goes back to Spec; a major defect goes back to Explore. Rewriting a piece of text costs far
  less than rewriting something already baked into the output.
- **Outer loop** (Execute → Verify → Explore) validates the result after acting. A failed
  verification is not "apply a patch" — it is going back to Explore and restarting a cycle,
  because a failed verification usually means the original understanding was insufficient,
  not that the last step went crooked.

Where a finding goes from each state is this skill's own decision: it returns to the phase that
can deal with it. How one gate round works inside — how the plan or the result is frozen, how
problems are hunted, and who judges — is not decided here. That comes from the
`adversarial-review-loop` skill, and a later section explains why the two fit together.

Each loop narrows the problem, and at the same time accumulates an auditable record.

## Why the spec must be a binding contract, not a reference plan

This is the most easily misunderstood point in the whole design.

If the spec were only a reference plan, then:

- the Execute phase could "while you're at it" do things the plan does not contain — and the
  scope would quietly expand;
- the Verify phase could pass something on "it feels about right" — and hole 3 would come back
  exactly as before;
- "not in the spec" would lose its meaning, and scope would no longer be a place where you can
  draw a line.

So task-spec states it outright: **the spec is a binding contract that may not be deviated
from.** Execute may only do what the spec says; Verify may only judge PASS/FAIL against the
acceptance criteria the spec states. Anything not in the spec = outside this task's scope.

This bounds what Verify may **decide**, not what it may **notice**. A problem it spots outside the
acceptance criteria is still reported — it just goes back to Explore, where the scope is settled
again, instead of being judged on the spot.

This is not formalism. It is what makes it mechanically possible to pull something back from
a careless execution.

## Challenge and Verify each run as a judge-only round of the review loop

Reviewing your own work most likely ends with letting it pass — that is what hole 3 is about. So
both gates are handed to the `adversarial-review-loop` skill: Challenge judges the plan, Verify
judges the result. That skill has two modes. A **full round** runs its steps 1–6 — freeze the
object, hunt for problems, dedupe, adjudicate every finding independently, fix what survived,
review the fixes. A **judge-only round** runs steps 1–4 and stops: nothing is
fixed and nothing is re-reviewed inside the round, and what comes back is the finding list.
task-spec uses the second mode.

The loop supplies the method of one round: a frozen object every finder can read, a hunt
that may go past the checklist and ask "what should have moved with this change, and
didn't?", and an adjudicator who did not write the finding and can therefore reject it
honestly. All of it follows from one discipline: *the
context that finds a problem must never be the context that decides whether it is real.* That is
hole 3, stated more strictly than the older rule "hand the review to a subagent". A fresh context
no longer carries the prior "this is what I came up with", which already helps; this rule also
forbids the finder to grade its own finding.

task-spec keeps the half the loop deliberately leaves alone. Nothing is fixed inside Challenge or
Verify; each phase routes what survived adjudication instead. A minor finding in Challenge goes
back to Spec, a major one goes back to Explore, and anything that survives Verify sends the task
back to Explore to start a new cycle. That routing is not a step of the review loop; it is the
shape of task-spec's own two loops, and SKILL.md writes it out as a state table.

The two fit together because a round has two halves, and the halves belong to different
processes. If Challenge ran a full round, the loop would fix the plan itself, and task-spec would
then route the very same finding back to Spec or Explore. The fix and the re-review would each
happen twice, two contexts would both be editing the plan, and nothing would say which edit
counts. A judge-only round removes that duplication: the gate decides what is real, and the phase
that owns the plan decides what to do about it. The next round then judges the new state, so
convergence is measured across the rounds of task-spec's inner loop rather than inside one round
of the review loop.

Two features of this mode decide what the routing actually receives. A finding is judged in four
ways — valid, partially valid, invalid, or subsumed, meaning it is a symptom of a larger problem
— and the finding list keeps only what survived: a valid finding as written, a partially valid
or subsumed one as its rewrite, and an invalid one does not appear in the list at all. The
adjudicator still produces counter-evidence for an "invalid" verdict, because that evidence is
what earns the verdict, but nothing is acted on for such a finding, so no counter-evidence enters
the list. And "partially valid" no longer hands back a **boundary** saying which part of the
finding was overstated; it hands back a **re-description**, the finding rewritten so that
everything left in it holds, and that rewrite is the finding from then on. A boundary tells the
reader what was wrong with the finding, and the phase that receives it still has to work out the
corrected version; the rewrite hands over the version that can be acted on. So Verify routes
rewrites and never originals, and a finding already judged invalid never comes back to the
routing. A "subsumed" finding is reported as its root for the same reason: sending the symptom
alone to Spec or Explore would get the symptom patched.

## Two things task-spec had to add for this to work

Both additions answer the same problem: a judge-only round is a gate, and a gate that is told only
what to check will report everything it notices.

**The intentional-omissions list.** The Spec phase writes down what this change deliberately does
not do, which alternatives were considered and rejected, and which details are deliberately left
unwritten — "none" if there is nothing on it. The list is part of the standard rather than a note
about the standard, and Challenge and Verify hand it to every finder. Without it a finder cannot
tell a deliberate omission from a defect, so it reports each deliberate omission as a defect;
those items are numerous, and each one looks like an obvious gap, so they bury the findings that
matter. The list must also stay unchanged for the duration of a round: if it changes halfway, the
verdicts already given lose the standard they were judged against.

**The frozen copy.** Before a Challenge or Verify round starts, the spec file is that round's
frozen copy. It already satisfies what the loop requires of a frozen object: the finders can read
it because it sits inside the working tree, it can be compared before and after, and it can be
rolled back. Two rules follow. Record a digest of the file before the round and check it again
before the next round — if the file moved and task-spec's own routing did not move it, the round
was judged against an object that changed underneath it, so freeze again and run the round again.
And a spec that changed because the previous round rewrote it is normal: freeze the new state and
record its new digest.

## Limitations (honest version)

- **This is only compensation; it does not make the model better.** It cannot stop the model
  from defaulting to the first idea, it only makes the model **unable to bypass** the steps it
  should have taken on its own.
- **It is not a cure-all.** It cannot replace the model's real judgement. However detailed the
  spec is, it cannot rescue a wrong understanding of the domain.
- **The process itself does not produce quality.** Run all five phases while shortchanging
  every one of them, and the result is still bad. This applies just the same to a human doing
  the review.
- **The expensive half of the loop is paid twice.** Challenge and Verify each go through freeze,
  hunt, and independent adjudication. What a judge-only round saves is the
  fix-and-re-review half, which task-spec would have had to run again through its own routing
  anyway.
- **The overhead is real.** Small tasks skip phases (every phase has a "trivial task"
  exemption), but non-trivial tasks cannot skip them.
