# skills

English | [中文版](./README.zh.md)

My agent skills. Two of them, and together they cover the one failure mode that
matters: **an agent that never checks its own work.**

They are the two halves of a single quality-control loop. One runs *before* the
agent acts; the other runs once there is something to check — which is usually
after acting, but includes anything whose correctness can't be self-evidenced.

| Skill | When it runs | What it forces |
|---|---|---|
| [`task-spec`](./skills/engineering/task-spec/SKILL.md) | before acting | Explore the solution space, write an inspectable spec, then have that spec attacked adversarially — before a single file is touched. |
| [`adversarial-review-loop`](./skills/engineering/adversarial-review-loop/SKILL.md) | any object whose correctness can't be self-evidenced | Partition discovery away from judgement and have every finding adjudicated by a context that did not produce it; a full round then fixes what survived and re-reviews the fixes until a round yields nothing, and a judge-only round stops at the finding list and hands it over. Works on a diff, a proposal, a migration plan, a contract — the concrete shape is decided at use time. |

## Why both

An LLM generates the statistically most likely next token. A correct answer and a
plausible wrong one have the same statistical shape, so the model cannot tell
them apart from the inside. This breaks in two places, and the two need different
fixes.

Verification is the easier half: "does this match what it's judged against?" is
an objective question, so it can be enforced from outside — a contract, a
checklist, evidence. Thinking is the harder half. "Is this the right approach?"
needs an internal compass pointing at *better*, and the model steers at *most
likely* instead. It doesn't settle for shallow because it is lazy; it settles for
shallow because it cannot tell which direction goes deeper. The human equivalent
is attitude, and you cannot prompt a model into wanting better work.

**Before acting — the first idea wins.** The highest-probability continuation is
the first "thought," and the model runs with it. No alternatives, no "is this
even the right problem?" So this half can only be pushed by structure: walk the
model through the steps someone who actually cares about the work takes
naturally. That is `task-spec`.

**Once there is something to check — "done" means "done well."** The model does
not catch its own contradictions or missed criteria. So this is the half that
gets enforceable from outside — and it applies to a proposal or a contract just
as much as to a finished diff. That is `adversarial-review-loop` — and its core
rule is that the thing finding problems and the thing judging whether they are
real must never be the same context.

## Installation

Two ways in, two philosophies. Pick one — installing both gives you every skill
twice.

### Claude Code plugin (managed, auto-updating)

```bash
/plugin marketplace add CaffreySun/skills
/plugin install caffreysun-skills
```

You get a read-only bundle that updates when I ship. Subscribe, don't fork.

### `skills` CLI (editable, yours)

```bash
# See what's available
npx skills add CaffreySun/skills --list

# Install everything
npx skills add CaffreySun/skills

# Or pick one
npx skills add CaffreySun/skills --skill task-spec
npx skills add CaffreySun/skills --skill adversarial-review-loop
```

This writes ordinary files into your repo that you own and can edit. Pull my
changes when you want them with `npx skills update`.

By default this takes the tip of the default branch. To pin a release, add
`#<ref>` — the CLI accepts a tag, a branch, or a commit SHA:

```bash
npx skills add CaffreySun/skills#v1.0.0 --skill task-spec
```

Works with any [agent that supports skills](https://github.com/vercel-labs/skills#supported-agents):
Claude Code, Codex, Cursor, OpenCode, and 70+ more.

## The skills

### task-spec

> The spec is not a template to fill in. It is the output of a quality-control
> process. If the process doesn't loop, quality didn't happen.

Five phases, two loops:

**Explore → Spec → Challenge → Execute → Verify**

The inner loop (Explore → Spec → Challenge) sharpens the plan before acting.
The outer loop (Execute → Verify → Explore) validates what came out after.

The spec is a **binding contract**: Execute follows it, Verify judges by it.
No spec reaches execution without surviving an adversarial challenge first.

Challenge and Verify each run as a **judge-only round** of `adversarial-review-loop`.
That skill supplies the method — get the material ready, hunt for problems, adjudicate
every finding in a context that did not write what is being judged. task-spec keeps
the routing, and keeps the rule that a review phase does not fix anything: the fix
happens back in Spec or Explore, and the phase runs again on what comes back.

[Read the skill →](./skills/engineering/task-spec/SKILL.md)
· [Why it's built this way →](./docs/engineering/task-spec.md)

### adversarial-review-loop

Built from measured runs, not theory. Two numbers from the field:

- In one project, **16 of 51 fixes introduced or missed something** — which is
  why every round of fixes gets reviewed again, until a round returns zero.
- In another, **7 of 14 findings were downgraded and 1 was rejected outright**
  by independent judgement — which is why the agent that finds a problem is
  never the agent that decides whether it's real.

Convergence on a real 24-file change: **8 → 3 → 3 → 2 → 0** findings across
rounds of fix-then-re-review.

Two modes. A **full round** fixes what survived and re-reviews the fixes until a
round comes back empty. A **judge-only round** stops after adjudication and hands
over the finding list — for when something else owns the fix and the re-entry,
which is how `task-spec` runs it at its Challenge and Verify phases.

The skill carries no project-specific procedure: how much to split, if at all,
what counts as "correct", how the material is prepared — all decided by the agent
applying it, from its own project and scenario.

[Read the skill →](./skills/engineering/adversarial-review-loop/SKILL.md)
· [Why it's built this way →](./docs/engineering/adversarial-review-loop.md)

## Repo layout

```
skills/<bucket>/<name>/SKILL.md   # instructions, read by the agent every trigger
skills/<bucket>/<name>/*.md       # supporting files, loaded on demand
docs/<bucket>/<name>.md           # long-form rationale, written for humans
.claude-plugin/                   # Claude Code plugin manifest
scripts/                          # maintainer tooling
```

Each skill keeps its `SKILL.md` tight: what to do, in order. Anything that is
rationale, or only needed in one branch of the run, lives in a sibling file and
is linked from the point where it's needed. The agent pays for those only when
it actually follows the link.

Adding a skill means editing **two** places: drop in the directory, then add its
path to `.claude-plugin/plugin.json`. `npm run check` fails if you forget.

## Maintainer scripts

```bash
npm run list     # enumerate every SKILL.md
npm run check    # manifest + version + changelog consistency (the CI gate)
./scripts/link-skills.sh   # symlink skills into ~/.claude/skills and ~/.agents/skills
```

Anything already in a skill's slot is preserved, never deleted: a real directory
is moved aside to `.bak-<name>-<timestamp>/`, and a symlink's *content* (not the
link itself) is copied to the same place. Re-running won't stack up duplicates.

## Releasing

`main` is protected: nothing reaches it except a merge, the `check` status has to
pass first, and a released tag can't be moved or deleted. Version numbers move at
a release, and a release is a decision — so between releases `main` is ahead of
the newest tag.

That distinction matters, because `npx skills add CaffreySun/skills` installs the
tip of `main` and never looks at a version number. Pin a tag when you want a known
state. How a version is chosen, and the procedure, are in
[`RELEASING.md`](./RELEASING.md).

## License

MIT
