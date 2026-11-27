<!-- Title: a conventional commit (`fix(menu): …`); it becomes the squash commit. One PR, one problem. -->

## What and why

<!-- What was wrong or missing before, and what this changes for the people using it. A list for the details. -->

Closes #

## Breaking changes

<!-- Delete if none. What users' copied code must change, old → new. -->

```diff
- before
+ after
```

## Screenshots

<!-- Delete if nothing visible changed. Light and dark; phone and desktop where they differ. -->

|       | Before | After |
| ----- | ------ | ----- |
| Light |        |       |
| Dark  |        |       |

## How it was checked

<!-- The commands you ran and what they showed, and what you looked at by hand. Leave unticked what does not apply or was skipped, and say why. -->

- [ ] `bun run check`
- [ ] Components or demos: `bun run check:demos`; layout changes also `bun run check:narrow`, the narrow shots looked at
- [ ] Behaviour: `bun run test:gallery`
- [ ] Registry items or the CLI: `bun run test:install`
- [ ] `registry.json` or component files: `bun run registry:build`, `public/r` committed
- [ ] Users notice it: a line under `## Unreleased` in `CHANGELOG.md`
