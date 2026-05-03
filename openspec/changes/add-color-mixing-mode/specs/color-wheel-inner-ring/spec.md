## ADDED Requirements

### Requirement: Inner tint ring on color wheel
The color wheel SHALL display an inner ring of 12 slots for tint (desaturated) color variants, positioned at the same angular positions as the outer saturated slots but at a smaller radius.

#### Scenario: Inner ring slot positions
- **WHEN** the color wheel is rendered for mixing mode
- **THEN** 12 inner ring slots are created at radius ~0.55-0.65, each sharing the angular position of its corresponding saturated color slot on the outer ring

#### Scenario: Inner ring slot visibility for tint levels (3-4, 6)
- **WHEN** a mixing level that requires tints (level 3: 3 secondary tints; level 4: 6 tertiary tints; level 6: all 12 tints) is active
- **THEN** the inner ring slots for the required tints are visible and accept tint balls; non-target tint slots may be dimmed

#### Scenario: Inner ring slots hidden when not needed
- **WHEN** a mixing level that does not require tints (levels 1-2, level 5) is active
- **THEN** the inner ring slots are dimmed or hidden

### Requirement: White center slot
The color wheel SHALL have a single slot at the center (position 0,0 on the wheel plane) for the White ball.

#### Scenario: White center slot renders
- **WHEN** the color wheel is rendered for mixing mode
- **THEN** a circular slot is displayed at the wheel center with white color indicator

#### Scenario: White ball placement
- **WHEN** a White ball is placed on the center slot
- **THEN** the ball snaps to the center position and the slot is marked as occupied

#### Scenario: White center slot visibility
- **WHEN** mixing levels 5-6 (which require White center) are active
- **THEN** the White center slot is highlighted as a target
- **WHEN** mixing levels 1-4 are active
- **THEN** the White center slot is dimmed or hidden (White not yet required)

### Requirement: Wheel visual layers for mixing mode
The color wheel SHALL clearly distinguish between the outer saturated ring, inner tint ring, and center White slot through visual styling.

#### Scenario: Outer ring styling
- **WHEN** mixing mode is active
- **THEN** the outer ring sectors use full saturation colors with strong emissive

#### Scenario: Inner ring styling
- **WHEN** mixing mode is active
- **THEN** the inner ring sectors use lighter/pastel tint colors with softer emissive

#### Scenario: Center white styling
- **WHEN** mixing mode is active
- **THEN** the center slot has a white circular indicator with subtle glow

### Requirement: Slot visibility per mixing level
The `prepareMixingLevel` method SHALL show only the slots needed for the current level targets.

#### Scenario: Mixing level 1 slot preparation
- **WHEN** mixing mode level 1 is prepared
- **THEN** only the 3 secondary color slots (Orange 60°, Green 180°, Purple 300°) on the outer ring are highlighted as targets; all other slots are dimmed

#### Scenario: Mixing level 2 slot preparation
- **WHEN** mixing mode level 2 is prepared
- **THEN** 6 tertiary color slots on the outer ring are highlighted as targets; all other slots are dimmed

#### Scenario: Mixing level 3 slot preparation
- **WHEN** mixing mode level 3 is prepared
- **THEN** 3 secondary slots on outer ring + 3 secondary tint slots on inner ring are highlighted as targets

#### Scenario: Mixing level 4 slot preparation
- **WHEN** mixing mode level 4 is prepared
- **THEN** 6 tertiary slots on outer ring + 6 tertiary tint slots on inner ring are highlighted as targets

#### Scenario: Mixing level 5 slot preparation
- **WHEN** mixing mode level 5 is prepared
- **THEN** all 12 saturated slots on outer ring + White center slot are highlighted as targets (Primary balls R,Y,B can be placed directly without mixing); inner ring is dimmed

#### Scenario: Mixing level 6 slot preparation
- **WHEN** mixing mode level 6 is prepared
- **THEN** all 12 outer ring slots, all 12 inner ring slots, and the center White slot are highlighted as targets

### Requirement: Primary ball direct placement in mixing mode
The color wheel SHALL accept Primary color balls (Red, Yellow, Blue) placed directly from shelf without requiring mixing.

#### Scenario: Primary ball placed directly on wheel
- **WHEN** a Primary ball (Red, Yellow, or Blue) from shelf is dropped on its matching outer ring slot in mixing mode
- **THEN** the ball snaps to the slot; slot is marked occupied; shelf counter decreases by 1

#### Scenario: Primary ball direct placement only when Primary is a target
- **WHEN** a Primary ball is dropped on the wheel in a mixing level where Primary slots are not targets (levels 1-4)
- **THEN** the wheel rejects the ball; the ball returns to shelf (no slot consumed or freed)
