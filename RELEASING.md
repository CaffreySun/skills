# Releasing

`main` is the released state. Every commit on it is a release, every release has a
tag, and no commit reaches it without one. Nothing accumulates on `main` waiting
for a version number.

This matters because of how the skill is installed:

```bash
npx skills add CaffreySun/skills            # the tip of main, which is a release
npx skills add CaffreySun/skills#v1.0.0     # that exact release
```

The first form does not read the version numbers at all — it clones `main` and
takes what is there. That is only safe because `main` cannot be anything but
released: an ordinary merge that skipped the version bump would hand every
unpinned install a state that no version describes.

## One-time setup: protect the branch and the tags

Needs admin on the repository. `gh auth status` should show the `repo` scope.

```bash
# main: no direct pushes. Changes come through a pull request, the `check`
# status has to pass, and the branch has to be up to date first.
#
# Zero approvals are required on purpose: GitHub does not let you approve your
# own pull request, so requiring one would make the branch unmergeable here.
# "Require a pull request" still forbids pushing straight to main, which is the
# point -- the pull request is the release checkpoint, not the review.
#
# No bypass actors: this applies to the maintainer too.
gh api --method POST repos/CaffreySun/skills/rulesets --input - <<'JSON'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "bypass_actors": [],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
    } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [ { "context": "check" } ]
    } }
  ]
}
JSON

# Tags: a released tag cannot be moved or deleted, so `#v1.0.0` keeps resolving
# to the same commit. Creating new tags is still allowed.
gh api --method POST repos/CaffreySun/skills/rulesets --input - <<'JSON'
{
  "name": "release tags",
  "target": "tag",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/tags/v*"], "exclude": [] } },
  "bypass_actors": [],
  "rules": [
    { "type": "update" },
    { "type": "deletion" }
  ]
}
JSON
```

To see what is active, or to turn it off in an emergency:

```bash
gh api repos/CaffreySun/skills/rulesets --jq '.[] | {id, name, enforcement}'
gh api --method PUT repos/CaffreySun/skills/rulesets/<id> \
  -f enforcement=disabled
```

The branch ruleset does **not** include `update` ("restrict updates"). That rule
would block every push, including the merge commit of an allowed pull request,
and with no bypass actors it would leave the branch unmergeable.

## Every change

```bash
git switch -c <branch>
# ... work ...
git commit
git push -u origin <branch>
gh pr create --fill
# wait for the `check` status
gh pr merge --squash
```

`required_linear_history` is on, so use squash or rebase. This repository has no
merge commits, and keeping it that way is what makes `git log` readable.

## Choosing the version

The version moves with every change that lands, because every change that lands
is a release. Most steps are small because most changes are small; what keeps the
number honest is the discipline, not the size of a step.

From `a.b.c` the next version can only be `a.b.(c+1)`, `a.(b+1).0` or `(a+1).0.0`.
`npm run check` enforces that, so a number cannot jump — you cannot go from `1.0.0`
to `1.4.0` or `3.0.0` in one step.

Which of the three:

**Patch** — the instructions mean the same thing afterwards. Wording, typos, a
link that got fixed, a file moved with its references updated, anything under
`docs/` or the README.

**Minor** — the instructions mean more than they did, and a run that was already
following them behaves the same. A new rule, a new section, an added reference
file, one more item in a checklist that already existed.

**Major** — one of these is true, and the changelog entry has to say which:

| Fact | What it means |
|---|---|
| `steps` | the steps of the process changed — how many there are, what order they come in, or a step appearing or disappearing |
| `removed` | something that existed is gone — a file, a mode, a rule, a verdict, a section |

"Gone" means the thing itself is no longer there under any name. Renaming is not
this fact: if what it does survives and only what it is called changes, the item is
not gone, and the step is minor. Renaming a verdict, a phase, or a section is a
`Changed` entry that should say the old name and the new one, so a reader who knew
the old term can find it.
| `trigger` | when the skill runs changed — the frontmatter `description`, or the name |
| `depends` | it stopped standing alone — it now needs another skill to work |

If none of the four holds, it is not a major version, whatever else changed. Write
the line at the top of the version's changelog section:

```
**Breaking:** steps, removed — <what changed>
```

`npm run check` fails if a major step has no such line, if the line names anything
outside that list, or if a minor or patch step carries one anyway.

The two skill versions follow the same rule, each judged against the changes
inside that skill. The repository and plugin versions move together and are the
ones an install can be pinned to — the installer reads repository refs, so a skill
version is a record for a reader.

## A release

A release is an ordinary pull request. There is no separate release branch and no
second step: what makes the merge a release is that it carries a version and a
dated changelog section.

1. **Branch.**

   ```bash
   git switch -c <branch>
   ```

2. **Make the change.** If it touches `skills/engineering/adversarial-review-loop/`,
   bump that skill's version; the same for `task-spec`. `npm run check:release`
   fails when a skill's files changed and its number did not.

3. **Bump the repository version, and the plugin with it** — they move together:

   ```
   package.json                                        x.y.z
   .claude-plugin/plugin.json                          x.y.z
   ```

4. **Add a dated changelog section** for the new version, describing the change
   under the usual headings. A major step needs its `**Breaking:**` line. There is
   no `[Unreleased]` section to move things out of — the version is written when
   the change is written.

5. **Open the pull request.** `check` runs `npm run check`, then compares the
   branch against the commit it will land on and fails if the version did not move.

6. **Merge.** CI tags the merge commit `vX.Y.Z` and pushes the tag. You do not tag
   by hand: the point is that no commit reaches `main` without a tag, and doing it
   by hand is exactly how that gets missed.

To see what CI will say before you push:

```bash
BASE_REF=origin/main npm run check:release
```

Without `BASE_REF` the script reports that it has nothing to compare against and
passes, so plain `npm run check` keeps working anywhere.

## When the tag has to move

It can't, once the tag ruleset is active — which is the point. If a release is
wrong, release the next patch instead of rewriting the old tag; anyone who pinned
the broken version stays where they are, and everyone else moves forward.

Before the ruleset existed, `v0.2.0` was moved once (a rebase rewrote the commits
it pointed at). That is the failure the ruleset prevents.
