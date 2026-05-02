## MODIFIED Requirements

### Requirement: Particle pool uses InstancedMesh with trails

The ParticlePool system SHALL use THREE.InstancedMesh instead of THREE.Points, with increased particle count, scale-down animation, and trail effect.

#### Scenario: Particles render via InstancedMesh

- **WHEN** ParticlePool.init() runs
- **THEN** the system creates one THREE.InstancedMesh with SphereGeometry(0.018, 6, 4) and MeshBasicMaterial, covering all pool entries in a single draw call

#### Scenario: Burst spawns 48 particles

- **WHEN** ParticlePool.burst() is called
- **THEN** 48 particles are emitted per burst (up from 30)

#### Scenario: Particles scale down during animation

- **WHEN** particles animate after a burst
- **THEN** each particle scales from radius 0.018 down to 0.005 over the burst duration, creating a "fading away" effect

#### Scenario: Particles have spin rotation

- **WHEN** particles animate after a burst
- **THEN** each particle rotates/spins via dummy matrix transformation during its lifetime

#### Scenario: Trail effect renders with ghost instances

- **WHEN** particles animate after a burst
- **THEN** 3 ghost instances follow each particle, rendered at previous frame positions with decreasing scale, creating a motion trail

#### Scenario: Particles burst from origin radially

- **WHEN** ParticlePool.burst() is called
- **THEN** particles have initial radial velocities outward from the burst origin point
