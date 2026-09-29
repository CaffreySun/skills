#!/usr/bin/env node
// Checks a branch against the commit it will land on. `main` is the released
// state, so nothing reaches it without being a release: the version has to move,
// the changelog has to have a dated section for the new version, and a skill
// whose files changed has to carry that in its own version.
//
// This is the only check that needs git. Without a base commit to compare
// against it says so and passes, so `npm run check` still works anywhere.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.BASE_REF;

const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

const say = (msg) => console.log(msg);

if (!base) {
  say("no BASE_REF set -- not comparing against anything, so nothing to enforce");
  process.exit(0);
}

// Compare against the commit the two branches diverged at, not against the tip
// of the base branch: a branch that is behind should still be judged only on
// what it itself changes. `BASE_REF` is whatever the caller has -- a SHA in CI,
// usually `origin/main` locally.
const mergeBase = (() => {
  try {
    return git("merge-base", base, "HEAD");
  } catch {
    return base;
  }
})();

let basePkg;
try {
  basePkg = JSON.parse(git("show", `${mergeBase}:package.json`));
} catch {
  say(`cannot read package.json at ${mergeBase} -- nothing to compare against`);
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const problems = [];

if (pkg.version === basePkg.version) {
  problems.push(
    `the version is still ${pkg.version}. main is the released state, so a change`
    + " that reaches it is a release: bump the version and give it a dated section"
    + " in CHANGELOG.md",
  );
} else {
  const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
  const newest = /^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}\s*$/m.exec(changelog);
  if (!newest) {
    problems.push("CHANGELOG.md has no dated release section for the new version");
  } else if (newest[1] !== pkg.version) {
    problems.push(
      `CHANGELOG.md's newest release is ${newest[1]}, but the version is ${pkg.version}`,
    );
  }
}

// A skill whose files changed carries a new version of itself, so the number
// beside a skill describes that skill and not the repository around it.
// No `...`: two-dot compares the merge base against the working tree, so this
// catches edits that are not committed yet as well as committed ones.
const changed = git("diff", "--name-only", mergeBase).split("\n").filter(Boolean);
const skillDirs = new Set(
  changed.map((f) => /^(skills\/[^/]+\/[^/]+)\//.exec(f)?.[1]).filter(Boolean),
);

for (const dir of skillDirs) {
  const file = path.join(root, dir, "package.json");
  if (!fs.existsSync(file)) continue;
  const now = JSON.parse(fs.readFileSync(file, "utf8")).version;
  let before;
  try {
    before = JSON.parse(git("show", `${base}:${dir}/package.json`)).version;
  } catch {
    continue; // a skill this repository did not have before
  }
  if (now === before) {
    problems.push(
      `${dir} changed but its version is still ${now}`
      + " -- bump it, so the number describes the skill and not just the repository",
    );
  }
}

for (const p of problems) console.error(`error: ${p}`);
if (problems.length > 0) process.exit(1);

say(`release check ok: repository ${basePkg.version} -> ${pkg.version}`
  + (skillDirs.size > 0 ? `, ${skillDirs.size} skill(s) touched` : ""));
