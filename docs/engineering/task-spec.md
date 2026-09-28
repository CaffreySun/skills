# task-spec: why it is built this way

[中文版](./task-spec.zh.md) | English

> This one is for **humans**. [`SKILL.md`](../../skills/engineering/task-spec/SKILL.md) is the
> instruction set for the AI. Read this if you want to know why there are these five phases;
> if you want to use the skill, go straight to SKILL.md.

## Starting point: the model has two holes

An LLM generates text one token at a time, each time picking the statistically most likely
next word. That mechanism produces four consequences:

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
so it can be enforced from outside: a contract, a checklist, a set of evidence is enough.

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

This is not formalism. It is what makes it mechanically possible to pull something back from
a careless execution.

## Why every phase must yield a turn

Every phase ends with:

```
To yield, run: bash -c 'sleep 0.1'
```

It looks odd, but it solves a concrete problem: when the model generates one response
continuously, the earlier phases' wording is **already in the context**, and that anchors what
the later phases decide. The Challenge phase is the most easily affected — what
it reads is the spec it has just written itself, and it naturally tends to wave that spec
through.

The `sleep` command creates a real turn boundary. The next phase's token generation happens
under a new context state, instead of sliding on from the previous passage's output. The
mechanism is crude; the effect is real.

## Why Challenge is delegated to a subagent

Reviewing your own work most likely ends with letting it pass — that is what hole 3 is about.

Give it to a subagent in a separate context, because it does not carry the prior of "this is
what I came up with." The same model, moved into a context with no vested interest, attacks
noticeably differently.

## Limitations (honest version)

- **This is only compensation; it does not make the model better.** It cannot stop the model
  from defaulting to the first idea, it only makes the model **unable to bypass** the steps it
  should have taken on its own.
- **It is not a cure-all.** It cannot replace the model's real judgement. However detailed the
  spec is, it cannot rescue a wrong understanding of the domain.
- **The process itself does not produce quality.** Run all five phases while shortchanging
  every one of them, and the result is still bad. This applies just the same to a human doing
  the review.
- **The overhead is real.** Small tasks skip phases (every phase has a "trivial task"
  exemption), but non-trivial tasks cannot skip them.
