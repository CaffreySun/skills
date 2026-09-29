# Changelog

All notable changes to this repository are documented here. Versions are set on
the root `package.json` and mirrored into `.claude-plugin/plugin.json`;
`scripts/check-plugin-skills.mjs --check` fails if they drift.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- **`adversarial-review-loop` rewritten.** It is now written in English and
  carries no project-specific procedure: how much to split, what counts as
  correct, and how the material is prepared are all decided by the agent applying
  it. The skill went from 564 lines to 248.
  - It gained a **judge-only round**: steps 1 to 4 and then it stops, producing the
    finding list for whichever process owns the fix. `task-spec` runs its two
    review phases this way.
  - Verdicts went from three tiers to four — `valid` / `partially valid` /
    `invalid` / `subsumed`. A "partially valid" finding now comes back as a
    **re-description**, the finding rewritten so that everything left in it holds,
    rather than as a boundary saying which part was overstated. A boundary is a
    remark about a finding, and a fix applies to a sentence.
  - The **orchestration machinery is removed**: the five-question capability
    probe, the two orchestration modes, the block-count table, the three-axis
    dispatch test, the groups of four, the dispatch-count reference line, and the
    spot check. Two principles replace it — who runs the round (§4), and how much
    to split (§6: one subagent finishes one piece of work by default, and an
    object too large for that is handed back to the user to bring in several
    passes).
  - The **frozen-copy check is removed.** It existed to detect the object being
    edited from outside while a round ran. Nothing does that in practice; a small
    edit would not change the verdicts enough to matter, and a large one makes the
    round meaningless regardless.
  - It now ships as `SKILL.md` plus `package.json`; what was still true in its
    former reference files moved into `SKILL.md` §4 and §7.
- **`task-spec`'s Challenge and Verify now run as judge-only rounds of
  `adversarial-review-loop`.** That skill supplies the method of one round;
  task-spec keeps the routing, and keeps the rule that a review phase does not fix
  anything — the fix goes back to Spec or Explore, and the phase runs again on
  what comes back.
- **`task-spec` is English-only.** Its Chinese translation and its per-skill
  READMEs were retired; the skill is now `SKILL.md`, `package.json` and
  `references/spec-template.md`.
- **The design docs under `docs/engineering/` are English and Chinese pairs**,
  one page per skill explaining why it is built the way it is.

### Added

- `task-spec` now requires a **list of what this round does not do** as a Spec
  output, and hands that list to every finder in Challenge and Verify. Without it
  a finder reports each deliberate omission as a defect, and those items are
  numerous and each one looks like an obvious gap, so they bury the findings that
  matter.
- `task-spec` gained an **object-of-a-round** convention: the spec file is already
  the round's object, so there is no separate copy to make.

### Removed

- `task-spec`'s "Why this skill exists" preamble, and the yield that faked a
  phase boundary.

## [0.1.0] - 2026-09-24

### Added

- Repository restructured as a multi-skill monorepo. Skills now live under
  `skills/<bucket>/<name>/`, which lets the `skills` CLI enumerate them one by
  one (`npx skills add CaffreySun/skills --skill <name>`).
- Claude Code plugin distribution via `.claude-plugin/plugin.json` and
  `.claude-plugin/marketplace.json`.
- `scripts/link-skills.sh` for maintainer-local symlink installs.
- `scripts/check-plugin-skills.mjs` verifying the plugin manifest matches the
  skills tree on disk.

### Changed

- **`task-spec`** moved from its own repository into
  `skills/engineering/task-spec`. Installation path changes from
  `npx skills add CaffreySun/task-spec` to
  `npx skills add CaffreySun/skills --skill task-spec`. Content unchanged.
- **`adversarial-review-loop`** promoted from local use to
  `skills/engineering/adversarial-review-loop`.
