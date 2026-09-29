# Changelog

All notable changes to this repository are documented here. Every version in it is
a commit on `main`, and every commit on `main` is one of these — see
[RELEASING.md](./RELEASING.md) for how a version number is chosen. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

A version whose step up from the version below it is a major one carries a
`**Breaking:**` line naming which of the four breaking facts applies.
`npm run check` fails if the headings are not a legal semver sequence, if a major
step has no such line, or if a minor or patch step carries one anyway.

## [1.3.0] - 2026-09-29

### Added

- **`adversarial-review-loop` gets a way to tell a slow round from a stuck one.**
  §2 asserted the loop converges and nothing in the skill could check it. §8 now
  says what non-convergence looks like — findings landing on what the last round's
  fixes touched, the same defect returning under a new name — and that the answer
  is to stop and hand over the history, never to settle it yourself. Two rounds at
  the same size are explicitly not evidence either way.
- **A running record of the round.** One line per round, written as the rounds run,
  with an identity line so a later round can tell whose history it is reading. It
  holds verdicts and the edits made, never a snapshot of the object — §5 rules that
  out, and the record says so where the two meet.
- **The re-review's return shape.** A verdict per fix it was sent, what the fix
  itself broke, and a non-blocking channel for what it noticed outside the delta.
  Without the third the only way to stay inside the delta is to stay silent.
- **A "set aside deliberately" section** in every finder's reply, alongside "items
  that could not be judged". A silent drop and an empty area look identical from
  the outside; only one of them is a judgement somebody has to own.
- **`mandated by the standard`**, for a finding that holds while the standard itself
  requires the thing it holds against. Such a finding stays on the list, does not
  enter the fix set, and reaches the reader — the author of the standard does not
  grade their own work.
- **Waiting rules.** Don't poll with a short timeout, don't sit in one silent wait,
  and reconcile what is still out: a seat that finished without reporting is one
  that was paid for and not delivered.

### Changed

- **The round's fix set can now exclude the lowest severity tier**, if the object
  declared one deferrable up front. Deferred is not dropped: it becomes a carry-over
  item with its location and its ready-made fix, and the stop rule counts over the
  set the round set out to fix, so a deferral cannot hold the loop open — or close
  it early.
- **A fix that keeps failing moves to a fresh fixer** after two passes, carrying a
  statement of what was already tried. Not after one: the context that knows what it
  chose is worth keeping until it has demonstrably stopped working.
- **The author's account of why the object is the way it is** is now marked as the
  author's account rather than folded into the standard the finders judge against.
- **The report carries the decisions taken on the reader's behalf**, in order, each
  with what it would have cost if wrong. A decision that never leaves the context
  was a decision made in secret.

### Fixed

- **`task-spec` named a specific harness's tool and agent type** — a progress-tool
  name in three places and an agent-type name in two. It now describes what it needs
  and tells you to pick from your own tool list, which is what the rest of the skill
  already does. Repository 1.2.0 -> 1.3.0; `adversarial-review-loop` 1.1.0 -> 1.2.0;
  `task-spec` 1.0.0 -> 1.0.1.

## [1.2.0] - 2026-09-29

### Changed

- **Splitting the adjudication is now decided before dispatch, not confirmed after
  the round.** §6 said to use as few subagents as you can; §8 allowed splitting one
  finding list across two adjudicators when it is too large for one context; §11
  asked afterwards whether adjudication had been one adjudicator. In a run that
  went to two, nothing asked the question at the moment it was answered — the lead's
  own plan said one adjudicator, two were dispatched, and no reason was recorded.
  §6 now carries the question as a gate you answer before you dispatch, and says
  what the reason has to be: the size of the list, not the number of rows on it,
  and never speed. §11's item confirms the gate was used rather than standing in
  for it, and §10's per-round summary carries the reason when a split happened.

## [1.1.3] - 2026-09-29

### Fixed

- **`adversarial-review-loop` told you not to do the thing it tells you to do.**
  §4 says to hand the whole round to a subagent that can dispatch finders and an
  adjudicator of its own, and calls that "the difference between this process being
  usable and unusable". §11's list of pitfalls said the opposite — "having
  subagents dispatch further subagents trips the nesting-depth limit and fails".
  Reading both, an agent takes the pessimistic one and orchestrates the round
  itself. Watched live in one session: the lead went straight to §4's second branch
  on the strength of that sentence, and every role in the round went to a subagent
  type that had no dispatch rights at all. §11 now separates the two failures that
  were run together — being handed to a role that may not dispatch, and going one
  level deeper than that — and §4 says to look up what the type is allowed to do
  rather than assume it.

### Changed

- **The frozen copy is gone, not just the check on it.** The earlier pass removed
  everything that fingerprinted the copy; what survived was the copy itself, kept
  across rounds because §8 used "last round's copy" to build the next round's
  delta. That reason does not hold: every fix in the finding list already arrives
  as a ready-made `old→new` from adjudication, so the delta can be built from what
  was changed rather than from a stored copy of the old state. §5 no longer asks
  for a copy at all when the object is already a file the reviewers can read, and
  §8 builds the delta from the recorded fixes.

## [1.1.2] - 2026-09-29

### Fixed

- **The English README stated a wider scope for `adversarial-review-loop` than the
  skill does.** Its "When it runs" cell named one of the three conditions in
  `SKILL.md` §1; the Chinese cell, written in the same commit, named two. §1
  requires all three, and the dropped one is the condition that decides whether the
  process is worth its cost at all — "when the two costs are about equal, checking
  the thing yourself is enough." The English cell now carries it, in the skill's
  own words.

## [1.1.1] - 2026-09-29

### Fixed

- **The tag job could not create the tag.** A GitHub runner has no git identity,
  and `git tag -a` needs one, so the first run of the new tagging step failed with
  `Committer identity unknown` and exit 128 — leaving the release it was supposed
  to tag without a tag. The job now sets `github-actions[bot]` as the committer
  first.

## [1.1.0] - 2026-09-29

### Changed

- **`main` is the released state, and nothing reaches it without being a release.**
  CI compares every pull request against the commit it will land on: the version
  has to move, the changelog has to have a dated section for the new version, and a
  skill whose files changed has to carry that in its own version. That is
  `npm run check:release`; it needs `BASE_REF` and passes without it, so `npm run
  check` keeps working anywhere.
- **CI tags every commit that lands on `main`.** After the check passes, a second
  job reads the version out of `package.json` and pushes `vX.Y.Z`. Tagging by hand
  is how the previous release missed its own tag and had to be moved.
- **`[Unreleased]` is gone.** It only makes sense when changes accumulate on `main`
  between releases, and now nothing does — a version is written when the change is
  written, so it gets its dated section in the same pull request.

## [1.0.0] - 2026-09-29

**Breaking:** steps, removed, depends — `adversarial-review-loop` runs a different
process than the version before it: a judge-only round, four verdicts instead of
three, the orchestration machinery gone, the frozen-copy check gone. And
`task-spec`'s Challenge and Verify no longer stand alone — they run that skill.

The version numbers were reset here. 0.1.0 and 0.2.0 were published days apart
while nobody was using the repository, and both carried numbers inherited from
before the skills moved into this monorepo: the per-skill files said `1.0.0` and
`3.0.0`, and the repository number had never described the skills at all. The
repository and both skills now start from 1.0.0 together, and the rule for moving
them is in [RELEASING.md](./RELEASING.md). The v0.1.0 and v0.2.0 tags stay where
they are; they are superseded, not withdrawn.

### Changed

- **`main` can no longer be pushed to.** A ruleset requires every change to arrive
  through a pull request, with the `check` status passing and the branch up to
  date before merging; released tags cannot be moved or deleted.
  `.github/workflows/check.yml` runs the check on every pull request and on `main`.
- **`npm run check` can fail now.** It never could: the script only exits non-zero
  with `--check`, and the npm script did not pass it. It also checks more than the
  manifest — the changelog's newest release has to equal `package.json`'s version,
  and every skill has to carry a well-formed version.
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
