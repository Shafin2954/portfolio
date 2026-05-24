# Copilot Instructions

## Build, test, and lint commands

- This repository is a static site (`index.html` + `styles.css` + `script.js`) and does **not** include a package manifest or configured build/test/lint toolchain.
- Local run command used in this repo: open `index.html` in a browser (as documented in `README.md`).
- Full test suite: not configured.
- Single test run: not configured.

## High-level architecture

- The app is a single-page, section-driven portfolio in `index.html`, rendered inside `.scroll-container` with canonical `data-index` sections:
  - `0` welcome
  - `1` works (horizontal panels: `apps-panel`, `data-science-panel`, `creative-panel`)
  - `2` interests (horizontal panels)
  - `3` about parent placeholder (menu-only container)
  - `4` timeline
  - `5` contact
- `script.js` is the interaction orchestrator:
  - builds the left file-tree menu from `menuTree`, then derives both tree DOM and breadcrumb paths from that one structure.
  - keeps scroll position, active menu item, and breadcrumb in sync via `updateSections()`, `updateTreeState()`, and `updateBreadcrumb()`.
  - implements scroll gating/handoff so vertical wheel/touch/keyboard events are redirected into horizontal panel snapping while Works/Interests are centered, then handed back to vertical navigation at edges.
  - handles timeline horizontal stepping with its own gated logic when the timeline section is centered.
  - updates ambient background state by section (`--accent-color`, `--accent-rgb`, and `.shape-group[data-section]` activation).
- `styles.css` contains most stateful UI behavior through classes (`active`, `near-above`, `expanded`, panel/card states), while JS primarily toggles classes and scroll positions.

## Key codebase conventions

- **`data-index` is a cross-file contract.** Section ordering/indexing must stay aligned across:
  - `index.html` section markup
  - `script.js` (`menuTree`, `sectionColors`, timeline/section selectors, gating logic)
  - `styles.css` selectors keyed by `[data-index]` and ambient `[data-section]`
- **`menuTree` is the source of truth** for left navigation and breadcrumb paths. Prefer updating `menuTree` rather than hardcoding new tree labels/paths in multiple places.
- **Horizontal navigation depends on stable panel IDs.** Keep `panelId` values and DOM ids in sync (`menuTree` ↔ panel elements), because active panel detection and breadcrumb routing are id-driven.
- **Use class/state toggles, not ad-hoc style rewrites.** Existing behavior relies on class transitions (`active`, `folder-active`, `expanded`, panel/card state classes) and CSS variables for accent/background updates.
- **Keep scroll handling centralized.** Unified wheel/touch/keyboard flow is intentionally routed through `handleUnifiedWheel()` and gate helpers; avoid adding parallel scroll handlers that bypass gate lock/release logic.
- `elements.md` documents the intended gate/menu interaction model; treat it as the design reference when changing navigation behavior.
- Follow the repository's `CLAUDE.md` execution style when editing: keep changes surgical, avoid unrelated refactors, and avoid speculative abstractions.
