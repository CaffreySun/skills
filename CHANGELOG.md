# Changelog

All notable changes to this repository are documented here. Versions are set on
the root `package.json` and mirrored into `.claude-plugin/plugin.json`;
`scripts/check-plugin-skills.mjs --check` fails if they drift.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
