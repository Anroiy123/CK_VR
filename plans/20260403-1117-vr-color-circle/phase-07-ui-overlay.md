# Phase 7: 3D UI System (World-Space UI)

**Priority**: P1 — UX  
**Status**: `[ ]`  
**Depends on**: Phase 5

## Mô tả
Toàn bộ UI phải là **3D entities** (`a-plane`, `a-text`) trong A-Frame scene — KHÔNG dùng HTML `<div>` overlay. HTML overlay **tàng hình hoàn toàn** khi người chơi vào Immersive VR mode.

> **QUAN TRỌNG**: Mọi menu, HUD, timer, leaderboard đều phải render bằng A-Frame 3D entities để hiển thị đúng trong cả desktop lẫn VR headset.

## Files

| File | Action | Mô tả |
|------|--------|--------|
| `js/ui-manager.js` | [NEW] | Quản lý show/hide 3D UI panels |
| `js/leaderboard.js` | [NEW] | localStorage leaderboard |
| `js/vr-button.js` | [NEW] | 3D interactive button component |
| `index.html` | [MODIFY] | 3D UI entities |

## Chiến lược UI

### Phân loại UI theo vị trí

| UI Element | Loại | Vị trí trong VR |
|-----------|------|-----------------|
| Start Menu | **World-space panel** | Lơ lửng trước mặt, z = -3 |
| HUD (level, progress) | **Diegetic UI** | Gắn trên Color Wheel ring |
| Timer | **Diegetic UI** | Lơ lửng phía trên ring |
| Victory/GameOver | **World-space panel** | Thay thế vị trí Color Wheel |
| Leaderboard | **World-space panel** | Cạnh Start Menu |

### Vì sao KHÔNG dùng Head-locked HUD?
Head-locked UI (gắn vào camera) gây mệt mắt và motion sickness trong VR. Thay vào đó, dùng **Diegetic UI** — UI là một phần tự nhiên của thế giới game.

## UI Screens (All 3D Entities)

### 1. Start Menu — World-space panel
```html
<a-entity id="menu-panel" position="0 1.6 -3" visible="true">
  <!-- Background panel -->
  <a-plane width="3" height="2.5" color="#1a1a2e" opacity="0.95"
           material="shader: flat"></a-plane>
  
  <!-- Title -->
  <a-text value="VR COLOR CIRCLE" position="0 0.8 0.01" 
          align="center" color="#e94560" width="3.5"
          font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"></a-text>
  
  <a-text value="Phan loai mau theo cap do" position="0 0.5 0.01"
          align="center" color="#CCCCCC" width="2"></a-text>
  
  <!-- Buttons (interactive planes) -->
  <a-entity id="btn-easy" class="interactive vr-button"
            vr-button="label: EASY; action: start-easy"
            position="-0.5 0 0.01">
  </a-entity>
  
  <a-entity id="btn-hard" class="interactive vr-button"
            vr-button="label: HARD; action: start-hard"
            position="0.5 0 0.01">
  </a-entity>
  
  <a-entity id="btn-freeplay" class="interactive vr-button"
            vr-button="label: FREE PLAY; action: start-freeplay"
            position="-0.5 -0.5 0.01">
  </a-entity>
  
  <a-entity id="btn-leaderboard" class="interactive vr-button"
            vr-button="label: LEADERBOARD; action: show-leaderboard"
            position="0.5 -0.5 0.01">
  </a-entity>
</a-entity>
```

### 2. In-Game HUD — Diegetic (gắn trên Color Wheel)
```html
<!-- Gắn bên trong #color-wheel entity -->
<a-entity id="diegetic-hud" position="0 0.5 0">
  <!-- Level indicator — phía trên ring -->
  <a-text id="hud-level" value="Level 1: Primary" 
          position="0 0.3 0" align="center" color="#FFF" width="2.5"
          look-at="[camera]"></a-text>
  
  <!-- Progress -->
  <a-text id="hud-progress" value="0/3"
          position="0 0 0" align="center" color="#e94560" width="3"
          look-at="[camera]"></a-text>
</a-entity>

<!-- Timer — lơ lửng phía trên ring riêng -->
<a-entity id="timer-display" position="0 3 -3" look-at="[camera]">
  <a-plane width="0.8" height="0.4" color="#1a1a2e" opacity="0.9"></a-plane>
  <a-text id="timer-text" value="30s" position="0 0 0.01"
          align="center" color="#00FF88" width="3"></a-text>
</a-entity>
```

### 3. Victory Screen — World-space panel (thay thế ring)
```html
<a-entity id="victory-panel" position="0 1.8 -3" visible="false">
  <a-plane width="3" height="2" color="#0f3460" opacity="0.95"></a-plane>
  
  <a-text value="CONGRATULATIONS!" position="0 0.6 0.01"
          align="center" color="#FFD700" width="3"
          font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"></a-text>
  
  <a-text id="victory-time" value="Total Time: --" position="0 0.2 0.01"
          align="center" color="#FFF" width="2"></a-text>
  
  <a-entity id="btn-replay" class="interactive vr-button"
            vr-button="label: REPLAY; action: replay"
            position="-0.5 -0.4 0.01">
  </a-entity>
  
  <a-entity id="btn-menu" class="interactive vr-button"
            vr-button="label: MENU; action: back-menu"
            position="0.5 -0.4 0.01">
  </a-entity>
</a-entity>
```

### 4. Game Over Screen — World-space panel (TIME_UP state)
```html
<a-entity id="gameover-panel" position="0 1.8 -3" visible="false">
  <a-plane width="3" height="2" color="#3d0000" opacity="0.95"></a-plane>
  
  <a-text value="TIME'S UP!" position="0 0.6 0.01"
          align="center" color="#FF4444" width="3.5"
          font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"></a-text>
  
  <a-text id="gameover-level" value="Level: --" position="0 0.2 0.01"
          align="center" color="#CCCCCC" width="2"></a-text>
  
  <a-entity id="btn-retry" class="interactive vr-button"
            vr-button="label: RETRY; action: retry-level"
            position="-0.5 -0.4 0.01">
  </a-entity>
  
  <a-entity id="btn-gameover-menu" class="interactive vr-button"
            vr-button="label: MENU; action: back-menu"
            position="0.5 -0.4 0.01">
  </a-entity>
</a-entity>
```

### 5. Leaderboard — World-space panel
```html
<a-entity id="leaderboard-panel" position="0 1.6 -3" visible="false">
  <a-plane width="3.5" height="2.5" color="#16213e" opacity="0.95"></a-plane>
  
  <a-text value="LEADERBOARD" position="0 0.9 0.01"
          align="center" color="#FFD700" width="3"></a-text>
  
  <!-- Scores dynamically updated by js -->
  <a-text id="lb-easy-scores" value="EASY\n---" 
          position="-0.8 0.3 0.01" color="#00FF88" width="1.5"></a-text>
  
  <a-text id="lb-hard-scores" value="HARD\n---"
          position="0.8 0.3 0.01" color="#FF4444" width="1.5"></a-text>
  
  <a-entity id="btn-lb-back" class="interactive vr-button"
            vr-button="label: BACK; action: back-menu"
            position="0 -0.8 0.01">
  </a-entity>
</a-entity>
```

## Implementation Steps

### 1. Component `vr-button` — Interactive 3D button
```javascript
AFRAME.registerComponent('vr-button', {
  schema: {
    label: { type: 'string', default: 'Button' },
    action: { type: 'string', default: '' },
    width: { type: 'number', default: 0.8 },
    height: { type: 'number', default: 0.3 },
    bgColor: { type: 'string', default: '#e94560' },
    hoverColor: { type: 'string', default: '#ff6b81' },
  },
  
  init() {
    // Tạo background plane
    this.bg = document.createElement('a-plane');
    this.bg.setAttribute('width', this.data.width);
    this.bg.setAttribute('height', this.data.height);
    this.bg.setAttribute('color', this.data.bgColor);
    this.bg.setAttribute('material', 'shader: flat');
    this.el.appendChild(this.bg);
    
    // Tạo label text
    this.label = document.createElement('a-text');
    this.label.setAttribute('value', this.data.label);
    this.label.setAttribute('align', 'center');
    this.label.setAttribute('color', '#FFF');
    this.label.setAttribute('position', '0 0 0.01');
    this.label.setAttribute('width', this.data.width * 2);
    this.el.appendChild(this.label);
    
    // Hover effects
    this.el.addEventListener('mouseenter', () => {
      this.bg.setAttribute('color', this.data.hoverColor);
      SoundManager.play('click');
    });
    this.el.addEventListener('mouseleave', () => {
      this.bg.setAttribute('color', this.data.bgColor);
    });
    
    // Click action
    this.el.addEventListener('click', () => {
      this.el.sceneEl.emit(this.data.action);
    });
  }
});
```

### 2. `ui-manager.js`
```javascript
const UIManager = {
  panels: {},
  
  init() {
    this.panels = {
      menu: document.querySelector('#menu-panel'),
      victory: document.querySelector('#victory-panel'),
      gameover: document.querySelector('#gameover-panel'),
      leaderboard: document.querySelector('#leaderboard-panel'),
      hud: document.querySelector('#diegetic-hud'),
      timer: document.querySelector('#timer-display'),
    };
    
    // Listen for button actions
    const scene = document.querySelector('a-scene');
    scene.addEventListener('start-easy', () => this.startGame('easy'));
    scene.addEventListener('start-hard', () => this.startGame('hard'));
    scene.addEventListener('start-freeplay', () => this.startFreePlay());
    scene.addEventListener('show-leaderboard', () => this.showPanel('leaderboard'));
    scene.addEventListener('back-menu', () => this.showPanel('menu'));
    scene.addEventListener('replay', () => this.startGame(GameManager.mode));
    scene.addEventListener('retry-level', () => GameManager.initLevel(GameManager.currentLevel));
  },
  
  showPanel(name) { /* set visible true/false */ },
  hideAll() { /* hide all panels */ },
  
  updateHUD(level, placed, total) {
    document.querySelector('#hud-level').setAttribute('value', `Level ${level}`);
    document.querySelector('#hud-progress').setAttribute('value', `${placed}/${total}`);
  },
};
```

### 3. `leaderboard.js`
```javascript
const Leaderboard = {
  getScores(mode) {
    return JSON.parse(localStorage.getItem(`vr-cc-${mode}`) || '[]');
  },
  
  submit(time, mode) {
    const scores = this.getScores(mode);
    scores.push({ time, date: new Date().toISOString() });
    scores.sort((a, b) => a.time - b.time);
    localStorage.setItem(`vr-cc-${mode}`, JSON.stringify(scores.slice(0, 10)));
  },
  
  renderToPanel() {
    ['easy', 'hard'].forEach(mode => {
      const scores = this.getScores(mode);
      const text = `${mode.toUpperCase()}\n` + 
        scores.slice(0, 5).map((s, i) => `${i+1}. ${s.time.toFixed(1)}s`).join('\n');
      document.querySelector(`#lb-${mode}-scores`).setAttribute('value', text);
    });
  },
};
```

## Lưu ý
- Tất cả text panels cần `look-at="[camera]"` hoặc `billboard` component
- Menu panel nên có subtle animation (fade in, scale up) khi hiện
- Timer text đổi màu đỏ + nhấp nháy khi < 10s
- Buttons cần classes `.interactive` để raycaster/cursor detect được

## Success Criteria
- [ ] Start menu hiện bằng 3D panel khi load
- [ ] Buttons hoạt động cả mouse click lẫn VR controller ray
- [ ] HUD hiện level, progress trên ring — nhìn thấy trong VR
- [ ] Timer lơ lửng trên ring — nhìn thấy trong VR
- [ ] Victory, Leaderboard hiện bằng 3D panels
- [ ] Tất cả text luôn quay mặt về camera (billboard)
