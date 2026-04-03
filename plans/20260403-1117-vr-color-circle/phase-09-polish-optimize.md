# Phase 9: Polish & Optimize

**Priority**: P1 — Đánh giá cao  
**Status**: `[ ]`  
**Depends on**: Phase 8

## Mô tả
Tối ưu hiệu năng, đánh bóng mỹ thuật, đảm bảo chạy mượt trên VR headset. **Không dùng real-time shadows** — dùng baked textures thay thế.

## Checklist tối ưu

### Performance (VR-critical)
- [ ] Giảm polygon count: `segments` thấp cho sphere (16 thay vì 32), torus (24,12)
- [ ] ParticlePool object pooling (đã implement Phase 6)
- [ ] Throttle collision detection (100ms intervals)
- [ ] Lazy load sounds: chỉ load khi cần
- [ ] Asset preloading qua `<a-assets>` **với timeout**
- [ ] Ball-respawn tick throttle 500ms (đã implement Phase 4)
- [ ] Stats panel kiểm tra FPS: `<a-scene stats>` (chỉ khi dev)

### Shadows — KHÔNG dùng real-time shadows

> **QUAN TRỌNG**: Real-time shadows trên WebVR cực kỳ tốn GPU, đặc biệt Meta Quest. Các thiết bị mobile VR không đủ khả năng render shadow maps ở 72FPS stereo.

**Thay thế:**
- [ ] **Tắt** hoàn toàn `<a-scene shadow="type: none">` hoặc không set shadow
- [ ] **Fake shadows** cho kệ bàn: dùng `a-plane` tối opacity thấp đặt dưới chân bàn
- [ ] **Emissive glow** cho ring thay vì cần light + shadow
- [ ] Sử dụng **flat shading** (`material="shader: flat"`) cho UI panels
- [ ] Ambient light + 1 directional light (KHÔNG cast shadow)

```html
<!-- Lighting setup tối ưu VR -->
<a-light type="ambient" color="#BBB" intensity="0.6"></a-light>
<a-light type="directional" color="#FFF" intensity="0.5"
         position="1 3 2" castShadow="false"></a-light>
```

### Mỹ thuật (không tốn performance)
- [ ] Gradient sky background: dùng `a-sky` với gradient texture (baked image)
- [ ] Glow effect trên ring: `material="emissive: #4400FF; emissiveIntensity: 0.3"`
- [ ] Smooth animations cho snap (position lerp), level transition (fade)
- [ ] Color-matched environment: warm tones nền, cool tones ring
- [ ] Bi có subtle sheen: `metalness: 0.3; roughness: 0.5`
- [ ] Particle variety: confetti cho đúng (colorful), flash cho sai (red)

### VR Comfort
- [ ] Không auto-move camera (gây motion sickness)
- [ ] Khoảng cách thoải mái: ring ở 2-3m, kệ ở 1-1.5m
- [ ] Contrasting colors: slot trống = xám mờ, slot đầy = màu rực
- [ ] Text đủ lớn: `width >= 1.5` cho text quan trọng
- [ ] UI panels gắn `look-at="[camera]"` (billboard)
- [ ] Smooth fade transitions (không chớp nhoáng)

### Desktop Compatibility
- [ ] Mouse click fallback cho grab/drop (desktop-grab component)
- [ ] Cursor raycaster `.interactive` class
- [ ] Touch support cho mobile browser (cursor fuse)
- [ ] VR entry button visible

## Testing Checklist

### Browser Testing
- [ ] Chrome desktop: scene render, click interact
- [ ] Firefox desktop: tương tự
- [ ] Mobile Chrome: touch, gyroscope look-around
- [ ] Quest Browser: VR mode, hand controllers

### Gameplay Testing
- [ ] Full run Easy mode: Level 1 → 2 → 3 → Victory
- [ ] Full run Hard mode: Complete + Time-up scenarios
- [ ] Free Play: All 12 colors
- [ ] Leaderboard: Scores persist after reload
- [ ] Edge case: Drop bi ở boundary → respawn
- [ ] Edge case: Grab 2 bi bằng 2 tay cùng lúc → crash test
- [ ] Edge case: Rapid grab/drop liên tục
- [ ] Edge case: Đi xuyên bàn (anti-clipping) — controller vẫn detect collision
- [ ] Edge case: Đập 2 bi vào nhau → physics stable
- [ ] Edge case: Bi rơi khỏi scene (y < -1) → respawn
- [ ] Edge case: Tất cả slots occupied + thả bi → graceful handle

### Performance Verification
- [ ] FPS >= 60 trên desktop
- [ ] FPS >= 72 trên Quest (nếu có)
- [ ] Không có GC spikes (check DevTools Performance tab)
- [ ] Particle burst không gây frame drop

## Success Criteria
- [ ] FPS >= 60 desktop, >= 72 Quest
- [ ] Không có console errors
- [ ] Tất cả sounds play đúng timing
- [ ] Visuals trông polished — gradient sky, glow ring, smooth animations
- [ ] Không có real-time shadows (đã tắt)
- [ ] Edge cases handled gracefully
