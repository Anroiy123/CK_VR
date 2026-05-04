# Mixing Mode Five-Level Progression Design

Date: 2026-05-04
Status: Approved for planning
Scope: Mixing mode only (`mix-easy`, `mix-hard`)

## Problem

The current mixing progression no longer matches the intended learning flow. The user wants mixing mode to teach color groups in separate stages, then end with a full-board mastery level.

The current `MIX_LEVEL_CONFIG` instead mixes different target sets across six levels, including separate tint-only and tertiary+tint combinations that do not align with the intended curriculum.

## Goal

Restructure mixing mode into five levels:

- Level 1: primary colors only
- Level 2: secondary colors only
- Level 3: tertiary colors only
- Level 4: all tint colors plus the white center slot
- Level 5: the full board, including all wheel colors, all tint colors, and the white center slot

This progression must work in both `mix-easy` and `mix-hard`.

## Non-Goals

- No changes to normal mode (`easy`, `hard`).
- No changes to free play.
- No changes to the mixing station interaction model.
- No new scoring rules, penalties, or shelf-capacity mechanics.

## User-Facing Behavior

### Level structure

Each mixing level is an independent stage with its own target board:

- **Level 1:** 3 primary targets
- **Level 2:** 3 secondary targets
- **Level 3:** 6 tertiary targets
- **Level 4:** 12 tint targets + 1 white center target = 13 targets
- **Level 5:** 3 primary + 3 secondary + 6 tertiary + 12 tint + 1 white center = 25 targets

### Level transitions

When the player enters a new mixing level:

1. The board resets for the new target set.
2. Only the slots relevant to that level are visible.
3. HUD progress resets to `0/<target-count>`.
4. Completion requires filling every target shown for that level.

### Visual expectations

- Tint ring appears only on levels that include tint targets.
- White center appears only on levels that include the white target.
- Level 5 shows the complete board.

### Mode parity

- `mix-easy` and `mix-hard` use the same targets and board visibility.
- The only difference remains timer behavior.

## Technical Design

### Source of truth

`MIX_LEVEL_CONFIG` in `js/color-data.js` becomes the source of truth for:

- which targets a mixing level requires,
- how many placements are needed to complete the level,
- which slots the wheel should reveal.

### Level configuration changes

`js/color-data.js`

Replace the current six-level mixing progression with a five-level progression:

- Level 1 target set: primary hexes
- Level 2 target set: secondary hexes
- Level 3 target set: tertiary hexes
- Level 4 target set: all tint hexes + `#FFFFFF`
- Level 5 target set: all board colors + all tint hexes + `#FFFFFF`

This means:

- Level 4 target count must be 13
- Level 5 target count must be 25

### Game manager

`js/game-manager.js`

`initMixingLevel(level)` should continue to derive `totalForLevel` from `config.targets.length`.

`levelComplete()` must treat Level 5 as the last mixing level. After completing Level 5, the game should go to `victory()` instead of trying to continue.

`clearLevelPlacements(level)` must continue resetting only the targets for the current mixing level, but now against the new target sets.

### Color wheel

`js/color-wheel.js`

`prepareMixingLevel(level)` should reveal exactly the slots in `config.targets`.

Visibility rules:

- tint ring visible only if the current target set includes tint colors
- center ring visible only if the current target set includes `#FFFFFF`

This avoids showing tint or center guidance on levels that do not use them.

### Documentation alignment

`mixball.md`

Update the mixing-mode design note so its described level progression matches the new five-level curriculum.

## Data Flow

Updated mixing level start flow:

1. `GameManager.initMixingLevel(level)` loads `config = MIX_LEVEL_CONFIG[level]`.
2. `GameManager.totalForLevel` is set from `config.targets.length`.
3. `color-wheel.prepareMixingLevel(level)` reveals only those targets.
4. Initial shelf balls still spawn from the existing base mixing set.
5. Each correct placement emits `color-placed` with `mode: "game"`.
6. `GameManager.onColorPlaced()` increments progress.
7. When `placedCount === totalForLevel`, the level completes.
8. If the current mixing level is 5, the game ends in victory.

## Error Handling

No new fallback behavior is required.

If a mixing level config is missing, existing behavior remains authoritative. This design does not introduce inferred targets or automatic substitutions.

## Testing Plan

### Manual checks: level targets

- Level 1 shows only primary targets.
- Level 2 shows only secondary targets.
- Level 3 shows only tertiary targets.
- Level 4 shows only tint targets plus white center.
- Level 5 shows the full board plus white center.

### Manual checks: progress counts

- Level 1 HUD starts at `0/3`
- Level 2 HUD starts at `0/3`
- Level 3 HUD starts at `0/6`
- Level 4 HUD starts at `0/13`
- Level 5 HUD starts at `0/25`

### Manual checks: progression

- Completing Level 1 advances to Level 2
- Completing Level 2 advances to Level 3
- Completing Level 3 advances to Level 4
- Completing Level 4 advances to Level 5
- Completing Level 5 triggers victory

### Regression checks

- `mix-easy` and `mix-hard` still share the same board rules
- normal mode remains unchanged
- free play remains unchanged
- mixing station mechanics remain unchanged

## Risks and Mitigations

### Risk: Level 5 completion still uses outdated final-level assumptions

Mitigation: ensure the final mixing level boundary in game progression is updated to 5 and verify end-of-run victory manually.

### Risk: white center visibility is shown on unintended levels

Mitigation: derive center-ring visibility from whether `#FFFFFF` exists in the current target set, not from a fixed level number.

### Risk: tint ring shows on levels without tint targets

Mitigation: derive tint-ring visibility from actual target contents instead of hardcoded level thresholds.

## Files Expected to Change

- `js/color-data.js`
- `js/game-manager.js`
- `js/color-wheel.js`
- `mixball.md`

## Acceptance Criteria

1. Mixing mode uses exactly 5 levels.
2. Level 1 targets only primary colors.
3. Level 2 targets only secondary colors.
4. Level 3 targets only tertiary colors.
5. Level 4 targets all tint colors plus white center.
6. Level 5 targets the full board plus white center.
7. Level 5 completion triggers victory.
8. Normal mode and free play behavior remain unchanged.
