# Phase 1: Project Setup

**Priority**: P0 — Nền tảng  
**Status**: `[ ]`

## Mô tả
Tạo cấu trúc thư mục dự án, setup A-Frame scene cơ bản. **KHÔNG dùng physics engine hay super-hands** — thay bằng custom grab/drop component tự viết.

## Files tạo mới

| File | Action | Mô tả |
|------|--------|--------|
| `index.html` | [NEW] | Entry point, A-Frame scene |
| `css/styles.css` | [NEW] | Minimal pre-VR styling |
| `js/color-data.js` | [NEW] | Data 12 màu: tên, hex, góc, level, theory |

## CDN Dependencies (Chỉ 3 thư viện)

```html
<!-- A-Frame core -->
<script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>

<!-- Extras (movement controls) -->
<script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.6.0/dist/aframe-extras.min.js"></script>

<!-- Howler.js (Sound) -->
<script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
```

> **ĐÃ LOẠI BỎ:**
> - ~~aframe-physics-system~~ — archived May 2024, broken với A-Frame 1.6+
> - ~~super-hands~~ — conflict `grabbable` component với A-Frame 1.5+
> - ~~aframe-particle-system~~ — tự viết particle nhẹ hơn bằng THREE.Points

> **A-Frame 1.6.0** thay vì 1.7.1 — version ổn định hơn, tương thích tốt hơn với aframe-extras.

## Implementation Steps

### 1. Tạo `index.html`
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VR Color Circle</title>
  
  <!-- A-Frame + Extras -->
  <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.6.0/dist/aframe-extras.min.js"></script>
  
  <!-- Howler.js -->
  <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js"></script>
  
  <!-- Game scripts (loaded in order) -->
  <script src="js/color-data.js"></script>
  <script src="js/grabber.js"></script>
  <script src="js/color-wheel.js"></script>
  <script src="js/color-ball.js"></script>
  <script src="js/shelf.js"></script>
  <script src="js/snap-to-slot.js"></script>
  <script src="js/ball-respawn.js"></script>
  <script src="js/particle-pool.js"></script>
  <script src="js/sound-manager.js"></script>
  <script src="js/timer.js"></script>
  <script src="js/game-manager.js"></script>
  <script src="js/vr-button.js"></script>
  <script src="js/ui-manager.js"></script>
  <script src="js/leaderboard.js"></script>
  <script src="js/tooltip.js"></script>
  <script src="js/free-play.js"></script>
  
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <a-scene background="color: #1a1a2e"
           renderer="antialias: true; colorManagement: true"
           vr-mode-ui="enabled: true">
    
    <!-- Asset preload -->
    <a-assets timeout="10000">
      <!-- Sounds preloaded by Howler.js separately -->
    </a-assets>
    
    <!-- Lighting (NO shadows) -->
    <a-light type="ambient" color="#BBB" intensity="0.6"></a-light>
    <a-light type="directional" color="#FFF" intensity="0.5"
             position="1 3 2"></a-light>
    
    <!-- Sky -->
    <a-sky color="#16213e"></a-sky>
    
    <!-- Ground -->
    <a-plane rotation="-90 0 0" width="20" height="20" 
             color="#0f3460" material="shader: flat"></a-plane>
    
    <!-- Camera rig -->
    <a-entity id="rig" movement-controls="fly: false" position="0 0 0">
      <a-entity id="camera" camera position="0 1.6 0" look-controls>
        <a-entity cursor="rayOrigin: mouse; fuse: false"
                  raycaster="objects: .interactive; far: 10"
                  position="0 0 -0.5"
                  geometry="primitive: ring; radiusInner: 0.005; radiusOuter: 0.008"
                  material="color: #FFF; shader: flat"></a-entity>
      </a-entity>
    </a-entity>
    
    <!-- VR Controllers with custom grabber -->
    <a-entity id="left-hand"
              laser-controls="hand: left"
              raycaster="objects: .interactive; far: 10"
              grabber>
    </a-entity>
    
    <a-entity id="right-hand"
              laser-controls="hand: right"
              raycaster="objects: .interactive; far: 10"
              grabber>
    </a-entity>
    
    <!-- Game entities (populated by JS) -->
    <a-entity id="color-wheel"></a-entity>
    <a-entity id="shelf"></a-entity>
    <a-entity id="balls-container"></a-entity>
    
    <!-- UI panels (populated by JS) -->
    <a-entity id="ui-container"></a-entity>
    
    <!-- Particle pool (pre-allocated) -->
    <a-entity id="particle-pool"></a-entity>
    
  </a-scene>
</body>
</html>
```

### 2. Tạo `css/styles.css`
```css
/* Minimal — chỉ cho loading state trước khi A-Frame render */
body { margin: 0; overflow: hidden; }
```

### 3. Tạo `js/color-data.js`
```javascript
const COLOR_DATA = {
  primary: [
    { name: 'Red', hex: '#FF0000', angle: 0 },
    { name: 'Yellow', hex: '#FFFF00', angle: 120 },
    { name: 'Blue', hex: '#0000FF', angle: 240 },
  ],
  secondary: [
    { name: 'Orange', hex: '#FF8000', angle: 60 },
    { name: 'Green', hex: '#00FF00', angle: 180 },
    { name: 'Purple', hex: '#8000FF', angle: 300 },
  ],
  tertiary: [
    { name: 'Red-Orange', hex: '#FF4000', angle: 30 },
    { name: 'Yellow-Orange', hex: '#FFBF00', angle: 90 },
    { name: 'Yellow-Green', hex: '#80FF00', angle: 150 },
    { name: 'Blue-Green', hex: '#00FF80', angle: 210 },
    { name: 'Blue-Purple', hex: '#0040FF', angle: 270 },
    { name: 'Red-Purple', hex: '#FF0080', angle: 330 },
  ]
};

const COLOR_THEORY = {
  '#FF0000': { type: 'Primary', theory: 'Mau co ban, khong pha tron' },
  '#FFFF00': { type: 'Primary', theory: 'Mau co ban, khong pha tron' },
  '#0000FF': { type: 'Primary', theory: 'Mau co ban, khong pha tron' },
  '#FF8000': { type: 'Secondary', theory: 'Red + Yellow = Orange' },
  '#00FF00': { type: 'Secondary', theory: 'Yellow + Blue = Green' },
  '#8000FF': { type: 'Secondary', theory: 'Red + Blue = Purple' },
  '#FF4000': { type: 'Tertiary', theory: 'Red + Orange = Red-Orange' },
  '#FFBF00': { type: 'Tertiary', theory: 'Yellow + Orange = Yellow-Orange' },
  '#80FF00': { type: 'Tertiary', theory: 'Yellow + Green = Yellow-Green' },
  '#00FF80': { type: 'Tertiary', theory: 'Blue + Green = Blue-Green' },
  '#0040FF': { type: 'Tertiary', theory: 'Blue + Purple = Blue-Purple' },
  '#FF0080': { type: 'Tertiary', theory: 'Red + Purple = Red-Purple' },
};

const LEVEL_CONFIG = {
  1: { colors: 'primary', timer: 30, label: 'Primary Colors' },
  2: { colors: 'secondary', timer: 25, label: 'Secondary Colors' },
  3: { colors: 'tertiary', timer: 45, label: 'Tertiary Colors' },
};
```

## Success Criteria
- [ ] Mở `index.html` qua local server → scene 3D render (sky + ground + lighting)
- [ ] Mouse look-around + cursor ring hiện
- [ ] Console: KHÔNG có lỗi CDN, KHÔNG có lỗi component
- [ ] VR button hiện ở góc dưới phải
- [ ] Laser controllers hiện khi vào VR mode
- [ ] `grabber` component registered (chưa cần hoạt động)
