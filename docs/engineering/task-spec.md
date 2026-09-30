# task-spec: why it is built this way

[中文版](./task-spec.zh.md) | English

> This one is for **humans**. [`SKILL.md`](../../skills/engineering/task-spec/SKILL.md) is the
> instruction set for the AI. Read this if you want to know why there are these five phases;
> if you want to use the skill, go straight to SKILL.md.

## Starting point: the model has four flaws

An LLM generates text one token at a time, each time picking the statistically most likely
next word. That mechanism produces four flaws:

1. **The default is the first idea.** The highest-probability continuation is the first
   "thought," and the model runs with it. It does not naturally consider other possibilities,
   and it does not ask "is this even the right problem?"
2. **It does not judge quality.** It goes by which is "most likely," not which is "better." It
   cannot tell which direction goes deeper.
3. **It cannot tell "looks right" from "is right."** A plausible wrong answer and a correct
   answer are the same thing to it statistically.
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
something the model does not have: a way to judge which option is "better." The model can only
go by which is "most likely." It does not end shallow because it is lazy;
it ends shallow because it cannot tell which direction goes deeper.

The human counterpart is **attitude**. A person who genuinely wants to do the work well
naturally explores alternatives, questions assumptions, and anticipates risks. The model has
no equivalent. It cannot "want" anything.

So: **verification can be enforced by contract; thinking can only be pushed by building the
steps into a process.**

## Where each of the five phases comes from

| Phase | Which flaw it fixes | What happens without it |
|---|---|---|
| **Explore** | flaws 1, 2 | It grabs the first idea and runs, never having considered another path |
| **Spec** | — | There is no baseline to check against, so "done well" cannot be judged |
| **Challenge** | flaws 1, 2 | The first plan goes straight into Execute, and its defects only surface in the output |
| **Execute** | — | There is no notion of "going off plan," so the work can wander without anyone noticing |
| **Verify** | flaws 3, 4 | "It runs" counts as complete, and the parts that actually fall short are left in place |

## Why Explore has no "at least two options" rule

A rule saying "list at least two approaches, then pick one" is meant to fix flaw 1. It
cannot, for two reasons.

**A quota can be paid off.** Ask for "at least two" and the model produces two: one correct
and one obviously worse, followed by "more complex, therefore rejected." That record
satisfies every letter of the rule and carries no information — the rejected option had no
advantage over the chosen one and could never have been picked. Such a record is worse than
none: it makes a shallow exploration look like a thorough one, and nothing downstream can
tell the two apart.

**Many tasks have only one direction.** A one-line copy change, one more field, one command
to run: the requirement itself dictates the approach. Listing a second one manufactures a
choice that never existed. That does not fix flaw 1; it only hides it.

So what gets measured is not the **number of options** but whether the direction was
**chosen rather than defaulted**. Two records count:

- **A real trade-off**: two or more directions a reasonable engineer could have picked, each
  rejected one naming what it did better than the chosen one, plus the criterion that
  decided.
- **A one-directional space**: the constraint that rules everything else out, plus what
  would have to change for a second direction to appear.

One test settles both: **if you cannot say what an alternative does better than the chosen
direction, it is not an alternative.** Delete it and write the one-directional argument. An
invented option cannot name an advantage, so it gets deleted; a task that genuinely has one
direction only has to state the constraint instead of padding.

Challenge holds to the same test. A pile of alternatives where none names an advantage is
reported as "the exploration did not happen," not as "were there enough options?"

## Why two loops instead of a straight line

A single pass cannot correct itself. Pairing the phases into loops lets problems be caught
**when they cost the least**:

- **Inner loop** (Explore → Spec → Challenge) sharpens the plan before acting. A minor defect
  goes back to Spec; a major defect goes back to Explore. Rewriting a piece of text costs far
  less than rewriting something already written into the output.
- **Outer loop** (Execute → Verify → Explore) validates the result after acting. A failed
  verification is not "apply a patch" — it is going back to Explore and restarting a cycle,
  because a failed verification usually means the original understanding was insufficient,
  not that the last step went wrong.

Where a finding goes from each state is this skill's own decision: it returns to the phase that
can deal with it. How one gate round works inside — how the material is prepared, how
problems are hunted, and who judges — is not decided here. That comes from the
`adversarial-review-loop` skill, and a later section explains why the two fit together.

Each loop reduces what is left undecided, and at the same time accumulates an auditable record.

## Why the spec must be a binding contract, not a reference plan

This is the most easily misunderstood point in the whole design.

If the spec were only a reference plan, then:

- the Execute phase could "while you're at it" do things the plan does not contain — and the
  scope would quietly expand;
- the Verify phase could pass something on "it feels about right" — and flaw 3 would come back
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

Reviewing your own work most likely ends with letting it pass — that is what flaw 3 is about. So
both gates are handed to the `adversarial-review-loop` skill: Challenge judges the plan, Verify
judges the result. That skill has two modes. A **full round** runs its steps 1–6 — get the
material ready, hunt for problems, dedupe, adjudicate every finding independently, fix what
survived, review the fixes. A **judge-only round** runs steps 1–4 and stops: nothing is
fixed and nothing is re-reviewed inside the round, and what comes back is the finding list.
task-spec uses the second mode.

The loop supplies the method of one round: one body of material every finder can read, a hunt
that may go past the checklist and ask "what should have moved with this change, and
didn't?", and an adjudicator who did not write the finding and can therefore reject it
honestly. All of it follows from one discipline: *the
context that finds a problem must never be the context that decides whether it is real.* That is
flaw 3, stated more strictly than the older rule "hand the review to a subagent". A fresh context
no longer carries the prior "this is what I came up with", which already helps; this rule also
forbids the finder to grade its own finding.

task-spec keeps the half the loop deliberately leaves alone. Nothing is fixed inside Challenge or
Verify; each phase routes what survived adjudication instead. A minor finding in Challenge goes
back to Spec, a major one goes back to Explore, and anything that survives Verify sends the task
back to Explore to start a new cycle. That routing is not a step of the review loop; it is the
structure of task-spec's own two loops, and SKILL.md writes it out as a state table.

The two fit together because a round has two halves, and the halves belong to different
processes. If Challenge ran a full round, the loop would fix the plan itself, and task-spec would
then route the very same finding back to Spec or Explore. The fix and the re-review would each
happen twice, two contexts would both be editing the plan, and nothing would say which edit
counts. A judge-only round removes that duplication: the gate decides what is real, and the phase
that owns the plan decides what to do about it. The next round then judges the new state, so
convergence is measured across the rounds of task-spec's inner loop rather than inside one round
of the review loop.

Two features of this mode decide what the routing actually receives. A finding is judged in four
ways — valid, partially valid, invalid, or part of a larger problem
— and the finding list keeps only what survived: a valid finding as written, a partially valid
or "part of a larger problem" one as its rewrite, and an invalid one does not appear in the list at all. The
adjudicator still produces counter-evidence for an "invalid" verdict, because that evidence is
what earns the verdict, but nothing is acted on for such a finding, so no counter-evidence enters
the list. And "partially valid" no longer hands back a **boundary** saying which part of the
finding was overstated; it hands back a **re-description**, the finding rewritten so that
everything left in it holds, and that rewrite is the finding from then on. A boundary tells the
reader what was wrong with the finding, and the phase that receives it still has to work out the
corrected version; the rewrite hands over the version that can be acted on. So Verify routes
rewrites and never originals, and a finding already judged invalid never comes back to the
routing. A finding judged "part of a larger problem" is reported as the larger problem behind it for
the same reason:
sending the instance alone to Spec or Explore would get that one place patched and leave the
cause where it was.

## Two things task-spec had to add for this to work

Both additions answer the same problem: a judge-only round is a gate, and a gate that is told only
what to check will report everything it notices.

**What this round does not do.** The Spec phase writes down what this change deliberately does
not do, which alternatives were considered and rejected, and which details are deliberately left
unwritten — "none" if there is nothing on it. The list is part of the standard rather than a note
about the standard, and Challenge and Verify hand it to every finder. Without it a finder cannot
tell a deliberate omission from a defect, so it reports each deliberate omission as a defect;
those items are numerous, and each one looks like an obvious gap, so they hide the findings that
matter. The list must also stay unchanged for the duration of a round: if it changes halfway, the
verdicts already given lose the standard they were judged against.

**The object of a round.** Before a Challenge or Verify round starts, the spec file **is** that
round's object. It already satisfies what the loop requires of that material: the finders can
read it because it sits inside the working tree, it can be compared before and after, and it can
be rolled back — so there is no separate copy to make.

## Limitations (honest version)

- **This is only compensation; it does not make the model better.** It cannot stop the model
  from defaulting to the first idea, it only makes the model **unable to skip** the steps it
  should have taken on its own.
- **It does not cover everything.** It cannot replace the model's real judgement. However detailed the
  spec is, it cannot rescue a wrong understanding of the domain.
- **The process itself does not produce quality.** Run all five phases while giving each one
  less than it needs, and the result is still bad. This applies just the same to a human doing
  the review.
- **The expensive half of the loop runs twice.** Challenge and Verify each go through getting
  the material ready, hunt, and independent adjudication. What a judge-only round saves is the
  fix-and-re-review half, which task-spec would have had to run again through its own routing
  anyway.
- **The overhead is real.** Small tasks skip phases (every phase has a "trivial task"
  exemption), but non-trivial tasks cannot skip them.
