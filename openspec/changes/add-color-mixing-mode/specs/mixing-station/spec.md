## ADDED Requirements

### Requirement: Mixing station accepts sequential ball inputs
The mixing station SHALL allow players to drop balls one at a time into a single input slot. Source balls are temporarily held on the station display and returned to shelf after merge — they are NEVER permanently consumed.

#### Scenario: First ball dropped into empty station (any color including White)
- **WHEN** player drops any color ball (including White) from shelf into the mixing station input while station is EMPTY
- **THEN** the ball is temporarily removed from shelf, station enters HOLDING_BALL1 state, and the ball visually appears floating above the station

#### Scenario: Second ball dropped triggers merge (two non-White colors)
- **WHEN** player drops a second non-White color ball while station is HOLDING_BALL1 with a non-White color
- **THEN** both source balls are returned to their original shelf positions (not consumed); the station blends the two colors and produces a result ball on the output platform; station enters RESULT_READY state

#### Scenario: White as second ball (Tint shortcut)
- **WHEN** station is HOLDING_BALL1 with a non-White color, and player drops White as the second ball
- **THEN** both source balls return to shelf; the held color is immediately converted to its tint variant on the output platform; station enters RESULT_READY state

#### Scenario: White as first ball, non-White as second (Tint shortcut reversed)
- **WHEN** station is HOLDING_BALL1 with White, and player drops a non-White color as the second ball
- **THEN** both source balls return to shelf; the non-White color is used to produce its tint variant on the output platform; station enters RESULT_READY state

#### Scenario: Any two colors produce a result (no reject)
- **WHEN** any two color balls are placed in the station (regardless of recipe validity)
- **THEN** a result ball is ALWAYS produced on the output platform; if the combination matches a defined MIXING_RECIPES entry, the result is the recipe color; if no recipe matches, the result is a "waste" ball (muddy gray/brown) that cannot be placed on the wheel

#### Scenario: White + White produces White
- **WHEN** two White balls are placed in the station
- **THEN** both White balls return to shelf; a White ball is produced on the output platform; station enters RESULT_READY state

#### Scenario: White ball added to RESULT_READY for tint conversion
- **WHEN** station is in RESULT_READY state with a non-tinted result ball, and player drops a White ball from shelf into the input
- **THEN** the White ball is returned to shelf (not consumed); the result ball is replaced with its tint version; station remains in RESULT_READY state

#### Scenario: White ball has no effect on already-tinted result
- **WHEN** station is in RESULT_READY with an already-tinted result ball, and player drops White
- **THEN** the White ball is returned to shelf; the result ball does not change (tint of tint = same tint)

#### Scenario: Cancel HOLDING_BALL1 by grabbing the held ball
- **WHEN** station is in HOLDING_BALL1 state and player grabs the held ball from the station display
- **THEN** the ball returns to player's hand; station returns to EMPTY state; the ball can be placed back on shelf or dropped again

### Requirement: Mixed result MUST be moved to shelf before next operation
The mixing station SHALL block new mix operations until the result ball is moved to shelf.

#### Scenario: Result ball must be cleared before new mix
- **WHEN** station is in RESULT_READY state
- **THEN** the input slot does not accept non-White color balls; the only valid actions are: add White for tint conversion, or grab the result ball and move it to shelf

#### Scenario: Result ball placed on shelf
- **WHEN** player grabs the result ball from the station and releases it over the shelf area
- **THEN** the ball snaps to the shelf consuming one shelf slot; station returns to EMPTY state

#### Scenario: Result ball placed directly on correct wheel slot (from station)
- **WHEN** player grabs the result ball from the station and drops it on a matching wheel slot
- **THEN** the ball snaps to the wheel slot; station returns to EMPTY state; no shelf slot is consumed

#### Scenario: Result ball placed on wrong wheel slot (from station)
- **WHEN** player grabs the result ball from the station and drops it on a non-matching wheel slot
- **THEN** the wheel rejects the ball; ball bounces back to shelf consuming one shelf slot; station returns to EMPTY state

#### Scenario: Shelf ball placed on correct wheel slot (frees shelf slot)
- **WHEN** player picks up any non-Waste ball from the shelf and drops it on its matching wheel slot
- **THEN** the ball snaps to the wheel slot; shelf occupied slot count decreases by 1

#### Scenario: Waste ball cannot be placed on wheel
- **WHEN** player attempts to place a waste ball from shelf onto any wheel slot
- **THEN** the wheel rejects the ball; the ball remains on shelf still occupying its slot

### Requirement: Mixing station visual states
The mixing station SHALL provide clear visual feedback for each operational state.

#### Scenario: EMPTY state visual
- **WHEN** station is EMPTY
- **THEN** the input cup glows with a soft blue pulse, and no ball is displayed on the output platform

#### Scenario: HOLDING_BALL1 state visual
- **WHEN** station is HOLDING_BALL1
- **THEN** the input cup glows brighter blue, and the held ball is displayed floating above the station

#### Scenario: RESULT_READY state visual
- **WHEN** station enters RESULT_READY
- **THEN** a particle burst effect plays at the station; the input cup glow turns off; the result ball appears on the output platform with a golden glow

#### Scenario: Waste ball visual
- **WHEN** the merge produces a waste ball (no matching recipe)
- **THEN** the result ball appears as a muddy gray-brown color with a dull red flash on the station
