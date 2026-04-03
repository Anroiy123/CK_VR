# Phase 6: Sound & Particles

**Priority**: P1 — Yêu cầu kỹ thuật  
**Status**: `[ ]`  
**Depends on**: Phase 4

## Mô tả
Thêm âm thanh nền (BGM), hiệu ứng âm thanh (SFX) cho mọi thao tác, và hiệu ứng particle khi đặt bi đúng. **Particle sử dụng Object Pooling** thay vì createElement/remove.

## Files

| File | Action | Mô tả |
|------|--------|--------|
| `js/sound-manager.js` | [NEW] | Howler.js wrapper, quản lý tất cả sounds |
| `js/particle-pool.js` | [NEW] | Object pool cho particle emitters |
| `assets/sounds/` | [NEW] | Thư mục chứa file âm thanh |
| `index.html` | [MODIFY] | Thêm scripts + particle pool entities |

## Âm thanh cần có

| Sound | File | Trigger | Nguồn |
|-------|------|---------|-------|
| BGM nền | `bgm.mp3` | Game start, loop | Royalty-free |
| Grab bi | `grab.mp3` | grab-start event | Short "pick" SFX |
| Drop đúng | `correct.mp3` | Snap success | Chime/ding |
| Drop sai | `wrong.mp3` | Snap fail | Buzz/error |
| Level up | `levelup.mp3` | Level complete | Fanfare ngắn |
| Victory | `victory.mp3` | Game win | Celebration |
| Timer warning | `tick.mp3` | Countdown <10s | Tick tock |
| Button click | `click.mp3` | UI button | Click sound |

## Implementation Steps

### 1. `sound-manager.js`
```javascript
const SoundManager = {
  sounds: {},
  
  init() {
    this.sounds = {
      bgm: new Howl({ src: ['assets/sounds/bgm.mp3'], loop: true, volume: 0.3 }),
      correct: new Howl({ src: ['assets/sounds/correct.mp3'], volume: 0.7 }),
      wrong: new Howl({ src: ['assets/sounds/wrong.mp3'], volume: 0.5 }),
      grab: new Howl({ src: ['assets/sounds/grab.mp3'], volume: 0.4 }),
      levelup: new Howl({ src: ['assets/sounds/levelup.mp3'], volume: 0.8 }),
      victory: new Howl({ src: ['assets/sounds/victory.mp3'], volume: 0.8 }),
      tick: new Howl({ src: ['assets/sounds/tick.mp3'], volume: 0.3 }),
      click: new Howl({ src: ['assets/sounds/click.mp3'], volume: 0.5 }),
    };
  },
  
  play(name) {
    if (this.sounds[name]) this.sounds[name].play();
  },
  
  stopBGM() { this.sounds.bgm.stop(); },
  startBGM() { this.sounds.bgm.play(); },
};
```

### 2. `particle-pool.js` — Object Pool (KHÔNG dùng createElement/remove)

> **QUAN TRỌNG**: createElement + remove mỗi lần đặt bi sẽ gây GC spikes → tụt FPS trên VR headset. Dùng pre-allocated pool thay thế.

```javascript
const ParticlePool = {
  pool: [],
  poolSize: 4,

  init() {
    const scene = document.querySelector('a-scene');

    for (let i = 0; i < this.poolSize; i++) {
      const entity = document.createElement('a-entity');
      entity.setAttribute('id', `particle-${i}`);
      entity.setAttribute('visible', false);
      scene.appendChild(entity);

      // Tạo particle geometry bằng THREE.Points (KHÔNG dùng aframe-particle-system)
      const count = 30;
      const positions = new Float32Array(count * 3);
      const velocities = [];

      for (let j = 0; j < count; j++) {
        positions[j * 3] = 0;
        positions[j * 3 + 1] = 0;
        positions[j * 3 + 2] = 0;
        velocities.push(new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 4 + 1,
          (Math.random() - 0.5) * 3
        ));
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ size: 0.06, color: 0xFFFFFF });
      const points = new THREE.Points(geometry, material);
      points.visible = false;
      entity.object3D.add(points);

      this.pool.push({
        el: entity,
        points,
        geometry,
        material,
        velocities,
        active: false,
        startTime: 0,
      });
    }
  },

  burst(position, colorHex) {
    const entry = this.pool.find(p => !p.active);
    if (!entry) return;

    entry.active = true;
    entry.startTime = performance.now();

    // Set position + color
    entry.el.setAttribute('position', position);
    entry.el.setAttribute('visible', true);
    entry.material.color.set(colorHex);
    entry.points.visible = true;

    // Reset particle positions to origin
    const posAttr = entry.geometry.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.setXYZ(i, 0, 0, 0);
    }
    posAttr.needsUpdate = true;

    this.animate(entry);
  },

  animate(entry) {
    const duration = 800; // ms
    const elapsed = performance.now() - entry.startTime;
    if (elapsed > duration || !entry.active) {
      entry.points.visible = false;
      entry.el.setAttribute('visible', false);
      entry.active = false;
      return;
    }

    const dt = 0.016; // ~60fps timestep
    const posAttr = entry.geometry.getAttribute('position');
    
    for (let i = 0; i < posAttr.count; i++) {
      const vel = entry.velocities[i];
      posAttr.setXYZ(i,
        posAttr.getX(i) + vel.x * dt,
        posAttr.getY(i) + vel.y * dt - 2 * dt, // gravity
        posAttr.getZ(i) + vel.z * dt
      );
    }
    posAttr.needsUpdate = true;

    // Fade out
    entry.material.opacity = 1 - (elapsed / duration);
    entry.material.transparent = true;

    requestAnimationFrame(() => this.animate(entry));
  },
};
```

### 3. Nguồn âm thanh
Sử dụng royalty-free sounds từ:
- freesound.org
- pixabay.com/sound-effects
- Hoặc tự generate bằng jsfxr (https://sfxr.me/)

## Success Criteria
- [ ] Nhạc nền chạy liên tục khi game bắt đầu
- [ ] Grab bi → có tiếng "pick"
- [ ] Đặt đúng → tiếng chime + particle burst (từ pool, không createElement)
- [ ] Đặt sai → tiếng buzz
- [ ] Level up → fanfare
- [ ] Victory → celebration sound
- [ ] Đặt nhanh liên tục 3 bi → particle burst 3 lần ổn định, không lag
