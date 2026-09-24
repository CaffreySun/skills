# task-spec

Prevents AI from executing before thinking — by running every task through an adversarial quality-control loop.

## The problem

LLMs have two problems. One before they act, one after.

A modern AI is like a brilliant person who never double-checks anything. It gives you answers that look right — confident, well-structured, plausible — but it never stops to ask whether they actually are.

The reason runs deeper than laziness. An LLM generates text one word at a time, always picking the statistically most likely next word. Its first instinct is always the most probable path — not the most careful one. A correct answer and a wrong-but-plausible one look the same in the numbers. From the inside, the model cannot tell them apart.

This shows up in two ways:

**Before acting — shallow thinking.** The model grabs the first direction that comes to mind and runs. No alternatives. No "is this even the right problem?" It treats having an answer and having the *right* answer as the same thing.

**After acting — no verification.** The model does not check its work. "Done" equals "done well." It will not catch contradictions, will not compare results against intent, will not ask what was missed.

Better training data does not fix either problem. It teaches the model what correct output *looks like* — not the thinking that produced it. The doubt, the abandoned first attempts, the self-checking that humans do before writing — all invisible in the final result. The model sees only the output, never the process.

## Can it be fixed?

This is architectural. The way models generate text — one statistically-likely word after another — never asks "is this right?" No training data change or prompt engineering installs that question.

At the **model level**: researchers are exploring architectures that can pause, evaluate, and revise mid-generation. But this is a frontier — not something reliable today.

At the **Harness level**: the two problems differ in kind.

Verification is the easier one. "Does the output match the spec?" is an objective question. You can enforce it from the outside — a contract, a checklist, evidence.

Thinking is harder. "Is this the right approach?" "Is this good enough?" These need something the model does not have: an internal compass that points toward "better." The model steers toward "most likely," never "better." It does not settle for shallow because it is lazy — it settles for shallow because it cannot tell which direction goes deeper.

The human equivalent is attitude. A person who genuinely wants to do good work naturally explores alternatives, questions assumptions, anticipates problems. The model has no equivalent drive. It cannot *want* anything.

This is why the two problems need different strategies. Verification can be enforced by contract. Thinking can only be pushed by structure — guiding the model through the steps a high-attitude person takes naturally.

## The answer

task-spec tackles both problems with five phases:

**Explore → Spec → Challenge → Execute → Verify**

**Explore** — map the solution space. Understand the problem, consider directions, eliminate dead ends. Do not commit yet.

**Spec** — lock in a direction. Define measurable acceptance criteria, anticipate risks, state your reasoning. The spec becomes a binding contract: Execute follows it, Verify judges by it.

**Challenge** — adversarial review. Five questions: edge cases, wrong assumptions, overengineering, risk, and whether the solution space was thoroughly explored. Non-trivial tasks delegate this to a subagent. No spec reaches execution without surviving this gate.

**Execute** — follow the spec exactly. Every action must trace back to it. Hit something uncovered? Pause, return to Explore.

**Verify** — check each criterion against actual output with evidence. All pass? Done. Any fail? Analyze the failure first, then return to Explore for a new cycle.

These five phases form two loops. The **inner loop** (Explore → Spec → Challenge) sharpens the plan before acting — minor flaws go back to Spec, major ones to Explore. The **outer loop** (Execute → Verify → Explore) validates results after acting — a Verify failure restarts the cycle.

Every spec is written to `.task_spec/<slug>.md`, leaving an audit trail.

## Install

Install this skill on its own:

```bash
npx skills add CaffreySun/skills --skill task-spec
```

Or take the whole collection:

```bash
npx skills add CaffreySun/skills
```

For Claude Code, the plugin route installs every skill in this collection and
keeps it updated:

```bash
/plugin marketplace add CaffreySun/skills
/plugin install caffreysun-skills
```

## License

MIT
