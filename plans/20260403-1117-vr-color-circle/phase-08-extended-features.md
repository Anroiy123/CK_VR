# Phase 8: Extended Features

**Priority**: P2 — Bonus điểm  
**Status**: `[ ]`  
**Depends on**: Phase 7

## Mô tả
Tính năng mở rộng: Free Play mode và Tooltip giải thích lý thuyết màu (với billboard auto-rotate).

## Files

| File | Action | Mô tả |
|------|--------|--------|
| `js/free-play.js` | [NEW] | Free Play mode logic |
| `js/tooltip.js` | [NEW] | Component tooltip lý thuyết màu (3D, billboard) |
| `js/color-data.js` | [MODIFY] | Thêm theory text cho mỗi màu |
| `index.html` | [MODIFY] | Thêm scripts |

## Feature 1: Free Play Mode

**Mô tả**: Không có đúng/sai, không timer. Người chơi tự do kéo thả bi vào bất kỳ slot nào để khám phá color wheel.

### Khác biệt với game mode
| Aspect | Game Mode | Free Play |
|--------|-----------|-----------| 
| Đúng/Sai | Có | Không |
| Timer | Có (Hard) | Không |
| Level lock | Có | Tất cả 12 slot mở |
| Bi | Theo level | Tất cả 12 bi |
| Score | Có | Không |
| Re-grab | Không (bi bị khóa) | Có (kéo ra kéo vào tự do) |

### Implementation
- Hiện tất cả 12 slot và 12 bi
- Bi có thể đặt vào bất kỳ slot nào (always accept)
- Slot hiện tên màu khi bi được đặt
- **Có thể kéo bi ra khỏi slot** và đặt lại (khác game mode nơi bi bị khóa)
- Nút "Reset" 3D button để reset tất cả về vị trí ban đầu
- Khi bi đặt đúng vị trí tự nhiên → hiện tooltip lý thuyết

## Feature 2: Color Theory Tooltips (Billboard)

> **QUAN TRỌNG**: Tooltip panel phải có `look-at="[camera]"` để luôn quay mặt về phía người chơi. VR environment góc nhìn đa chiều → panel nghiêng sẽ không đọc được.

### Tooltip Data
```javascript
const COLOR_THEORY = {
  '#FF0000': {
    name: 'Red',
    type: 'Primary',
    theory: 'Mau co ban, khong the tao tu pha tron',
    emoji: '🔴',
  },
  '#FF8000': {
    name: 'Orange',
    type: 'Secondary',
    theory: 'Red + Yellow = Orange',
    emoji: '🟠',
  },
  '#FF4000': {
    name: 'Red-Orange',
    type: 'Tertiary',
    theory: 'Red + Orange = Red-Orange',
    emoji: '🔶',
  },
  // ... 12 entries
};
```

### Implementation — 3D Billboard Tooltip
```javascript
AFRAME.registerComponent('color-tooltip', {
  schema: {
    colorHex: { type: 'string' },
  },

  init() {
    // Tạo tooltip panel (ẩn ban đầu)
    this.tooltip = document.createElement('a-entity');
    this.tooltip.setAttribute('visible', false);
    this.tooltip.setAttribute('look-at', '[camera]');  // BILLBOARD
    
    // Background panel
    const bg = document.createElement('a-plane');
    bg.setAttribute('width', 1.2);
    bg.setAttribute('height', 0.6);
    bg.setAttribute('color', '#1a1a2e');
    bg.setAttribute('opacity', 0.9);
    bg.setAttribute('material', 'shader: flat');
    this.tooltip.appendChild(bg);
    
    // Title text
    this.titleText = document.createElement('a-text');
    this.titleText.setAttribute('position', '0 0.15 0.01');
    this.titleText.setAttribute('align', 'center');
    this.titleText.setAttribute('color', '#FFD700');
    this.titleText.setAttribute('width', 1.5);
    this.tooltip.appendChild(this.titleText);
    
    // Theory text
    this.theoryText = document.createElement('a-text');
    this.theoryText.setAttribute('position', '0 -0.1 0.01');
    this.theoryText.setAttribute('align', 'center');
    this.theoryText.setAttribute('color', '#CCCCCC');
    this.theoryText.setAttribute('width', 1.2);
    this.tooltip.appendChild(this.theoryText);
    
    // Position tooltip ABOVE the entity
    this.tooltip.setAttribute('position', '0 0.4 0');
    this.el.appendChild(this.tooltip);
    
    // Events
    this.el.addEventListener('mouseenter', () => this.show());
    this.el.addEventListener('mouseleave', () => this.hide());
  },
  
  show() {
    const data = COLOR_THEORY[this.data.colorHex];
    if (!data) return;
    
    this.titleText.setAttribute('value', `${data.name} (${data.type})`);
    this.theoryText.setAttribute('value', data.theory);
    this.tooltip.setAttribute('visible', true);
    
    // Fade-in animation
    this.tooltip.setAttribute('animation', {
      property: 'scale',
      from: '0.5 0.5 0.5',
      to: '1 1 1',
      dur: 200,
      easing: 'easeOutQuad',
    });
  },
  
  hide() {
    this.tooltip.setAttribute('visible', false);
  },
});
```

## Success Criteria
- [ ] Free Play: Tất cả 12 bi và slot hiện
- [ ] Free Play: Kéo thả tự do, không báo sai
- [ ] Free Play: Có thể kéo bi RA khỏi slot và đặt lại
- [ ] Free Play: Reset button 3D hoạt động
- [ ] Tooltip: Hover/gaze bi/slot → panel hiện thông tin màu
- [ ] Tooltip: Panel luôn quay mặt về camera (billboard) — đọc được ở mọi góc
- [ ] Tooltip: Ẩn khi rời cursor/gaze
