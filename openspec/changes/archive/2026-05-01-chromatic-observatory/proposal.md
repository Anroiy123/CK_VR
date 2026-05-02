## Why

VR Color Circle's visuals are flat and dated -- solid color sky, basic MeshStandard materials, simple Points-based particles, unlit UI panels. The current aesthetic does not match the ambition of a capstone VR project. This change transforms the visual identity into a cosmic/neon observatory theme ("Chromatic Observatory") using only vanilla Three.js APIs under A-Frame 1.6.0, with zero additional libraries.

## What Changes

- Replace flat `<a-sky>` with procedural starfield shader (800+ twinkling stars, GLSL)
- Replace flat floor plane with animated neon grid shader (scroll, edge fade)
- Upgrade scene lighting (hemisphere + focal point light)
- Upgrade ball materials to MeshPhysicalMaterial with iridescence and clearcoat
- Enhance color wheel rings with stronger emissive and new halo ring
- Upgrade wheel sector segments from MeshBasicMaterial to emissive MeshStandardMaterial
- Upgrade shelf with emissive accents and underglow glow strip
- Rewrite particle system from THREE.Points to InstancedMesh (48 particles/burst, trails, scale-down)
- Add ambient floating magic dust particles (120 InstancedMesh instances, sinusoidal drift)
- Add neon glow borders to all UI panels
- Enhance VR buttons with glow planes and hover pulse animation
- Configure renderer: ACESFilmic tone mapping, exposure, foveation
- Wire new script tags and scene entities in index.html

## Capabilities

### New Capabilities
- `starfield-sky`: Procedural starfield background shader with twinkling animation
- `neon-grid-floor`: Animated neon grid floor shader with scroll and edge fade
- `ambient-particles`: Floating magic dust particles using InstancedMesh

### Modified Capabilities
- `color-ball`: Upgrade to MeshPhysicalMaterial with iridescence, clearcoat, smoother geometry
- `color-wheel`: Enhanced emissive rings, halo ring, sector material upgrade to MeshStandardMaterial with emissive
- `shelf`: Emissive accents on top/frame/legs, underglow glow plane
- `particle-pool`: Rewrite from THREE.Points to InstancedMesh, trails, 48 particles/burst, scale-down animation
- `vr-button`: Glow plane behind button, hover pulse animation, increased hover scale
- `game-scene-setup`: Lighting upgrade, background gradient update, renderer config, panel glow borders
- `ui-panels`: Glow border planes on all panels

## Impact

**Files created (3):**
- `js/starfield-sky.js`
- `js/grid-floor.js`
- `js/ambient-particles.js`

**Files modified (7):**
- `js/color-ball.js`
- `js/color-wheel.js`
- `js/shelf.js`
- `js/particle-pool.js`
- `js/vr-button.js`
- `index.html`
- `css/styles.css`

**No new external dependencies.** All shaders use raw GLSL via AFRAME.registerShader. MeshPhysicalMaterial iridescence is native to Three.js 0.160+ (bundled with A-Frame 1.6.0). Acceptable GPU cost: 12 MeshPhysicalMaterial balls, 1 InstancedMesh for particles (48x6), 1 InstancedMesh for ambient dust (120 instances), 1 starfield shader, 1 neon grid shader.
