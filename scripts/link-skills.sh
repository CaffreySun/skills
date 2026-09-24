#!/usr/bin/env bash
set -euo pipefail

# Dev-only script for maintaining this repo locally.
#
# Symlinks every skill in this repo into the local skill directories used by
# each agent harness:
#   - ~/.claude/skills:  Claude Code
#   - ~/.agents/skills:  Codex and other Agent Skills-compatible harnesses
# Each entry is a symlink back into this repo, so `git pull` is all it takes to
# pick up changes.
#
# Only skills listed in .claude-plugin/plugin.json are linked, so this also
# acts as a smoke test that the plugin manifest is correct.
#
# SAFETY: an existing non-symlink target is moved aside to
#   <DEST>/.bak-<name>-<timestamp>/
# and reported, rather than deleted. Inspect and delete when happy.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DESTS=("$HOME/.claude/skills" "$HOME/.agents/skills")
PLUGIN="$REPO/.claude-plugin/plugin.json"

cd "$REPO"

# macOS ships bash 3.2, which has no `mapfile`; read into an array instead.
SELECTED=()
while IFS= read -r line; do
  [ -n "$line" ] && SELECTED+=("$line")
done < <(node -e '
  const fs = require("fs");
  const j = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  (j.skills || []).forEach((p) => console.log(p.replace(/^\.\//, "")));
' "$PLUGIN")

if [ "${#SELECTED[@]}" -eq 0 ]; then
  echo "error: no skills listed in $PLUGIN" >&2
  exit 1
fi

for DEST in "${DESTS[@]}"; do
  if [ -L "$DEST" ]; then
    resolved="$(readlink -f "$DEST")"
    case "$resolved" in
      "$REPO"|"$REPO"/*)
        echo "error: $DEST symlinks into this repo ($resolved)." >&2
        echo "Remove it and re-run; the script recreates it as a real dir." >&2
        exit 1
        ;;
    esac
  fi
  mkdir -p "$DEST"

  for rel in "${SELECTED[@]}"; do
    [ -f "$REPO/$rel/SKILL.md" ] || { echo "error: missing $rel/SKILL.md" >&2; exit 1; }
    name="$(basename "$rel")"
    target="$DEST/$name"

    if [ -e "$target" ] || [ -L "$target" ]; then
      if [ -L "$target" ] && [ "$(readlink -f "$target")" = "$REPO/$rel" ]; then
        echo "ok      $name ($DEST)"
        continue
      fi
      backup="$DEST/.bak-$name-$(date +%Y%m%d%H%M%S)"
      mv "$target" "$backup"
      echo "backed up previous $name -> $backup"
    fi

    ln -s "$REPO/$rel" "$target"
    echo "linked  $name -> $rel ($DEST)"
  done
done
