## MODIFIED Requirements

### Requirement: Shelf has emissive accents and underglow

The color-shelf component SHALL upgrade materials to MeshStandardMaterial with emissive properties, and add an underglow glow strip below the shelf top.

#### Scenario: Shelf top surface has emissive material

- **WHEN** the color-shelf component creates the top box
- **THEN** the top uses MeshStandardMaterial with metalness=0.6, roughness=0.35, emissive=#1a2744

#### Scenario: Shelf frame has emissive border

- **WHEN** the color-shelf component creates the frame box
- **THEN** the frame has emissive=#3b5bdb at intensity 0.12

#### Scenario: Shelf legs have emissive accent

- **WHEN** the color-shelf component creates leg cylinders
- **THEN** each leg has emissive=#2b4578

#### Scenario: Underglow strip renders below shelf top

- **WHEN** the color-shelf component initializes
- **THEN** a thin plane is placed horizontally below the shelf top with emissive=#4dabf7, opacity=0.15, creating a subtle underglow effect
