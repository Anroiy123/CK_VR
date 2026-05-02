## ADDED Requirements

### Requirement: Ambient floating dust particles using InstancedMesh

The system SHALL render a cloud of floating magic dust particles around the play area using THREE.InstancedMesh.

#### Scenario: 120 dust instances render in the scene

- **WHEN** the ambient-particles entity is present in the scene
- **THEN** approximately 120 small sphere instances (radius ~0.008) are visible, distributed within a ~4x3x4 meter bounding box around the play area

#### Scenario: Particles have varied opacity

- **WHEN** ambient particles render
- **THEN** each particle has a random opacity between 0.3 and 0.6, creating a cloud-like effect

#### Scenario: Particles drift with sinusoidal motion

- **WHEN** the ambient-particles component tick runs each frame
- **THEN** each particle drifts slowly up and down following a sine wave, and rotates gently around the Y axis

#### Scenario: Single draw call for all particles

- **WHEN** ambient particles render
- **THEN** all 120 instances are rendered in a single draw call via THREE.InstancedMesh
