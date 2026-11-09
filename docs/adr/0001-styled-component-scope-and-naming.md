# Styled Component scope, naming, and composition-only

This repo’s product unit is a **Styled Component**: Copy-into-app source over a store-exported `nsh/base` control, with brand defaults from `theme.json`. Distribution (registry / CLI) and brand look are co-primary; shadcn familiarity is a means, not a third goal.

We decided: (1) **Registry Completeness** — every target-store `nsh/base` export is in scope; thin entries must still hook theme (no bare re-export); Extensions without base stay out. (2) **Naming follows nsh** — `add` ids, file paths, docs, and Composition part family names derive from base symbols (`Menu` → `menu` / `MenuTrigger`), not shadcn ids like `dropdown-menu` / `DropdownMenu*`; old ids are hard-deleted with no aliases. (3) **Composition-only** for compounds — delete legacy single-root `trigger` / dual paths in Author Package, registry, gallery, docs, and template in one cut. (4) **Behavior Authority** stays on `nsh/base`; Differences document irreducible gaps.

## Considered Options

- Brand-only admission (skip thin catalog entries) — rejected so `add` coverage tracks store base.
- shadcn registry ids + part prefixes — rejected; mixed `add menu` / `import DropdownMenu` and false shadcn parity.
- Long-term dual API or temporary aliases — rejected to avoid two truths while the project is still early.

## Consequences

- Breaking change for anyone on `dropdown-menu` or legacy `trigger` props.
- Docs and `AGENTS.md` must stop saying “shadcn-shaped public names”; composition _roles_ (Trigger/Content/Item) remain, family names do not.
- Glossary: root `GLOSSARY.md`.
