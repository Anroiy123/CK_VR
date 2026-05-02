## MODIFIED Requirements

### Requirement: Ball uses MeshPhysicalMaterial with iridescence

The color-ball component SHALL use THREE.MeshPhysicalMaterial instead of the default MeshStandardMaterial, with iridescence and clearcoat properties for a premium glass-like appearance.

#### Scenario: Ball material upgrades to MeshPhysical with iridescence on init

- **WHEN** the color-ball component initializes
- **THEN** the ball mesh material is upgraded via mesh traversal to THREE.MeshPhysicalMaterial with iridescence=0.8, iridescenceIOR=1.3, iridescenceThicknessRange=[300, 500], metalness=0.45, roughness=0.28, clearcoat=0.4, clearcoatRoughness=0.15

#### Scenario: Ball geometry has higher segment count

- **WHEN** the color-ball component initializes
- **THEN** the sphere geometry uses segmentsWidth=24 and segmentsHeight=18

#### Scenario: Hover emissive intensity increases

- **WHEN** the cursor hovers over a ball (mouseenter event)
- **THEN** the ball emissiveIntensity increases to 0.4 and the iridescence effect becomes more pronounced

#### Scenario: Grab emissive intensity increases further

- **WHEN** a ball is grabbed (grab-start event)
- **THEN** the ball emissiveIntensity increases to 0.55 and scale increases to 1.06
