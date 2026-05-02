## MODIFIED Requirements

### Requirement: Color wheel rings have stronger emissive and halo ring

The color-wheel component SHALL increase emissive intensity on existing rings and add a third faint halo ring.

#### Scenario: Outer ring emissive increases to 0.45

- **WHEN** the color-wheel component creates the outer ring
- **THEN** the outer torus has emissiveIntensity=0.45

#### Scenario: Inner ring emissive increases to 0.35

- **WHEN** the color-wheel component creates the inner ring
- **THEN** the inner torus has emissiveIntensity=0.35

#### Scenario: Halo ring added outside outer ring

- **WHEN** the color-wheel component creates rings
- **THEN** a third torus is created with radius=outerRadius+0.02, radius-tubular=0.015, low opacity (~0.08-0.12), weak emissive, acting as a subtle glow halo

### Requirement: Wheel sector segments use MeshStandardMaterial with emissive

The color-wheel component SHALL use THREE.MeshStandardMaterial instead of THREE.MeshBasicMaterial for sector segments, with emissive coloring for active layers.

#### Scenario: Active sector layer has emissive color

- **WHEN** a sector segment transitions to active (occupied) state via getActiveLayerStyle
- **THEN** the segment material uses MeshStandardMaterial with emissive=fillColor at intensity 0.15 and opacity near 1.0
