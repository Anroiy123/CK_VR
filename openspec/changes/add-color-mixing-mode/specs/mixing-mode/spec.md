## ADDED Requirements

### Requirement: Mixing Mode game flow
The system SHALL provide a mixing game mode where players create colors by combining source colors at a mixing station, then place resulting colors onto the color wheel.

#### Scenario: Mixing mode menu entry
- **WHEN** the main menu is displayed
- **THEN** a "MIX" button with purple color (#7950f2) is shown alongside EASY, HARD, FREE PLAY, LEADERBOARD buttons

#### Scenario: Starting mixing mode
- **WHEN** player clicks the MIX button
- **THEN** the system transitions to PLAYING state in mixing mode, initializes level 1 with timer, shows the mixing station, shelf with 3 primary colors (Red, Yellow, Blue) and 1 White ball, and the color wheel with all target slots empty

#### Scenario: Source balls are never consumed during mixing
- **WHEN** player mixes colors at the mixing station
- **THEN** source balls placed into the station are returned to their original shelf positions after each merge operation; only the result ball (correct or waste) occupies a new or existing shelf slot

#### Scenario: Shelf slot management
- **WHEN** mixing mode is active
- **THEN** shelf has a maximum capacity of 10 slots; initial balls occupy 4 slots (Red, Yellow, Blue, White); each result ball placed on shelf uses one slot; waste balls also use one slot; when slots reach 10 and there are still empty wheel slots, no more mixing is possible (game effectively stuck — TIME_UP after a short warning)

#### Scenario: Result ball must go to shelf first
- **WHEN** a result ball is produced at the mixing station (correct or waste)
- **THEN** the player MUST move the result ball to shelf; the station will not accept new color balls until the result is cleared

#### Scenario: Placing correct result on wheel (frees shelf slot)
- **WHEN** player picks up a correctly-mixed result ball from the shelf and drops it on its matching wheel slot
- **THEN** the ball snaps to the wheel slot; the slot is marked occupied; shelf occupied slot count decreases by 1; if this completes all targets for the level, the level is complete

#### Scenario: Primary ball placed directly on wheel (no mix needed)
- **WHEN** player picks up a Primary ball (Red, Yellow, or Blue) from shelf in mixing mode and drops it on its matching outer ring slot (levels 5-6 only)
- **THEN** the ball snaps to the slot; slot is marked occupied; shelf occupied slot count decreases by 1

#### Scenario: Primary ball rejected in non-Primary levels
- **WHEN** player drops a Primary ball on its outer ring slot in mixing levels 1-4 (where Primary slots are not targets)
- **THEN** the wheel rejects the ball; the ball returns to shelf (no slot count change)

#### Scenario: Waste ball cannot go on wheel
- **WHEN** player attempts to place a waste ball on the wheel
- **THEN** the wheel rejects the ball; the ball remains on shelf occupying a slot

#### Scenario: Mixing level completion
- **WHEN** all required wheel slots for the current level are filled with correctly colored balls
- **THEN** the system displays level complete message, transitions to next level (or victory if level 6 completed)

#### Scenario: Mixing mode victory
- **WHEN** all 6 levels are completed in mixing mode
- **THEN** victory panel is shown with total time and mode "MIX"

#### Scenario: Timer in mixing mode
- **WHEN** mixing mode level is active
- **THEN** a countdown timer is displayed; when timer expires, game transitions to TIME_UP state

#### Scenario: Shelf full game over
- **WHEN** shelf slots reach 10 and not all wheel targets are filled
- **THEN** a warning is displayed for 3 seconds; then game transitions to TIME_UP state

#### Scenario: Hint display by level
- **WHEN** level 1 of mixing mode starts
- **THEN** full recipe hints are shown (e.g., "Red + Yellow → Orange")
- **WHEN** level 2-3 of mixing mode starts
- **THEN** partial hints are shown (one source color or target hidden)
- **WHEN** level 4-6 of mixing mode starts
- **THEN** no hints are shown

### Requirement: Shelf slot counter display
The system SHALL display the current shelf slot usage during mixing mode.

#### Scenario: Slot counter updates
- **WHEN** a result ball is placed on the shelf (correct or waste)
- **THEN** the shelf counter text updates to show "N/10" where N is the current number of occupied slots

#### Scenario: Shelf nearly full warning
- **WHEN** shelf slots reach 8/10
- **THEN** the shelf counter displays in yellow warning color
- **WHEN** shelf slots reach 9/10 or 10/10
- **THEN** the shelf counter displays in red
