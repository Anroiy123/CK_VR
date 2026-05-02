## ADDED Requirements

### Requirement: Neon grid floor with scroll animation

The system SHALL render a neon grid floor plane using a custom GLSL fragment shader registered via AFRAME.registerShader.

#### Scenario: Neon grid renders on floor plane

- **WHEN** the scene loads and the grid-floor entity is present
- **THEN** a neon blue (#4dabf7) hexagonal or orthogonal grid pattern is visible on the floor plane

#### Scenario: Grid scrolls slowly over time

- **WHEN** the grid-animator component runs each frame
- **THEN** the grid pattern scrolls slowly, creating a sense of movement through space

#### Scenario: Grid fades to transparent at edges

- **WHEN** the grid pattern reaches the edges of the floor plane
- **THEN** the grid opacity fades smoothly to transparent, hiding any sharp cut-off edges

#### Scenario: Time uniform drives animation

- **WHEN** the grid-animator component tick runs each frame
- **THEN** the `time` uniform in the neon-grid shader is updated with current elapsed time
