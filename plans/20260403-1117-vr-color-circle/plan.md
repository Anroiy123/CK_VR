# VR Color Circle — Implementation Plan

## Tổng quan
Ứng dụng VR phân loại màu theo cấp độ (Primary → Secondary → Tertiary) sử dụng A-Frame WebXR. Người chơi grab bi màu từ kệ bàn và drop vào slot đúng trên vòng tròn màu 3D lơ lửng.

## Tech Stack (v3 — Simplified)
- **A-Frame 1.6.0** — Core VR/WebXR framework
- **aframe-extras 7.6.0** — Movement controls
- **Howler.js 2.2.4** — Quản lý âm thanh
- Custom `grabber` component (thay super-hands + physics)
- Custom particle system (THREE.Points thay aframe-particle-system)

> ĐÃ LOẠI BỎ: ~~aframe-physics-system~~ (archived), ~~super-hands~~ (conflict), ~~aframe-particle-system~~ (không cần)

## Phases

| # | Phase | Mô tả | Status |
|---|-------|--------|--------|
| 1 | [Project Setup](phase-01-project-setup.md) | A-Frame scene, 3 CDNs only | `[ ]` |
| 2 | [Color Wheel & Slots](phase-02-color-wheel.md) | Floating ring 3D + slot positions | `[ ]` |
| 3 | [Color Balls, Shelf & Grabber](phase-03-color-balls.md) | Custom grab/drop, bi, kệ | `[ ]` |
| 4 | [Snap-to-Slot & Respawn](phase-04-grab-drop-snap.md) | Snap logic, ball lock, respawn | `[ ]` |
| 5 | [Game Logic & Levels](phase-05-game-logic.md) | State machine, timer, levels | `[ ]` |
| 6 | [Sound & Particles](phase-06-sound-particles.md) | Howler.js, particle pool | `[ ]` |
| 7 | [3D UI System](phase-07-ui-overlay.md) | World-space UI, diegetic HUD, gameover | `[ ]` |
| 8 | [Extended Features](phase-08-extended-features.md) | Free Play, billboard tooltips | `[ ]` |
| 9 | [Polish & Optimize](phase-09-polish-optimize.md) | No shadows, edge cases | `[ ]` |

## Dependencies

```
Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4
                                        │
                                        ▼
                                    Phase 5 ──▶ Phase 6 ──▶ Phase 7 ──▶ Phase 8 ──▶ Phase 9
```
