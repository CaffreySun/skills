#!/usr/bin/env node
// Verifies that .claude-plugin/plugin.json lists exactly the skills present on
// disk, and that each listed path has a SKILL.md whose frontmatter `name`
// matches its directory. Run with --check in CI, or without for a report.
import fs from "node:fs";
import path from "node:path";

const check = process.argv.includes("--check");
const root = path.resolve(import.meta.dirname, "..");
const pluginPath = path.join(root, ".claude-plugin", "plugin.json");

const plugin = JSON.parse(fs.readFileSync(pluginPath, "utf8"));
const listed = (plugin.skills ?? []).map((p) => p.replace(/^\.\//, ""));

function frontmatterName(skillMd) {
  const text = fs.readFileSync(skillMd, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return null;
  const name = /^name:\s*(.+)$/m.exec(match[1]);
  return name ? name[1].trim().replace(/^["']|["']$/g, "") : null;
}

const onDisk = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(full);
    } else if (entry.name === "SKILL.md") {
      onDisk.push(path.relative(root, path.dirname(full)));
    }
  }
})(path.join(root, "skills"));

const listedSet = new Set(listed);
const diskSet = new Set(onDisk);
const missing = listed.filter((p) => !diskSet.has(p));
const unlisted = onDisk.filter((p) => !listedSet.has(p));

const problems = [];
for (const p of missing) problems.push(`listed but not on disk: ${p}`);
for (const p of unlisted) problems.push(`on disk but missing from plugin.json: ${p}`);

for (const rel of listed) {
  const skillMd = path.join(root, rel, "SKILL.md");
  if (!fs.existsSync(skillMd)) continue;
  const name = frontmatterName(skillMd);
  const dir = path.basename(rel);
  if (name && name !== dir) {
    problems.push(`frontmatter name "${name}" != directory "${dir}" (${rel})`);
  }
}

// The plugin version must track the root package.json version: they ship as
// one artifact and a drifted pair silently publishes stale skill copies.
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const pkgVersion = pkg.version;
if (pkgVersion !== plugin.version) {
  problems.push(
    `version drift: package.json is ${pkgVersion}, plugin.json is ${plugin.version}`,
  );
}

// Each skill carries its own version. Nothing installs by it -- `npx skills add
// owner/repo` resolves a repository ref -- so it is a record for a reader, but
// it still has to be a well-formed one.
for (const rel of listed) {
  const file = path.join(root, rel, "package.json");
  if (!fs.existsSync(file)) {
    problems.push(`no package.json next to SKILL.md: ${rel}`);
    continue;
  }
  const v = JSON.parse(fs.readFileSync(file, "utf8")).version;
  if (!/^\d+\.\d+\.\d+$/.test(v ?? "")) {
    problems.push(`not a semver version: ${rel}/package.json is ${JSON.stringify(v)}`);
  }
}

// The changelog is the only record of what a version contains, so a version
// bump without a dated section for it is a release nobody can read.
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
if (!/^## \[Unreleased\]/m.test(changelog)) {
  problems.push("CHANGELOG.md has no [Unreleased] section");
}
const newest = /^## \[(\d+\.\d+\.\d+)\]/m.exec(changelog);
if (!newest) {
  problems.push("CHANGELOG.md has no dated release section");
} else if (newest[1] !== pkgVersion) {
  problems.push(
    `CHANGELOG.md's newest release is ${newest[1]}, but package.json is ${pkgVersion}`
    + " -- release the version, or bump the version",
  );
}

if (check && problems.length > 0) {
  for (const p of problems) console.error(`error: ${p}`);
  process.exit(1);
}

console.log(`${listed.length} skill(s) in plugin.json, ${onDisk.length} on disk`);
if (problems.length === 0) console.log("ok: plugin manifest matches the skills tree");
else problems.forEach((p) => console.log(`warn: ${p}`));
if (check) process.exit(0);
