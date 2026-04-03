# Phase 2: Color Wheel & Slots

**Priority**: P0 — Core gameplay element  
**Status**: `[ ]`  
**Depends on**: Phase 1

## Mô tả
Tạo vòng tròn màu 3D dạng floating ring lơ lửng, chứa 12 slot vị trí xếp theo góc 30° mỗi slot. Ring nghiêng ~15° về phía người chơi.

## Files

| File | Action | Mô tả |
|------|--------|--------|
| `js/color-wheel.js` | [NEW] | A-Frame component: `color-wheel` |
| `index.html` | [MODIFY] | Thêm `<script>` và entity `color-wheel` |

## Kiến trúc

```
            Color Wheel (a-entity #color-wheel)
            ├── Ring visual (a-torus) — viền trang trí
            ├── Slot containers (12x a-entity .color-slot)
            │   ├── Slot 0°: id="slot-0"     (Red)
            │   ├── Slot 30°: id="slot-30"    (Red-Orange)
            │   ├── Slot 60°: id="slot-60"    (Orange)
            │   ├── ...
            │   └── Slot 330°: id="slot-330"  (Red-Purple)
            └── Center label (a-text) — "Color Wheel"
```

## Implementation Steps

### 1. Component `color-wheel`
```javascript
AFRAME.registerComponent('color-wheel', {
  schema: {
    radius: { type: 'number', default: 2.5 },
    level: { type: 'number', default: 1 },
  },
  
  init() {
    this.createRing();
    this.createSlots();
  },

  createRing() {
    // Torus viền trang trí
    // radius: this.data.radius
    // radiusTubular: 0.03
    // color: #FFFFFF, opacity: 0.3
  },

  createSlots() {
    // Lặp qua COLOR_DATA theo level hiện tại
    // Tính vị trí mỗi slot: x = r*cos(angle), z = r*sin(angle)
    // Tạo a-cylinder nhỏ (slot marker) tại mỗi vị trí
    // Thêm class .color-slot và data attribute target-color
    // Slot trống ban đầu = xám/trong suốt
    // Thêm a-text hiện tên màu phía dưới slot
  }
});
```

### 2. Tính vị trí trên ring
```javascript
// Công thức cho 12 vị trí quanh ring
function getSlotPosition(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: radius * Math.sin(rad),
    y: 0,
    z: -radius * Math.cos(rad)  // -z = hướng về phía người chơi
  };
}
```

### 3. Slot entity structure
```html
<!-- Mỗi slot = 1 cylinder nhỏ tại vị trí trên ring -->
<a-entity class="color-slot interactive"
          id="slot-0"
          data-target-color="#FF0000"
          data-target-name="Red"
          data-angle="0"
          geometry="primitive: cylinder; radius: 0.15; height: 0.05"
          material="color: #666; opacity: 0.5; transparent: true"
          position="0 0 -2.5">
  <!-- Label text bên dưới -->
  <a-text value="?" position="0 -0.15 0" align="center" color="#fff" width="1.5"></a-text>
</a-entity>
```

### 4. Đặt wheel vào scene
```html
<a-entity id="color-wheel"
          color-wheel="radius: 2.5; level: 1"
          position="0 1.8 -3"
          rotation="-15 0 0">
</a-entity>
```

### 5. Level visibility
- Level 1: Chỉ hiện 3 slot tại 0°, 120°, 240° (Primary)
- Level 2: Hiện thêm 3 slot tại 60°, 180°, 300° (Secondary) + giữ Primary đã hoàn thành
- Level 3: Hiện thêm 6 slot (Tertiary) + giữ toàn bộ đã hoàn thành

## Success Criteria
- [ ] Ring 3D torus hiện lơ lửng phía trước người chơi
- [ ] 3 slot marker hiện cho Level 1 (đúng vị trí góc 0°, 120°, 240°)
- [ ] Mỗi slot có "?" label bên dưới
- [ ] Ring nghiêng 15° nhìn tự nhiên
