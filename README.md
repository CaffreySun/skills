# skills

My agent skills. Two of them, and together they cover the one failure mode that
matters: **an agent that never checks its own work.**

They are the two halves of a single quality-control loop. One runs *before* the
agent acts, one runs *after*.

| Skill | When it runs | What it forces |
|---|---|---|
| [`task-spec`](./skills/engineering/task-spec/SKILL.md) | before acting | Explore the solution space, write an inspectable spec, then have that spec attacked adversarially — before a single file is touched. |
| [`adversarial-review-loop`](./skills/engineering/adversarial-review-loop/SKILL.md) | after acting | Partition discovery away from judgement, fix only what survives review, then review the fixes until a round yields zero findings. |

## Why both

An LLM generates the statistically most likely next token. A correct answer and a
plausible wrong one have the same statistical shape, so the model cannot tell
them apart from the inside. This breaks in two places, and they need different
fixes:

**Before acting — the first idea wins.** The highest-probability continuation is
the first "thought," and the model runs with it. No alternatives, no "is this
even the right problem?" You cannot prompt a model into *wanting* better work;
you can only force it through the steps. That is `task-spec`.

**After acting — "done" means "done well."** The model does not catch its own
contradictions or missed criteria. But "does the output match the spec?" is an
objective question, so it can be enforced from outside. That is
`adversarial-review-loop` — and its core rule is that the thing finding problems
and the thing judging whether they are real must never be the same context.

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

[Read the skill →](./skills/engineering/task-spec/SKILL.md)

### adversarial-review-loop

Built from measured runs, not theory. Two numbers from the field:

- In one project, **16 of 51 fixes introduced or missed something** — which is
  why every round of fixes gets reviewed again, until a round returns zero.
- In another, **7 of 14 findings were downgraded and 1 was rejected outright**
  by independent judgement — which is why the agent that finds a problem is
  never the agent that decides whether it's real.

Convergence on a real 24-file change: **8 → 3 → 3 → 2 → 0** findings across
rounds of fix-then-re-review.

[Read the skill →](./skills/engineering/adversarial-review-loop/SKILL.md)

## Repo layout

```
skills/<bucket>/<name>/SKILL.md   # the skill; frontmatter name must match dir
.claude-plugin/                   # Claude Code plugin manifest
scripts/                          # maintainer tooling
```

Adding a skill means editing **two** places: drop in the directory, then add its
path to `.claude-plugin/plugin.json`. `npm run check` fails if you forget.

## Maintainer scripts

```bash
npm run list     # enumerate every SKILL.md
npm run check    # assert plugin.json matches disk (use in CI)
./scripts/link-skills.sh   # symlink skills into ~/.claude/skills and ~/.agents/skills
```

`link-skills.sh` moves any pre-existing non-symlink skill aside to
`.bak-<name>-<timestamp>/` rather than deleting it.

## License

MIT
