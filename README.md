# skills

English | [中文版](./README.zh.md)

Two complementary skills for thoughtful planning and evidence-based review.
Both match effort to the task instead of requiring a fixed workflow for every change.

| Skill | When it helps | What it does |
|---|---|---|
| [`task-spec`](./skills/engineering/task-spec/SKILL.md) | uncertain, consequential, coordinated work, or an explicit planning request | Match planning depth to risk, preserve user constraints, adapt implementation with evidence, and verify the intended outcome. |
| [`adversarial-review-loop`](./skills/engineering/adversarial-review-loop/SKILL.md) | substantive review of changes, proposals, and other consequential artifacts | Find supported defects, escalate consequential uncertainty selectively, and verify repairs with effort matched to risk. Review-only mode leaves repairs to the caller. |

## Why both

Planning and verification answer different questions: is the approach appropriate,
and does the result meet its intended outcome? `task-spec` structures planning,
execution, and outcome verification. `adversarial-review-loop` supplies substantive
review with effort matched to risk, using independent checks where they add value.
Neither process replaces judgment; both need evidence from the actual work.

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

**Plan enough to act; adapt with evidence.** User requirements and explicit approval
gates stay authoritative. Assistant-authored implementation plans can evolve as
new evidence arrives. Routine reversible work needs no spec file or challenge.

Use an inspectable plan for consequential decisions, meaningful dependencies, or
handoffs. Investigate real trade-offs, without quotas. Fix local errors locally;
revisit the approach only when its assumptions fail. Independent review targets
consequential questions instead of forming two mandatory gates. Verify the actual
result against the original request. A plan-only request ends with the plan.

[Read the skill →](./skills/engineering/task-spec/SKILL.md)
· [Why it's built this way →](./docs/engineering/task-spec.md)

### adversarial-review-loop

**Review → handle supported findings → verify appropriately.** The lead coordinates
directly; routine findings need no separate adjudicator. Independent checks target
consequential disagreement, uncertain high-impact claims, and critical assumptions.

**Review-only / judge-only** returns findings without edits. **Review-and-fix / full
round** makes authorized repairs and verifies actual changes. Additional review
needs a concrete unresolved risk, not a requirement to reach zero findings. Reuse
valid evidence, report material unknowns, and never treat a budget stop as a pass.

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
npm run check:release   # the same, plus a comparison against the commit it lands on
```

## Releasing

`main` is the released state. Nothing reaches it except a merge, the `check`
status has to pass first, and CI tags every commit that lands — so no commit on
`main` is ever without a version. A released tag can't be moved or deleted.

That has to hold, because `npx skills add CaffreySun/skills` installs the tip of
`main` and never looks at a version number: whatever is there is what everyone
unpinned gets. How a version is chosen, and the procedure, are in
[`RELEASING.md`](./RELEASING.md).

## License

MIT
