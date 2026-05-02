## Context

VR Color Circle currently uses flat primitives (solid `<a-sky>`, basic `<a-plane>` floor, MeshStandard/Flat materials) with a simple THREE.Points particle system. The visual presentation lacks the polish expected for a capstone VR project. This design covers a full visual overhaul to a "Chromatic Observatory" theme -- a cosmic/neon observatory aesthetic -- using only vanilla Three.js APIs under A-Frame 1.6.0 with zero additional libraries.

**Current state:** Solid color sky (`#16213e`), flat floor plane (`#0f3460`), MeshStandardMaterial balls (metalness=0.3, roughness=0.5), 2 torus rings with weak emissive, THREE.Points particles (pool of 6, 30 particles/burst), flat UI panels.

**Constraints:** Pure client-side, no build system, ES5 IIFE module pattern, WebXR/VR target requiring 60+ FPS, no post-processing EffectComposer (too heavy for VR).

**Stakeholders:** Capstone evaluators, VR/desktop users.

## Goals / Non-Goals

**Goals:**
- Transform visual identity from flat primitives to cosmic/neon observatory theme
- Upgrade all materials using native Three.js features (no external libraries)
- Implement procedural shaders for sky and floor (raw GLSL via AFRAME.registerShader)
- Rewrite particle system to use InstancedMesh for better performance
- Add ambient atmospheric particles
- Polish UI with glow borders and enhanced buttons
- Maintain 60+ FPS on desktop and 90Hz on VR headset
- Follow existing IIFE pattern and ES5 conventions for all new files

**Non-Goals:**
- No post-processing pipeline or bloom effect
- No new gameplay mechanics
- No new color data or level content
- No build tooling or bundler setup
- No TypeScript or ES6+ features

## Decisions

### 1. Procedural GLSL Shaders for Sky and Floor

**Decision:** Use `AFRAME.registerShader()` with custom raw GLSL fragment shaders for starfield sky and neon grid floor.

**Rationale:** Texture-based approaches would require loading image assets and lack dynamic animation. Shaders are entirely procedural -- no asset loading, no resolution limits, and the twinkling/scroll animations are trivial in GLSL. A-Frame's shader registration API handles uniform bindings and vertex shader boilerplate.

**Alternatives considered:**
- `<a-sky>` with gradient texture: Static, no animation, requires image asset
- THREE.Points-based starfield: Many draw calls for individual stars; shader approach renders 800+ stars in a single pass
- CSS gradient backgrounds: Not applicable in WebGL/VR context

### 2. MeshPhysicalMaterial with Iridescence for Balls

**Decision:** Upgrade ball material from MeshStandardMaterial to MeshPhysicalMaterial with iridescence, clearcoat, and increased geometry resolution (segmentsWidth=24, segmentsHeight=18).

**Rationale:** MeshPhysicalMaterial is the most physically accurate built-in material in Three.js. Iridescence creates a color-shifting rainbow effect on the ball surface that makes colors visually stunning in VR -- exactly the "premium" look needed for a capstone project. At 12 balls max, the GPU cost is acceptable.

**Alternatives considered:**
- MeshStandardMaterial with envMap: Requires a cube map asset, less visually dramatic than iridescence
- Custom shader: Overkill when MeshPhysicalMaterial's built-in iridescence achieves the goal
- Keep current MeshStandard: Fails the visual upgrade goal entirely

**GPU impact:** MeshPhysicalMaterial is ~20-30% more expensive than MeshStandard. For 12 balls at once, this is well within Quest 2/desktop GPU budget.

### 3. InstancedMesh for Particles

**Decision:** Replace THREE.Points + PointsMaterial with THREE.InstancedMesh for both particle bursts and ambient dust.

**Rationale:** InstancedMesh renders all particles in a single draw call vs. PointsMaterial's per-particle processing. This enables richer visuals (actual sphere geometry, rotation, scale-down animation, trails) at a lower GPU cost than the current system. 48 particles/burst x 6 pool entries = 288 instances in one InstancedMesh. Ambient dust adds 120 more in a second InstancedMesh.

**Alternatives considered:**
- THREE.Points with custom shader: Still limited to point sprites, no rotation or 3D appearance
- Individual mesh entities: 288+ entity overhead would kill VR performance
- Keep current PointsMaterial: Simpler but fewer features (can't do scale-down or trails)

### 4. No Post-Processing EffectComposer

**Decision:** Achieve "glow" effects through emissive materials and semi-transparent glow planes, not post-processing bloom.

**Rationale:** Post-processing requires rendering the entire scene to a render target, then compositing -- expensive for VR at 90Hz. Emissive materials and glow planes achieve a convincing neon look with zero additional render passes.

**Alternatives considered:**
- THREE.EffectComposer with UnrealBloomPass: Heavy VR cost, WebXR compatibility issues
- Scene-level tone mapping (ACESFilmic): Already planned as a lighter alternative
- SSAO pass: Not visually aligned with the neon/cosmic theme

### 5. Scene-Level Tone Mapping

**Decision:** Enable `toneMapping: ACESFilmic` and `toneMappingExposure: 1.2` on the A-Frame renderer.

**Rationale:** ACESFilmic tone mapping crushes blacks and rolls off highlights naturally, making emissive materials pop against dark backgrounds. This single scene-wide setting dramatically improves perceived material quality without any post-processing cost.

### 6. Halo Ring on Color Wheel

**Decision:** Add a third, very faint ring outside the existing outer ring (radius + 0.02, low opacity) to create a subtle glow halo around the color wheel.

**Rationale:** Low-cost visual enhancement using existing ring geometry pattern. A single additional torus with high transparency adds depth perception in VR.

## Risks / Trade-offs

- **Iridescence GPU cost** -- 12 MeshPhysicalMaterial balls may cause frame drops on low-end VR headsets. Mitigation: iridescence is a per-material flag that can be toggled off via config; monitor FPS in Chrome DevTools.
- **InstancedMesh particle limitations** -- InstancedMesh can only render identical geometry. Mitigation: color variation is handled via per-instance color attribute; size variation via dummy matrix scale.
- **ES5-only constraint** -- No arrow functions, let/const, template literals. Mitigation: All new files explicitly use `function()`, `var`, and string concatenation.
- **Shader compatibility** -- WebGL 1.0 devices lack some GLSL features. Mitigation: Shaders target GLSL ES 1.0 (WebGL 1.0) for maximum compatibility; test fallback path.
- **No automated tests** -- All changes are visual. Mitigation: Manual verification checklist defined in tasks.md; console error monitoring during development.
