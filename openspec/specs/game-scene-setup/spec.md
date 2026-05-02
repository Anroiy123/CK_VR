## MODIFIED Requirements

### Requirement: Scene has upgraded lighting and renderer configuration

The scene in index.html SHALL use upgraded lighting (hemisphere + point light), ACESFilmic tone mapping, and include new script tags and entities for the graphics overhaul.

#### Scenario: Sky entity uses starfield shader

- **WHEN** the scene loads
- **THEN** the `<a-sky>` is replaced with `<a-sphere>` using material `shader: starfield` with the starfield-animator component attached

#### Scenario: Floor entity uses neon grid shader

- **WHEN** the scene loads
- **THEN** the floor `<a-plane>` uses material `shader: neon-grid` with the grid-animator component attached

#### Scenario: Scene lighting is upgraded

- **WHEN** the scene loads
- **THEN** ambient light has color=#b8c4ff and intensity=0.85, directional light has intensity=0.65, and a point light with color=#9775fa is positioned above the color wheel area

#### Scenario: Renderer uses ACESFilmic tone mapping

- **WHEN** the scene loads
- **THEN** the A-Frame renderer has toneMapping set to ACESFilmic and toneMappingExposure set to 1.2

#### Scenario: New script tags are added

- **WHEN** the HTML page loads
- **THEN** script tags for js/starfield-sky.js, js/grid-floor.js, and js/ambient-particles.js are included before the other game script tags

#### Scenario: Ambient particles entity exists in scene

- **WHEN** the scene loads
- **THEN** an a-entity with the ambient-particles component is present in the scene
