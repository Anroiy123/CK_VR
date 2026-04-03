# Phase 3: Color Balls, Shelf & Custom Grabber

**Priority**: P0 — Core gameplay element  
**Status**: `[ ]`  
**Depends on**: Phase 1

## Mô tả
Tạo bi màu + kệ bàn + **custom `grabber` component** thay thế super-hands + physics. Dùng `object3D.attach()` cho grab, raycaster cho detection. Zero external dependencies.

## Files

| File | Action | Mô tả |
|------|--------|--------|
| `js/grabber.js` | [NEW] | Custom grab/drop component (thay super-hands + physics) |
| `js/color-ball.js` | [NEW] | Component `color-ball` |
| `js/shelf.js` | [NEW] | Component `color-shelf` |
| `index.html` | [MODIFY] | Thêm entities |

## Kiến trúc Tương tác (KHÔNG physics engine)

```
  ┌─────────────────────────────────────────────────────┐
  │                Custom Grab System                    │
  │                                                     │
  │  Raycaster ──▶ Detect .interactive ──▶ Highlight    │
  │      │                                               │
  │      ▼                                               │
  │  Trigger/Click ──▶ object3D.attach(ball) ──▶ GRAB   │
  │      │                                               │
  │      ▼                                               │
  │  Release ──▶ scene.attach(ball) ──▶ DROP             │
  │      │                                               │
  │      ▼                                               │
  │  snap-to-slot kiểm tra vị trí ──▶ Snap hoặc Return  │
  └─────────────────────────────────────────────────────┘
```

**Ưu điểm so với super-hands + physics:**
- Zero external dependencies (không CDN thêm)
- Không conflict `grabbable` component
- Không Cannon.js overhead → nhẹ hơn ~200KB
- Hoạt động chắc chắn với A-Frame 1.6.0
- Code dễ debug hơn

## Implementation Steps

### 1. Component `grabber` — Thay thế super-hands

```javascript
AFRAME.registerComponent('grabber', {
  init() {
    this.grabbed = null;
    this.originalParent = null;
    
    // VR: grip button
    this.el.addEventListener('gripdown', () => this.tryGrab());
    this.el.addEventListener('gripup', () => this.tryDrop());
    
    // VR: trigger button (alternative)
    this.el.addEventListener('triggerdown', () => this.tryGrab());
    this.el.addEventListener('triggerup', () => this.tryDrop());
  },
  
  tryGrab() {
    if (this.grabbed) return;
    
    const raycaster = this.el.components.raycaster;
    if (!raycaster) return;
    
    const intersections = raycaster.intersectedEls;
    if (intersections.length === 0) return;
    
    // Tìm entity đầu tiên có class .grabbable
    const target = intersections.find(el => el.classList.contains('grabbable'));
    if (!target) return;
    
    this.grabbed = target;
    this.originalParent = target.object3D.parent;
    
    // Attach bi vào controller (bi sẽ follow tay)
    this.el.object3D.attach(target.object3D);
    
    // Emit event
    target.emit('grab-start');
    SoundManager.play('grab');
  },
  
  tryDrop() {
    if (!this.grabbed) return;
    
    // Detach bi khỏi controller, trả về scene root
    this.el.sceneEl.object3D.attach(this.grabbed.object3D);
    
    // Emit event (snap-to-slot sẽ lắng nghe)
    this.grabbed.emit('grab-end');
    
    this.grabbed = null;
  },
});
```

### 2. Component `desktop-grabber` — Cho mouse/touch

```javascript
AFRAME.registerComponent('desktop-grabber', {
  init() {
    this.selectedBall = null;
    
    // Click vào bi → select (highlight)
    // Click vào slot → place
    // Click vào empty → deselect
    
    this.el.sceneEl.addEventListener('click', (evt) => {
      const target = evt.detail?.intersection?.object?.el || evt.target;
      
      if (!this.selectedBall && target?.classList.contains('grabbable')) {
        this.selectBall(target);
      } else if (this.selectedBall && target?.classList.contains('color-slot')) {
        this.placeOnSlot(target);
      } else {
        this.deselectBall();
      }
    });
  },
  
  selectBall(ball) {
    this.selectedBall = ball;
    ball.setAttribute('material', 'emissive', '#FFF');
    ball.setAttribute('material', 'emissiveIntensity', 0.3);
  },
  
  placeOnSlot(slot) {
    if (!this.selectedBall) return;
    const ball = this.selectedBall;
    
    // Di chuyển bi đến slot position
    const slotPos = new THREE.Vector3();
    slot.object3D.getWorldPosition(slotPos);
    ball.object3D.position.copy(slotPos);
    
    // Emit grab-end để snap-to-slot xử lý check đúng/sai
    ball.emit('grab-end');
    this.deselectBall();
  },
  
  deselectBall() {
    if (this.selectedBall) {
      this.selectedBall.setAttribute('material', 'emissiveIntensity', 0);
    }
    this.selectedBall = null;
  },
});
```

### 3. Component `color-ball`
```javascript
AFRAME.registerComponent('color-ball', {
  schema: {
    colorHex: { type: 'string' },
    colorName: { type: 'string' },
    targetAngle: { type: 'number' },
    originalPosition: { type: 'vec3' },
  },
  init() {
    this.el.setAttribute('geometry', {
      primitive: 'sphere', 
      radius: 0.12,
      segmentsWidth: 16,  // Low poly cho VR
      segmentsHeight: 12,
    });
    this.el.setAttribute('material', {
      color: this.data.colorHex,
      metalness: 0.3,
      roughness: 0.5,
    });
    this.el.classList.add('grabbable', 'interactive');
    
    // Hover highlight
    this.el.addEventListener('mouseenter', () => {
      this.el.setAttribute('material', 'emissive', this.data.colorHex);
      this.el.setAttribute('material', 'emissiveIntensity', 0.2);
    });
    this.el.addEventListener('mouseleave', () => {
      this.el.setAttribute('material', 'emissiveIntensity', 0);
    });
  }
});
```

### 4. Component `color-shelf`
```javascript
AFRAME.registerComponent('color-shelf', {
  schema: {
    width: { default: 2 },
    height: { default: 0.8 },
    depth: { default: 0.6 },
  },
  init() {
    // Mặt bàn
    const top = document.createElement('a-box');
    top.setAttribute('width', this.data.width);
    top.setAttribute('height', 0.05);
    top.setAttribute('depth', this.data.depth);
    top.setAttribute('position', `0 ${this.data.height} 0`);
    top.setAttribute('material', 'color: #2c3e50; shader: flat');
    this.el.appendChild(top);
    
    // 4 chân bàn
    const legPositions = [
      [-0.9, 0.4, -0.25], [0.9, 0.4, -0.25],
      [-0.9, 0.4, 0.25], [0.9, 0.4, 0.25],
    ];
    legPositions.forEach(pos => {
      const leg = document.createElement('a-cylinder');
      leg.setAttribute('radius', 0.03);
      leg.setAttribute('height', this.data.height);
      leg.setAttribute('position', pos.join(' '));
      leg.setAttribute('material', 'color: #34495e; shader: flat');
      this.el.appendChild(leg);
    });
    
    // Fake shadow dưới bàn
    const shadow = document.createElement('a-plane');
    shadow.setAttribute('rotation', '-90 0 0');
    shadow.setAttribute('width', this.data.width * 1.1);
    shadow.setAttribute('height', this.data.depth * 1.1);
    shadow.setAttribute('position', '0 0.01 0');
    shadow.setAttribute('material', 'color: #000; opacity: 0.2; shader: flat; transparent: true');
    this.el.appendChild(shadow);
  }
});
```

### 5. Spawn bi
```javascript
function spawnBalls(level) {
  const container = document.querySelector('#balls-container');
  // Clear existing
  while (container.firstChild) container.firstChild.remove();
  
  const colors = getColorsForLevel(level);
  const shuffled = shuffle([...colors]);
  
  shuffled.forEach((color, i) => {
    const ball = document.createElement('a-entity');
    const x = -0.5 + (i * (1.0 / (shuffled.length - 1 || 1)));
    const pos = { x, y: 0.95, z: -1.2 };
    
    ball.setAttribute('position', pos);
    ball.setAttribute('color-ball', {
      colorHex: color.hex,
      colorName: color.name,
      targetAngle: color.angle,
      originalPosition: pos,
    });
    ball.setAttribute('snap-to-slot', '');
    ball.setAttribute('ball-respawn', '');
    
    container.appendChild(ball);
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getColorsForLevel(level) {
  const config = LEVEL_CONFIG[level];
  return COLOR_DATA[config.colors];
}
```

## Success Criteria
- [ ] Kệ bàn render với 4 chân + mặt bàn + fake shadow
- [ ] Bi render với đúng màu, low-poly sphere
- [ ] VR: Grip/trigger → bi attach theo controller → release → bi drop
- [ ] Desktop: Click bi → highlight → click slot → place
- [ ] Hover bi → glow effect
- [ ] Bi spawn shuffled trên kệ
