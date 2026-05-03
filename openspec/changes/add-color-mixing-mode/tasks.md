## 1. Data Layer - Recipes & Config

- [ ] 1.1 Add White color definition to color-data.js (hex #FFFFFF, type "Base", targetSlot "center")
- [ ] 1.2 Add MIXING_RECIPES object to color-data.js (3 secondary + 6 tertiary recipes)
- [ ] 1.3 Add TINT_VARIANTS array (12 tints with hex, angle, type="Tint", parent hex reference)
- [ ] 1.4 Add TINT_BY_PARENT lookup map for fast tint resolution
- [ ] 1.5 Add MIX_LEVEL_CONFIG for 6 mixing levels with exact target color lists
- [ ] 1.6 Add helper function `getMixingRecipe(hex1, hex2)` — order-independent recipe lookup, returns result hex or null
- [ ] 1.7 Add helper function `getTintForColor(hex)` — returns tint hex or null

## 2. Color Wheel - Inner Ring & White Center

- [ ] 2.1 Extend color-wheel component to render inner tint ring (12 slots at ~0.58 radius, shared angles)
- [ ] 2.2 Add white center slot rendering at wheel origin (0,0)
- [ ] 2.3 Add `prepareMixingLevel(level)` method — show/hide slots per MIX_LEVEL_CONFIG targets
- [ ] 2.4 Style inner ring sectors with lighter tint colors and softer emissive
- [ ] 2.5 Style center slot with white circular indicator and subtle glow
- [ ] 2.6 Dim/hide inner ring when level does not require tints (levels 1-2)

## 3. Mixing Station Component

- [ ] 3.1 Create js/mixing-station.js with AFRAME.registerComponent('mixing-station')
- [ ] 3.2 Build station 3D geometry (input cup, output platform, base structure, purple metallic theme)
- [ ] 3.3 Implement state machine: EMPTY → HOLDING_BALL1 → RESULT_READY
- [ ] 3.4 Implement ball hold logic: source ball removed from shelf, displayed above station
- [ ] 3.5 Implement cancel HOLDING_BALL1: grab held ball → return to player hand, station → EMPTY
- [ ] 3.6 Implement merge logic: blend 2 source balls via MIXING_RECIPES, return sources to shelf, produce result
- [ ] 3.7 Implement merge always produces result: valid recipe → recipe color; no match → waste ball (#8B7355, isWaste=true)
- [ ] 3.8 Handle White ball in HOLDING_BALL1: White + Color → tint of Color (tint shortcut in single step)
- [ ] 3.9 Handle White ball in RESULT_READY: non-tinted result → replace with tint; already-tinted → no change
- [ ] 3.10 Block non-White input while RESULT_READY (player must clear result first)
- [ ] 3.11 Emit 'mix-result' event with payload { ball, isWaste: bool }
- [ ] 3.12 Visual states: blue pulse EMPTY, brighter blue + ball HOLDING, particle burst + gold glow RESULT, dull red flash WASTE
- [ ] 3.13 Add mixing-station entity to index.html and script include

## 4. Game Manager - Mixing Mode Logic

- [ ] 4.1 Add `startMixingGame()` method to GameManager
- [ ] 4.2 Add `initMixingLevel(level)` method with mixing-specific setup (initial shelf: R,Y,B,White)
- [ ] 4.2a In initMixingLevel(), for levels 5-6 ensure Primary ball outer ring slots are valid snap targets (direct placement without mixing)
- [ ] 4.3 Implement shelf slot tracking (mixingShelfUsed counter, max 10, initial value = 4)
- [ ] 4.4 Handle 'mix-result' event: if isWaste=false → enable wheel placement; always consume 1 shelf slot when result lands on shelf
- [ ] 4.5 Decrement shelf counter when a non-waste ball from shelf is successfully placed on wheel
- [ ] 4.6 Reject waste ball placement on wheel (wheel rejects, ball stays on shelf)
- [ ] 4.7 Implement mixing mode level completion and victory logic
- [ ] 4.8 Wire timer for mixing mode (reuse Timer module)
- [ ] 4.9 Handle game over: shelf full (10/10) + any wheel slots remaining → 3s warning → TIME_UP
- [ ] 4.10 Add 'back-to-menu' cleanup for mixing mode (clear station, reset shelf counter, clear balls)

## 5. UI Updates

- [ ] 5.1 Add MIX button to menu-panel in index.html (purple #7950f2 theme)
- [ ] 5.2 Add mixing hint panel entity in index.html (billboard, near mixing station)
- [ ] 5.3 Add shelf slot counter text entity on/near shelf
- [ ] 5.4 Update UIManager to handle mix button events and hint panel display
- [ ] 5.5 Implement hint display logic: full hints (L1), partial (L2-3), hidden (L4-6)
- [ ] 5.6 Add shelf counter update method in UIManager (green, yellow at 8, red at 9-10)

## 6. Shelf Updates

- [ ] 6.1 Update shelf component to show slot counter text
- [ ] 6.2 Add visual warning when shelf nearly full (>=8/10 slots used)
- [ ] 6.3 Ensure shelf snap positions work for both initial balls and mixed result balls
- [ ] 6.4 Frees slot when ball is successfully placed on wheel from shelf

## 7. Testing & Polish

- [ ] 7.1 Desktop test: complete mixing mode flow through all 6 levels
- [ ] 7.2 Desktop test: verify White + Color tint shortcut in single step (HOLDING_BALL1)
- [ ] 7.3 Desktop test: verify White → RESULT_READY tint conversion
- [ ] 7.4 Desktop test: verify cancel HOLDING_BALL1 (grab held ball back)
- [ ] 7.5 Desktop test: shelf full scenario (intentionally create waste balls up to 10/10)
- [ ] 7.6 Desktop test: shelf counter decreases when ball placed on wheel from shelf
- [ ] 7.7 Desktop test: waste ball rejected by wheel
- [ ] 7.8 Desktop test: timer expiry scenario
- [ ] 7.9 Desktop test: verify hint progression across levels
- [ ] 7.10 VR test: mixing station reachability and snap distances
- [ ] 7.11 Verify no regression in Easy/Hard/Free Play modes
- [ ] 7.12 Performance check: 60 FPS maintained with inner ring + mixing station
