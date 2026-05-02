## MODIFIED Requirements

### Requirement: UI panels have neon glow borders

All UI panels in index.html SHALL have glow border planes behind them, creating a neon outline effect.

#### Scenario: Menu panel has dark background and glow border

- **WHEN** the menu-panel loads
- **THEN** the menu panel background color is #080e1f, and a larger glow border plane (larger by 0.08 per dimension) with emissive=#4dabf7, opacity=0.2 is placed behind the panel

#### Scenario: All panels have themed glow borders

- **WHEN** each panel (leaderboard, victory, gameover, freeplay, status, timer) loads
- **THEN** each has a glow border plane behind it (larger by 0.08 per dimension) with emissive color matching the panel's theme and opacity between 0.08-0.12

#### Scenario: Title font uses Exo2Bold

- **WHEN** the menu panel title "VR COLOR CIRCLE" renders
- **THEN** it uses the Exo2Bold font with increased width for visual prominence
