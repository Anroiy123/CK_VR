# Phase 4: Grab, Drop & Snap-to-Slot

**Priority**: P0 — Core mechanic  
**Status**: `[ ]`  
**Depends on**: Phase 2, Phase 3

## Mô tả
Kết nối custom `grabber` component với slot trên color wheel. Khi bi được thả gần slot đúng → snap vào vị trí, khóa chết bi, phát hiệu ứng. Khi sai → bi quay về kệ. Bao gồm cơ chế respawn khi bi rơi khỏi bàn. **KHÔNG dùng physics engine.**

## Files

| File | Action | Mô tả |
|------|--------|--------|
| `js/snap-to-slot.js` | [NEW] | Component kiểm tra drop + snap logic |
| `js/ball-respawn.js` | [NEW] | Component tự động respawn bi khi rơi (y < -1) |
| `index.html` | [MODIFY] | Thêm script entities |

## Implementation Steps

### 1. Component `snap-to-slot`
Gắn trên mỗi **bi màu**. Khi bi bị drop (event `grab-end` từ custom `grabber` component — xem Phase 3):

```javascript
AFRAME.registerComponent('snap-to-slot', {
  schema: {
    snapDistance: { default: 0.5 },  // Nới rộng hitbox cho VR (forgiving)
  },
  
  init() {
    this.el.addEventListener('grab-end', this.onDrop.bind(this));
  },

  onDrop() {
    const ballColor = this.el.getAttribute('color-ball').colorHex;
    const ballPos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(ballPos);
    const slots = document.querySelectorAll('.color-slot:not(.occupied)');
    
    let closestSlot = null;
    let minDist = Infinity;
    
    slots.forEach(slot => {
      const slotPos = new THREE.Vector3();
      slot.object3D.getWorldPosition(slotPos);
      const dist = ballPos.distanceTo(slotPos);
      
      if (dist < minDist) {
        minDist = dist;
        closestSlot = slot;
      }
    });

    if (closestSlot && minDist < this.data.snapDistance) {
      const targetColor = closestSlot.dataset.targetColor;
      
      if (ballColor === targetColor) {
        this.snapSuccess(closestSlot);
      } else {
        this.snapFail();
      }
    } else {
      this.returnToShelf();
    }
  },

  snapSuccess(slot) {
    const ball = this.el;
    
    // 1. KHÓA CHẾT BI — Xóa grabbable hoàn toàn (không cần physics)
    ball.classList.remove('grabbable', 'interactive');
    ball.removeAttribute('ball-respawn');
    
    // 2. Snap position bi = position slot (world space)
    const slotWorldPos = new THREE.Vector3();
    slot.object3D.getWorldPosition(slotWorldPos);
    ball.setAttribute('position', slotWorldPos);
    
    // 3. Mark slot đã occupied
    slot.classList.add('occupied');
    slot.setAttribute('material', `color: ${ball.getAttribute('color-ball').colorHex}; opacity: 1`);
    
    // 4. Emit event cho game-manager
    ball.sceneEl.emit('color-placed', {
      color: ball.getAttribute('color-ball').colorHex,
      position: slotWorldPos,
      slotId: slot.id,
    });
    
    // 5. Sound + particle (handled by listeners)
    SoundManager.play('correct');
    ParticlePool.burst(slotWorldPos, ball.getAttribute('color-ball').colorHex);
  },

  snapFail() {
    SoundManager.play('wrong');
    
    // Bi rung lắc animation
    this.el.setAttribute('animation', {
      property: 'position',
      dur: 200,
      dir: 'alternate',
      loop: 3,
      to: { x: this.el.object3D.position.x + 0.05 },
      easing: 'easeInOutQuad',
    });
    
    setTimeout(() => this.returnToShelf(), 700);
  },

  returnToShelf() {
    const shelfPos = this.el.getAttribute('color-ball').originalPosition;
    this.el.setAttribute('position', shelfPos);
  }
});
```

### 2. Component `ball-respawn` — Chống rớt bi khỏi bàn

> **QUAN TRỌNG**: Nếu bi rơi xuống y < -1, tự động teleport về kệ.

```javascript
AFRAME.registerComponent('ball-respawn', {
  schema: {
    minY: { default: -1 },           // Ngưỡng rơi (dưới sàn)
    checkInterval: { default: 500 },  // ms giữa mỗi lần check (throttle)
  },

  init() {
    this.lastCheck = 0;
  },

  tick(time) {
    if (time - this.lastCheck < this.data.checkInterval) return;
    this.lastCheck = time;

    const pos = this.el.object3D.position;
    if (pos.y < this.data.minY) {
      const originalPos = this.el.getAttribute('color-ball').originalPosition;
      
      this.el.setAttribute('position', originalPos);
    }
  }
});
```

### 3. Forgiving Hitboxes — Vùng va chạm khoan dung

> Slot collider to hơn slot visual để VR grab dễ hơn.

```javascript
// Trong color-wheel.js khi tạo slot:
const slotVisual = document.createElement('a-entity');
slotVisual.setAttribute('geometry', 'primitive: cylinder; radius: 0.15; height: 0.05');
slotVisual.setAttribute('material', 'color: #666; opacity: 0.5; transparent: true');

// Invisible hitbox LỚN HƠN cho snap detection
// snapDistance trong snap-to-slot đã set 0.5 (thay vì 0.4)
// Đảm bảo vùng nhận diện ~3x kích thước visual
```

### 4. Desktop Fallback
> Xem `desktop-grabber` component tại **Phase 3** (`js/grabber.js`). Click bi → highlight → click slot → place. Không duplicate code ở đây.

### 5. Tối ưu
- Chỉ tính distance khi drop event, KHÔNG mỗi frame
- Cache slot positions khi level init
- `ball-respawn` tick throttle 500ms (không mỗi frame)
- Dùng squared distance để tránh sqrt nếu cần

## Success Criteria
- [ ] Grab bi bằng VR controller → bi theo tay
- [ ] Thả bi gần slot đúng → snap vào, đổi màu, bi bị KHÓA (không grab lại được)
- [ ] Thả bi gần slot sai → bi rung, quay về kệ
- [ ] Thả bi xa tất cả slot → bi rơi hoặc quay về kệ
- [ ] Bi rơi khỏi bàn (y < -1) → tự động respawn về kệ
- [ ] Desktop: Click bi → click slot → tương tác tương tự
- [ ] Hitbox đủ khoan dung cho VR (snapDistance: 0.5)
