## MODIFIED Requirements

### Requirement: VR button has glow plane and enhanced hover

The vr-button component SHALL add a glow plane behind the button and enhance hover animation with pulsating glow.

#### Scenario: Glow plane renders behind button

- **WHEN** the vr-button component initializes
- **THEN** a plane is created behind the button (larger by 0.06 in each dimension) with emissive=bgColor, opacity=0.12, creating a glow effect

#### Scenario: Hover scales button to 1.08

- **WHEN** the cursor hovers over a vr-button (mouseenter)
- **THEN** the button scale increases to 1.08 (up from 1.04)

#### Scenario: Hover increases glow plane opacity

- **WHEN** the cursor hovers over a vr-button
- **THEN** the glow plane opacity increases to 0.25

#### Scenario: Hover glow pulse animation plays

- **WHEN** the cursor hovers over a vr-button
- **THEN** a pulse animation runs on the glow plane, cycling opacity between 0.12 and 0.22 with 800ms duration
