# Phase 5: Game Logic & Levels

**Priority**: P0 — Game flow  
**Status**: `[ ]`  
**Depends on**: Phase 4

## Mô tả
Quản lý trạng thái game: level progression, Easy/Hard mode, timer countdown, điều kiện win/lose.

## Files

| File | Action | Mô tả |
|------|--------|--------|
| `js/game-manager.js` | [NEW] | Singleton quản lý toàn bộ game state |
| `js/timer.js` | [NEW] | Component countdown timer cho Hard mode |
| `index.html` | [MODIFY] | Thêm scripts + timer entity |

## Game State Machine

```
  MENU ──▶ LEVEL_INIT ──▶ PLAYING ──▶ LEVEL_COMPLETE ──▶ LEVEL_INIT (next)
    │                        │                                  │
    │                        ▼                                  │
    │                   TIME_UP (Hard)                          │
    │                        │                                  │
    │                        ▼                                  │
    │                    GAME_OVER                              │
    │                                                          │
    └──────────────────── VICTORY (level 3 done) ◀─────────────┘
```

## Implementation Steps

### 1. `game-manager.js` — Singleton
```javascript
const GameManager = {
  state: 'MENU',       // MENU | PLAYING | LEVEL_COMPLETE | TIME_UP | VICTORY
  mode: 'easy',        // easy | hard
  currentLevel: 1,
  placedCount: 0,
  totalForLevel: 0,
  startTime: 0,
  
  startGame(mode) {
    this.mode = mode;
    this.currentLevel = 1;
    this.initLevel(1);
  },

  initLevel(level) {
    this.state = 'PLAYING';
    this.currentLevel = level;
    this.placedCount = 0;
    
    const config = LEVEL_CONFIG[level];
    const colors = COLOR_DATA[config.colors];
    this.totalForLevel = colors.length;
    
    // 1. Clear previous balls
    // 2. Cập nhật wheel: hiện slots cho level này
    // 3. Spawn bi mới trên kệ (shuffled)
    // 4. Nếu Hard mode → start timer
    // 5. Update HUD
    this.startTime = Date.now();
    
    if (this.mode === 'hard') {
      Timer.start(config.timer);
    }
  },

  onColorPlaced() {
    this.placedCount++;
    // Update HUD: "3/6 placed"
    
    if (this.placedCount >= this.totalForLevel) {
      this.levelComplete();
    }
  },

  levelComplete() {
    this.state = 'LEVEL_COMPLETE';
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    if (this.mode === 'hard') Timer.stop();

    if (this.currentLevel >= 3) {
      this.victory(elapsed);
    } else {
      // Hiện "Level Complete!" 2 giây
      // Sau đó initLevel(currentLevel + 1)
      setTimeout(() => this.initLevel(this.currentLevel + 1), 2500);
    }
  },

  victory(totalTime) {
    this.state = 'VICTORY';
    Leaderboard.submit(totalTime, this.mode);
    // Hiện victory screen
  },

  onTimeUp() {
    this.state = 'TIME_UP';
    // Hiện "Time's Up!" overlay
    // Option: Retry level / Back to menu
  },
};
```

### 2. `timer.js` — Countdown component
```javascript
const Timer = {
  remaining: 0,
  interval: null,
  
  start(seconds) {
    this.remaining = seconds;
    this.updateDisplay();
    
    this.interval = setInterval(() => {
      this.remaining--;
      this.updateDisplay();
      
      if (this.remaining <= 0) {
        this.stop();
        GameManager.onTimeUp();
      }
      
      // Cảnh báo khi còn <10s (đổi màu đỏ, nhấp nháy)
      if (this.remaining <= 10) {
        this.urgentWarning();
      }
    }, 1000);
  },
  
  stop() {
    clearInterval(this.interval);
  },
  
  updateDisplay() {
    // Cập nhật HUD text
    const el = document.querySelector('#timer-text');
    if (el) el.setAttribute('value', `${this.remaining}s`);
  },
};
```

### 3. Ball Respawn Watcher
> Bi rơi khỏi bàn (y < -1) tự động teleport về kệ — xem `ball-respawn` component tại Phase 4.
> Đảm bảo mọi bi spawn đều được gắn `ball-respawn` component.

### 4. Forgiving Hitboxes
> `snapDistance: 0.5` (thay vì 0.4) — nới rộng vùng nhận diện cho VR. Xem Phase 4.

### 5. Level transition
- Level complete → hiện 3D panel "Level X Complete!" (KHÔNG dùng HTML div)
- Fade transition giữa levels
- Giữ lại bi đã đặt đúng từ level trước (tích lũy trên wheel)
- Spawn bi mới cho level tiếp theo

## Level Data

| Level | Số bi | Timer (Hard) | Màu |
|-------|-------|-------------|-----|
| 1 | 3 | 30s | Red, Yellow, Blue |
| 2 | 3 | 25s | Orange, Green, Purple |
| 3 | 6 | 45s | 6 Tertiary colors |

## Success Criteria
- [ ] Đặt đủ 3 bi Level 1 → tự động chuyển Level 2
- [ ] Level 2 → Level 3 → Victory screen
- [ ] Hard mode: Timer đếm ngược, hết giờ → Game Over
- [ ] Easy mode: Không có timer
- [ ] HUD hiện level, số bi đã đặt, timer (nếu có)
