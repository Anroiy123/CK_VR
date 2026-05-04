# Normal Mode Level Isolation Design

Date: 2026-05-04
Status: Approved for planning
Scope: Normal mode only (`easy`, `hard`)

## Problem

Normal mode currently uses two different datasets when a level starts:

- `GameManager.initLevel()` spawns balls from `getColorsForLevel(level)`.
- `color-wheel.prepareGameLevel()` reveals slots from `getVisibleColorsForGame(level)`.

Because Level 2 and Level 3 reveal more slots than the balls that are spawned, the wheel can show valid-looking targets that have no matching ball on the shelf. This breaks the intended rule for normal mode.

## Goal

Make normal mode behave as an isolated level-based matching mode:

- each level starts with a clean board,
- only the target slots for the current level are visible,
- only the matching balls for the current level are spawned,
- the level completes when every spawned ball is placed in the correct slot.

This behavior must apply to both `easy` and `hard`.

## Non-Goals

- No changes to `mix-easy` or `mix-hard`.
- No changes to `freeplay`.
- No changes to timer values or leaderboard behavior.
- No new penalty, combo, or mistake-limit rules.

## User-Facing Behavior

### Level lifecycle

When a normal-mode level starts:

1. Remove any loose balls from the previous level.
2. Reset prior level placements so the board is empty.
3. Reveal only the slots for the current level target colors.
4. Spawn only the balls for the current level target colors.
5. Reset HUD progress to `0/<count>`.

### Level expectations

- Level 1 shows 3 primary slots and 3 primary balls.
- Level 2 shows 3 secondary slots and 3 secondary balls.
- Level 3 shows 6 tertiary slots and 6 tertiary balls.
- No visible slot may exist without a corresponding spawned ball for that same level.

### Mode parity

- `easy` and `hard` use the same slot and spawn rules.
- The only remaining difference is timer behavior.

## Technical Design

### Source of truth

`getColorsForLevel(level)` becomes the single level dataset for normal mode gameplay.

It already drives ball spawning and progress count in `js/game-manager.js`. The design change is to make slot visibility in `js/color-wheel.js` use that same dataset.

### Game manager

`js/game-manager.js`

- Keep `initLevel()` structure intact.
- Continue deriving `levelColors` from `getColorsForLevel(level)`.
- Continue setting `totalForLevel` from `levelColors.length`.
- Continue spawning balls from `levelColors`.
- Keep timer branching exactly as it is today: `hard` starts `Timer`, `easy` clears it.

No state machine redesign is needed because the bug is caused by mismatched level data, not by transition flow.

### Color wheel

`js/color-wheel.js`

- Change `prepareGameLevel(level)` so it reveals slots from `getColorsForLevel(level)`.
- Do not use `getVisibleColorsForGame(level)` for normal mode level setup.
- Keep tint ring and center ring hidden for normal mode.

This aligns the wheel with the same target set already used by the shelf and HUD.

### Color data

`js/color-data.js`

- `getColorsForLevel(level)` remains unchanged.
- `getVisibleColorsForGame(level)` is no longer part of normal mode setup.
- The helper may remain in the file if other flows still rely on it, but normal mode should not depend on it anymore.

## Data Flow

Updated normal mode level start flow:

1. `GameManager.initLevel(level)` loads `levelColors = getColorsForLevel(level)`.
2. `GameManager` clears loose balls.
3. `color-wheel.prepareGameLevel(level)` reveals slots for exactly `levelColors`.
4. `GameManager.spawnBalls(levelColors, "game")` creates exactly matching balls.
5. HUD shows `0/<levelColors.length>`.
6. Each correct placement increments `placedCount`.
7. When `placedCount === totalForLevel`, the level completes.

## Error Handling

No new error-handling paths are required.

If a level config is missing, existing behavior remains authoritative. This design does not introduce fallback rules or inferred colors.

## Testing Plan

### Manual tests: easy

- Start Level 1 and confirm only 3 primary slots and 3 primary balls appear.
- Complete Level 1 and confirm Level 2 resets the board before showing only 3 secondary slots and 3 secondary balls.
- Complete Level 2 and confirm Level 3 resets the board before showing only 6 tertiary slots and 6 tertiary balls.
- Confirm every visible slot has a matching spawned ball.

### Manual tests: hard

- Repeat the same slot/spawn checks in `hard`.
- Confirm timer still starts from `LEVEL_CONFIG[level].timer`.
- Confirm timeout still triggers game over.

### Regression checks

- Confirm `mix-easy` and `mix-hard` still use their separate flow.
- Confirm `freeplay` still reveals all colors.
- Confirm HUD progress remains `0/3`, `0/3`, and `0/6` for normal mode levels.

## Risks and Mitigations

### Risk: another part of normal mode still assumes progressive visible colors

Mitigation: constrain the change to `prepareGameLevel(level)` and validate Level 1-3 manually after the update.

### Risk: stale helper remains misleading

Mitigation: keep `getVisibleColorsForGame(level)` out of normal mode call paths. If it becomes unused after implementation, it can be removed as a follow-up cleanup, not as part of this design.

## Files Expected to Change

- `js/color-wheel.js`
- potentially `js/color-data.js` if cleanup is performed

`js/game-manager.js` is expected to remain behaviorally the same, aside from now being aligned with the wheel logic it already coordinates.

## Acceptance Criteria

1. In normal mode, visible wheel slots exactly match the current level color set.
2. In normal mode, spawned shelf balls exactly match the current level color set.
3. Level 2 and Level 3 no longer show any slot that lacks a corresponding spawned ball.
4. `easy` and `hard` share the same spawn/slot behavior.
5. Mixing mode and free play behavior remain unchanged.
