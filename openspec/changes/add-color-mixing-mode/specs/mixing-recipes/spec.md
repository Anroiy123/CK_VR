## ADDED Requirements

### Requirement: Secondary color recipes from primary colors
The system SHALL define recipes for creating secondary colors by mixing two primary colors.

#### Scenario: Orange recipe
- **WHEN** Red and Yellow balls are placed in the mixing station (in any order)
- **THEN** an Orange (#FF8000) ball is produced

#### Scenario: Green recipe
- **WHEN** Yellow and Blue balls are placed in the mixing station (in any order)
- **THEN** a Green (#00FF00) ball is produced

#### Scenario: Purple recipe
- **WHEN** Red and Blue balls are placed in the mixing station (in any order)
- **THEN** a Purple (#8000FF) ball is produced

### Requirement: Tertiary color recipes from primary and secondary
The system SHALL define recipes for creating tertiary colors by mixing a primary and a secondary color.

#### Scenario: Red-Orange recipe
- **WHEN** Red and Orange balls are placed in the mixing station (in any order)
- **THEN** a Red-Orange (#FF4000) ball is produced

#### Scenario: Yellow-Orange recipe
- **WHEN** Yellow and Orange balls are placed in the mixing station (in any order)
- **THEN** a Yellow-Orange (#FFBF00) ball is produced

#### Scenario: Yellow-Green recipe
- **WHEN** Yellow and Green balls are placed in the mixing station (in any order)
- **THEN** a Yellow-Green (#80FF00) ball is produced

#### Scenario: Blue-Green recipe
- **WHEN** Blue and Green balls are placed in the mixing station (in any order)
- **THEN** a Blue-Green (#00FF80) ball is produced

#### Scenario: Blue-Purple recipe
- **WHEN** Blue and Purple balls are placed in the mixing station (in any order)
- **THEN** a Blue-Purple (#0040FF) ball is produced

#### Scenario: Red-Purple recipe
- **WHEN** Red and Purple balls are placed in the mixing station (in any order)
- **THEN** a Red-Purple (#FF0080) ball is produced

### Requirement: White color definition
The system SHALL define White as a special color entity used for tint creation and the wheel center slot.

#### Scenario: White color data
- **WHEN** White color data is accessed
- **THEN** White has hex #FFFFFF, type "Base", angle undefined (center slot), targetSlot "center", and theory "White lightens any color to create a tint."

#### Scenario: White + Color produces tint
- **WHEN** White and any non-White color are combined at the mixing station (in any order)
- **THEN** the tint variant of the non-White color is produced

### Requirement: Tint color definitions
The system SHALL define tint variants for all 12 colors, each sharing the same angle as its saturated parent but with higher lightness and type "Tint". All 12 tints are defined as data but only appear as wheel targets in levels that require them.

#### Scenario: Primary tints only target in Level 6
- **WHEN** mixing levels 1-5 are active
- **THEN** Primary-Tints (Red-Tint, Yellow-Tint, Blue-Tint) are NOT wheel targets; they exist as data and can be created via White+Primary mixing, but only become wheel targets in Level 6 (all 25 slots)

#### Scenario: Red tint
- **WHEN** the tint for Red (#FF0000) is looked up
- **THEN** Red-Tint (#FF9999, angle 0, level tint, type "Tint") is returned

#### Scenario: Red-Orange tint
- **WHEN** the tint for Red-Orange (#FF4000) is looked up
- **THEN** Red-Orange-Tint (#FFAA80, angle 30, level tint, type "Tint") is returned

#### Scenario: Orange tint
- **WHEN** the tint for Orange (#FF8000) is looked up
- **THEN** Orange-Tint (#FFC080, angle 60, level tint, type "Tint") is returned

#### Scenario: Yellow-Orange tint
- **WHEN** the tint for Yellow-Orange (#FFBF00) is looked up
- **THEN** Yellow-Orange-Tint (#FFDF80, angle 90, level tint, type "Tint") is returned

#### Scenario: Yellow tint
- **WHEN** the tint for Yellow (#FFFF00) is looked up
- **THEN** Yellow-Tint (#FFFF99, angle 120, level tint, type "Tint") is returned

#### Scenario: Yellow-Green tint
- **WHEN** the tint for Yellow-Green (#80FF00) is looked up
- **THEN** Yellow-Green-Tint (#BFFF80, angle 150, level tint, type "Tint") is returned

#### Scenario: Green tint
- **WHEN** the tint for Green (#00FF00) is looked up
- **THEN** Green-Tint (#99FF99, angle 180, level tint, type "Tint") is returned

#### Scenario: Blue-Green tint
- **WHEN** the tint for Blue-Green (#00FF80) is looked up
- **THEN** Blue-Green-Tint (#80FFC0, angle 210, level tint, type "Tint") is returned

#### Scenario: Blue tint
- **WHEN** the tint for Blue (#0000FF) is looked up
- **THEN** Blue-Tint (#9999FF, angle 240, level tint, type "Tint") is returned

#### Scenario: Blue-Purple tint
- **WHEN** the tint for Blue-Purple (#0040FF) is looked up
- **THEN** Blue-Purple-Tint (#80A0FF, angle 270, level tint, type "Tint") is returned

#### Scenario: Purple tint
- **WHEN** the tint for Purple (#8000FF) is looked up
- **THEN** Purple-Tint (#C099FF, angle 300, level tint, type "Tint") is returned

#### Scenario: Red-Purple tint
- **WHEN** the tint for Red-Purple (#FF0080) is looked up
- **THEN** Red-Purple-Tint (#FF80C0, angle 330, level tint, type "Tint") is returned

### Requirement: Waste ball (no valid recipe)
The system SHALL produce a waste ball when two colors are mixed that do not form a defined recipe.

#### Scenario: Invalid pair produces waste
- **WHEN** two colors are placed in the station that do not match any recipe (e.g., Orange + Green)
- **THEN** a waste ball with hex #8B7355 (muddy brown), type "Waste" is produced; this ball CANNOT be placed on the wheel but occupies a shelf slot

### Requirement: Recipe order independence
The system SHALL treat recipe inputs as order-independent.

#### Scenario: Recipe works regardless of input order
- **WHEN** two source colors (e.g., Red and Yellow) are placed in the mixing station in any order
- **THEN** the same result (Orange) is produced

### Requirement: Mixing level configuration
The system SHALL define 6 levels of mixing mode with progressive difficulty.

#### Scenario: Level 1 configuration
- **WHEN** level 1 of mixing mode starts
- **THEN** target is 3 Secondary colors (Orange, Green, Purple), timer is 60 seconds, full hints shown

#### Scenario: Level 2 configuration
- **WHEN** level 2 of mixing mode starts
- **THEN** target is 6 Tertiary colors, timer is 75 seconds, partial hints shown

#### Scenario: Level 3 configuration
- **WHEN** level 3 of mixing mode starts
- **THEN** target is 3 Secondary (Orange, Green, Purple) + 3 Tints of Secondary (Orange-Tint #FFC080, Green-Tint #99FF99, Purple-Tint #C099FF), timer is 90 seconds, partial hints shown

#### Scenario: Level 4 configuration
- **WHEN** level 4 of mixing mode starts
- **THEN** target is 6 Tertiary + 6 Tints of all 6 Tertiary (Red-Orange-Tint, Yellow-Orange-Tint, Yellow-Green-Tint, Blue-Green-Tint, Blue-Purple-Tint, Red-Purple-Tint), timer is 120 seconds, no hints

#### Scenario: Level 5 configuration
- **WHEN** level 5 of mixing mode starts
- **THEN** target is all 12 saturated colors (3 Primary + 3 Secondary + 6 Tertiary) plus the White center slot = 13 targets, timer is 150 seconds, no hints

#### Scenario: Level 6 configuration
- **WHEN** level 6 of mixing mode starts
- **THEN** target is all 25 slots (12 saturated on outer ring + 12 tints on inner ring + White center), timer is 180 seconds, no hints
