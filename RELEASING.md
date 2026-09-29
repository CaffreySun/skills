# Releasing

`main` is the released state. Every change reaches it through a pull request, and
a version is a tag on a commit that is already on `main`.

This matters more here than it does in most repositories, because of how the skill
is installed:

```bash
npx skills add CaffreySun/skills            # the tip of the default branch
npx skills add CaffreySun/skills#v0.2.0     # a fixed ref
```

The first form does not read the version numbers at all — it clones `main` and
takes what is there. So any commit that lands on `main` is published the moment it
lands, whatever the version says. The version numbers only mean something if
`main` only ever moves at a release.

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

# Tags: a released tag cannot be moved or deleted, so `#v0.2.0` keeps resolving
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

## A release

A release is a pull request that changes nothing but version numbers and the
changelog, so that the commit it produces is exactly the released state.

1. **Branch.**

   ```bash
   git switch -c release/x.y.z
   ```

2. **Bump the four versions.** Root and plugin move together; the two skills
   take whatever their own change warrants.

   ```
   package.json                                        x.y.z
   .claude-plugin/plugin.json                          x.y.z
   skills/engineering/adversarial-review-loop/package.json
   skills/engineering/task-spec/package.json
   ```

3. **Date the changelog.** Move the contents of `## [Unreleased]` under a new
   `## [x.y.z] - YYYY-MM-DD`, and leave a fresh empty `## [Unreleased]` above it.

   `npm run check` fails if `package.json`'s version and the changelog's newest
   release disagree, so this step cannot be skipped quietly.

4. **Open the pull request, wait for `check`, merge.**

5. **Tag the merge commit and push the tag.**

   ```bash
   git switch main && git pull
   git tag -a vx.y.z -m "x.y.z — <one line>"
   git push origin vx.y.z
   ```

The tag is the release. Everything before it is ordinary development; everything
after it is the next version.

## When the tag has to move

It can't, once the tag ruleset is active — which is the point. If a release is
wrong, release the next patch instead of rewriting the old tag; anyone who pinned
the broken version stays where they are, and everyone else moves forward.

Before the ruleset existed, `v0.2.0` was moved once (a rebase rewrote the commits
it pointed at). That is the failure the ruleset prevents.
