## ADDED Requirements

### Requirement: Procedural starfield sky renders 800+ twinkling stars

The system SHALL render a procedural starfield on a large sphere surrounding the scene, using a custom GLSL fragment shader registered via AFRAME.registerShader.

#### Scenario: Stars render with twinkling animation

- **WHEN** the scene loads and the starfield-sky entity is present
- **THEN** at least 800 stars are visible on the sky sphere, with subtle twinkling intensity variation over time

#### Scenario: Background gradient from deep purple to dark blue

- **WHEN** the starfield shader renders
- **THEN** the sky background shows a vertical gradient from deep purple (#0a0015) at the bottom to dark blue-black (#050d1a) at the top

#### Scenario: Time uniform updates every frame for star animation

- **WHEN** the starfield-animator component tick runs each frame
- **THEN** the `time` uniform in the starfield shader is updated with the current elapsed time, causing star twinkling

#### Scenario: Stars use procedural hash function

- **WHEN** the starfield shader runs
- **THEN** star positions are generated procedurally using hash functions operating on fragment coordinates, without requiring any texture image asset
