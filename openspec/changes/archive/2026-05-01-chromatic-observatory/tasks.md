## 1. Procedural Starfield Sky (Phase 1 - Environment)

- [x] 1.1 Create `js/starfield-sky.js` with `AFRAME.registerShader('starfield', ...)` using raw GLSL fragment shader that generates ~800 procedural stars via hash function
- [x] 1.2 Implement vertical background gradient in starfield shader: deep purple (#0a0015) at bottom to dark blue-black (#050d1a) at top
- [x] 1.3 Add `time` uniform to starfield shader for twinkling star animation
- [x] 1.4 Create `starfield-animator` A-Frame component that updates `time` uniform each tick
- [x] 1.5 Target GLSL ES 1.0 for WebGL 1.0 compatibility ← (verify: starfield renders in both WebGL 1.0 and 2.0 browsers, no shader compile errors)

## 2. Neon Grid Floor (Phase 1 - Environment)

- [x] 2.1 Create `js/grid-floor.js` with `AFRAME.registerShader('neon-grid', ...)` using GLSL fragment shader for neon blue (#4dabf7) grid pattern
- [x] 2.2 Add scroll animation to grid shader via `time` uniform, creating slow horizontal/vertical drift
- [x] 2.3 Implement edge fade in grid shader: grid opacity goes to 0 near plane boundaries
- [x] 2.4 Create `grid-animator` A-Frame component that updates `time` uniform each tick ← (verify: grid renders with scroll animation, no sharp cut-off edges)

## 3. Shader-Based Ambient Particles (Phase 1 - Environment)

- [x] 3.1 Create `js/ambient-particles.js` with A-Frame component that creates ONE `THREE.InstancedMesh` with 120 sphere instances (radius 0.008, MeshBasicMaterial, white/light-blue)
- [x] 3.2 Assign random opacity (0.3-0.6) and random initial positions within 4x3x4 bounding box to each instance
- [x] 3.3 Implement tick animation: sinusoidal vertical drift (sine wave per particle), gentle Y-axis rotation for each instance
- [x] 3.4 Ensure InstancedMesh uses a single draw call for all 120 instances ← (verify: 120 dust particles visible floating around play area, single draw call confirmed in DevTools)

## 4. Upgrade Lighting and Scene Setup (Phase 1 - Environment)

- [x] 4.1 Replace `<a-sky>` in `index.html` with `<a-sphere>` using `material="shader: starfield"` plus `starfield-animator` component
- [x] 4.2 Replace floor `<a-plane>` material with `shader: neon-grid` plus `grid-animator` component
- [x] 4.3 Upgrade ambient light: `color="#b8c4ff"`, `intensity="0.85"`
- [x] 4.4 Increase directional light intensity to 0.65
- [x] 4.5 Add point light: `color="#9775fa"`, positioned above color wheel area for focal highlight
- [x] 4.6 Add script tags for `js/starfield-sky.js`, `js/grid-floor.js`, `js/ambient-particles.js` in correct load order
- [x] 4.7 Add `<a-entity ambient-particles>` to scene
- [x] 4.8 Configure renderer: `toneMapping: ACESFilmic; toneMappingExposure: 1.2` ← (verify: scene renders with correct lighting, no console errors, ACESFilmic tone mapping active)

## 5. Material Upgrade: Color Balls (Phase 2 - Materials)

- [x] 5.1 Increase ball geometry segments: `segmentsWidth: 24`, `segmentsHeight: 18`
- [x] 5.2 In `init()`, add mesh traversal: find the mesh and upgrade material to `THREE.MeshPhysicalMaterial` with iridescence properties (iridescence=0.8, iridescenceIOR=1.3, iridescenceThicknessRange=[300,500])
- [x] 5.3 Set metalness=0.45, roughness=0.28, clearcoat=0.4, clearcoatRoughness=0.15
- [x] 5.4 Increase hover emissiveIntensity to 0.4, grab emissiveIntensity to 0.55 ← (verify: balls show iridescent color shift at different viewing angles, hover/grab emissive works)

## 6. Material Upgrade: Color Wheel (Phase 2 - Materials)

- [x] 6.1 Increase outer ring emissiveIntensity to 0.45, inner ring to 0.35
- [x] 6.2 Add third "halo" ring: outer radius + 0.02, radius-tubular=0.015, opacity=0.08-0.12, weak emissive
- [x] 6.3 In `createSectorEntity()`, replace `MeshBasicMaterial` with `THREE.MeshStandardMaterial` for sector segments
- [x] 6.4 In `getActiveLayerStyle()`, add emissive=fillColor at intensity 0.15, increase opacity toward 1.0
- [x] 6.5 In `setSlotState()`, apply emissive to sector vis materials when occupied ← (verify: wheel rings glow, halo ring visible, active sectors have depth and emissive glow)

## 7. Material Upgrade: Shelf (Phase 2 - Materials)

- [x] 7.1 Upgrade shelf top material to MeshStandardMaterial with metalness=0.6, roughness=0.35, emissive=#1a2744
- [x] 7.2 Add emissive to frame: emissive=#3b5bdb, intensity=0.12
- [x] 7.3 Add emissive to legs: emissive=#2b4578
- [x] 7.4 Add underglow: thin `<a-plane>` below shelf top with emissive=#4dabf7, opacity=0.15 ← (verify: shelf has visible emissive accents, underglow strip renders below top surface)

## 8. Particle Pool InstancedMesh Rewrite (Phase 3 - VFX)

- [x] 8.1 Rewrite `ParticlePool` to use single `THREE.InstancedMesh` with `SphereGeometry(0.018, 6, 4)` and `MeshBasicMaterial` for all pool entries
- [x] 8.2 Increase burst count to 48 particles per burst (poolSize stays 6)
- [x] 8.3 Implement radial velocity initialization (particles burst outward from origin)
- [x] 8.4 Implement scale-down animation: each particle scales from radius 0.018 to 0.005 over duration
- [x] 8.5 Add spin rotation per particle via dummy matrix transform
- [x] 8.6 Implement trail effect: retain 3 previous frame positions per particle, render 3 ghost instances with decreasing scale
- [x] 8.7 Ensure InstancedMesh uses single draw call for all active particles
- [x] 8.8 Remove old THREE.Points code and any orphaned entities ← (verify: correct placement triggers 48-particle burst with trails and scale-down, single draw call in DevTools)

## 9. UI Panel Glow Borders (Phase 4 - UI Polish)

- [x] 9.1 Change menu panel background color to `#080e1f`
- [x] 9.2 Add glow border plane behind menu panel (0.08 larger per side), emissive=#4dabf7, opacity=0.2
- [x] 9.3 Add glow border plane behind leaderboard panel with theme-matched emissive color, opacity 0.08-0.12
- [x] 9.4 Add glow border plane behind victory panel
- [x] 9.5 Add glow border plane behind gameover panel
- [x] 9.6 Add glow border plane behind freeplay panel
- [x] 9.7 Add glow border plane behind status panel
- [x] 9.8 Update title to use Exo2Bold font with increased width ← (verify: all panels have glow borders visible, menu panel uses #080e1f background)

## 10. VR Button Glow and Hover Enhancement (Phase 4 - UI Polish)

- [x] 10.1 Add glow plane behind each VR button (0.06 larger per side), emissive=bgColor, opacity=0.12
- [x] 10.2 Increase hover scale from 1.04 to 1.08
- [x] 10.3 On hover: increase glow plane opacity to 0.25
- [x] 10.4 On hover: start pulse animation on glow plane (opacity cycles 0.12 to 0.22, duration 800ms)
- [x] 10.5 On leave: stop pulse animation, reset glow plane opacity to 0.12, reset scale ← (verify: buttons have visible glow, hover animates scale and glow pulse, leave resets correctly)

## 11. CSS Background and Final Polish (Phase 5 - Polish)

- [x] 11.1 Update `css/styles.css` background gradient to match new cosmic observatory theme (deeper purples/blacks)
- [x] 11.2 Test full scene loads without console errors: open index.html in Chrome, verify no JS/shader errors
- [x] 11.3 Verify all new script tags load in correct order: starfield-sky.js, grid-floor.js, ambient-particles.js before other game scripts
- [x] 11.4 Verify renderer settings (ACESFilmic tone mapping, exposure) take effect ← (verify: no console errors, all assets load, renderer uses ACESFilmic)
