(function () {
  if (!window.AFRAME) {
    return;
  }

  const SECTOR_SWEEP_DEGREES = 30.6;
  function getWheelAngleRadians(angleDeg) {
    return Math.PI / 2 - (angleDeg * Math.PI) / 180;
  }

  function getArcPoint(radius, radians) {
    return new THREE.Vector2(Math.cos(radians) * radius, Math.sin(radians) * radius);
  }

  function getWheelSlotPosition(angleDeg, radius) {
    const radians = getWheelAngleRadians(angleDeg);
    return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius, z: 0 };
  }

  function buildSectorShape(innerRadius, outerRadius, angleDeg, sweepDeg) {
    const shape = new THREE.Shape();
    const centerRadians = getWheelAngleRadians(angleDeg);
    const halfSweep = (sweepDeg * Math.PI) / 360;
    const startRadians = centerRadians + halfSweep;
    const endRadians = centerRadians - halfSweep;
    const segments = 10;

    const outerPoints = [];
    const innerPoints = [];

    for (let index = 0; index <= segments; index += 1) {
      const progress = index / segments;
      const radians = startRadians + (endRadians - startRadians) * progress;
      outerPoints.push(getArcPoint(outerRadius, radians));
      innerPoints.push(getArcPoint(innerRadius, radians));
    }

    shape.moveTo(outerPoints[0].x, outerPoints[0].y);
    outerPoints.slice(1).forEach(function (point) {
      shape.lineTo(point.x, point.y);
    });
    innerPoints.reverse().forEach(function (point) {
      shape.lineTo(point.x, point.y);
    });
    shape.closePath();

    return shape;
  }

  function createSectorEntity(options) {
    const sectorEl = document.createElement("a-entity");
    const geometry = new THREE.ShapeGeometry(
      buildSectorShape(
        options.innerRadius,
        options.outerRadius,
        options.angleDeg,
        options.sweepDeg,
      ),
    );
    const materialType = options.materialType || "standard";
    const materialOptions = {
      color: options.color,
      transparent: true,
      opacity: options.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    };
    const material =
      materialType === "basic"
        ? new THREE.MeshBasicMaterial(materialOptions)
        : new THREE.MeshStandardMaterial(
            Object.assign({}, materialOptions, {
              emissive: new THREE.Color(options.color),
              emissiveIntensity: 0,
              roughness: 0.34,
              metalness: 0.06,
            }),
          );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = options.zOffset || 0;
    mesh.renderOrder = options.renderOrder || 1;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sectorEl.setObject3D("mesh", mesh);
    sectorEl.__sectorMaterial = material;
    sectorEl.__sectorMesh = mesh;
    return sectorEl;
  }

  function clampColorChannel(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function hexToRgb(hex) {
    const normalizedHex = hex.replace("#", "");
    const fullHex =
      normalizedHex.length === 3
        ? normalizedHex
            .split("")
            .map(function (part) {
              return part + part;
            })
            .join("")
        : normalizedHex;

    return {
      r: parseInt(fullHex.slice(0, 2), 16),
      g: parseInt(fullHex.slice(2, 4), 16),
      b: parseInt(fullHex.slice(4, 6), 16),
    };
  }

  function rgbToHex(rgb) {
    return (
      "#" +
      [rgb.r, rgb.g, rgb.b]
        .map(function (channel) {
          return clampColorChannel(channel).toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  function mixHexColors(startHex, endHex, amount) {
    const startRgb = hexToRgb(startHex);
    const endRgb = hexToRgb(endHex);

    return rgbToHex({
      r: startRgb.r + (endRgb.r - startRgb.r) * amount,
      g: startRgb.g + (endRgb.g - startRgb.g) * amount,
      b: startRgb.b + (endRgb.b - startRgb.b) * amount,
    });
  }

  function buildSegmentLayerDefinitions(innerEdge, outerEdge, isTint) {
    const layerCount = 1;
    const layerThickness = (outerEdge - innerEdge) / layerCount;
    const layerDefinitions = [];
    const baseZOffset = isTint ? -0.02 : -0.01;

    for (let index = 0; index < layerCount; index += 1) {
      const outerRadius = outerEdge - layerThickness * index;
      const innerRadius = index === layerCount - 1 ? innerEdge : outerRadius - layerThickness;

      layerDefinitions.push({
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        zOffset: baseZOffset + index * 0.001,
      });
    }

    return layerDefinitions;
  }

  function getInactiveLayerStyle(layerIndex, isTint) {
    const opacityByLayer = [isTint ? 0.56 : 0.68];
    return {
      color: isTint ? "#efe3d0" : "#d8c3a5",
      opacity: opacityByLayer[layerIndex] || 0.52,
    };
  }

  function getActiveLayerStyle(fillColorHex, layerIndex, isTint) {
    const tintByLayer = [0];
    const opacityByLayer = [1.0];

    return {
      color: mixHexColors(fillColorHex, "#ffffff", tintByLayer[layerIndex] || 0),
      opacity: opacityByLayer[layerIndex] || 1,
      emissive: fillColorHex,
      emissiveIntensity: isTint ? 0.24 : 0.2,
    };
  }

  function applyLayerStyle(layerEl, style) {
    if (!layerEl || !layerEl.__sectorMaterial) {
      return;
    }

    layerEl.__sectorMaterial.color.set(style.color);
    layerEl.__sectorMaterial.opacity = style.opacity;
    if (layerEl.__sectorMaterial.emissive) {
      if (style.emissive) {
        layerEl.__sectorMaterial.emissive.set(style.emissive);
        layerEl.__sectorMaterial.emissiveIntensity = style.emissiveIntensity || 0;
      } else {
        layerEl.__sectorMaterial.emissive.setHex(0x000000);
        layerEl.__sectorMaterial.emissiveIntensity = 0;
      }
    }
    layerEl.__sectorMaterial.needsUpdate = true;
  }

  function createTorus(options) {
    const torus = document.createElement("a-torus");
    torus.setAttribute("radius", options.radius);
    torus.setAttribute("radius-tubular", options.tubeRadius);
    torus.setAttribute("segments-radial", options.radialSegments || "16");
    torus.setAttribute("segments-tubular", options.tubularSegments || "48");
    torus.setAttribute("material", options.material);
    if (options.position) {
      torus.setAttribute("position", options.position);
    }
    if (options.visible !== undefined) {
      torus.setAttribute("visible", options.visible);
    }
    return torus;
  }

  AFRAME.registerComponent("color-wheel", {
    schema: {
      radius: { type: "number", default: APP_CONFIG.wheelRadius },
      level: { type: "number", default: 1 },
    },

    init: function init() {
      this.slotsByHex = {};
      this.slotList = [];
      this.segmentLayersByHex = {};
      this.ringRoot = document.createElement("a-entity");
      this.slotRoot = document.createElement("a-entity");
      this.segmentRoot = document.createElement("a-entity");

      this.el.appendChild(this.ringRoot);
      this.el.appendChild(this.segmentRoot);
      this.el.appendChild(this.slotRoot);

      this.createRing();
      this.createSegments();
      this.createSlots();
      this.resetSlots();
    },

    createRing: function createRing() {
      const backplate = document.createElement("a-cylinder");
      backplate.setAttribute("radius", this.data.radius + 0.105);
      backplate.setAttribute("height", "0.055");
      backplate.setAttribute("rotation", "90 0 0");
      backplate.setAttribute("position", "0 0 -0.062");
      backplate.setAttribute(
        "material",
        "color: #2c2218; roughness: 0.42; metalness: 0.18; emissive: #080604; emissiveIntensity: 0.05",
      );
      backplate.setAttribute("shadow", "cast: true; receive: true");
      this.ringRoot.appendChild(backplate);

      const backRim = createTorus({
        radius: this.data.radius + 0.08,
        tubeRadius: "0.035",
        radialSegments: "18",
        tubularSegments: "64",
        material: "color: #3d2b18; roughness: 0.34; metalness: 0.34; emissive: #1d1208; emissiveIntensity: 0.06",
        position: "0 0 -0.025",
      });
      backRim.setAttribute("shadow", "cast: true; receive: true");
      this.ringRoot.appendChild(backRim);

      const outerSegmentRadius = this.data.radius - 0.004;
      const outerRingTubeRadius = 0.024;
      const outerRing = document.createElement("a-torus");
      outerRing.setAttribute("radius", outerSegmentRadius + outerRingTubeRadius);
      outerRing.setAttribute("radius-tubular", outerRingTubeRadius);
      outerRing.setAttribute("segments-radial", "12");
      outerRing.setAttribute("segments-tubular", "24");
      outerRing.setAttribute(
        "material",
        "color: #b18a52; opacity: 0.96; transparent: true; roughness: 0.26; metalness: 0.26; emissive: #6b4a20; emissiveIntensity: 0.12",
      );
      outerRing.setAttribute("position", "0 0 0.012");
      outerRing.setAttribute("shadow", "cast: true; receive: true");
      this.ringRoot.appendChild(outerRing);

      const innerRing = document.createElement("a-torus");
      innerRing.setAttribute("radius", this.data.radius - 0.12);
      innerRing.setAttribute("radius-tubular", "0.012");
      innerRing.setAttribute("segments-radial", "16");
      innerRing.setAttribute("segments-tubular", "48");
      innerRing.setAttribute(
        "material",
        "color: #f3d58f; opacity: 0; transparent: true; emissive: #d79c38; emissiveIntensity: 0.18; depthWrite: false",
      );
      innerRing.setAttribute("position", "0 0 0.018");
      innerRing.setAttribute("visible", false);
      this.ringRoot.appendChild(innerRing);
      this.centerRingEl = innerRing;

      const tintRing = document.createElement("a-torus");
      tintRing.setAttribute("radius", "0.588");
      tintRing.setAttribute("radius-tubular", "0.015");
      tintRing.setAttribute("segments-radial", "16");
      tintRing.setAttribute("segments-tubular", "48");
      tintRing.setAttribute(
        "material",
        "color: #eadcc8; opacity: 0; transparent: true; emissive: #c8a96a; emissiveIntensity: 0.14; depthWrite: false",
      );
      tintRing.setAttribute("position", "0 0 0.02");
      tintRing.setAttribute("visible", false);
      this.ringRoot.appendChild(tintRing);
      this.tintRingEl = tintRing;
    },

    createSegments: function createSegments() {
      const self = this;

      getAllColors().forEach(function (color) {
        if (color.type === "Base") return;

        const isTint = color.type === "Tint";
        let layerDefinitions;
        if (isTint) {
          layerDefinitions = buildSegmentLayerDefinitions(0.12, 0.46, true);
        } else {
          layerDefinitions = buildSegmentLayerDefinitions(0.46, self.data.radius - 0.004, false);
        }

        const segmentLayers = layerDefinitions.map(function (layerDefinition, layerIndex) {
          const inactiveStyle = getInactiveLayerStyle(layerIndex, isTint);
          const segmentLayer = createSectorEntity({
            innerRadius: layerDefinition.innerRadius,
            outerRadius: layerDefinition.outerRadius,
            angleDeg: color.angle,
            sweepDeg: SECTOR_SWEEP_DEGREES,
            color: inactiveStyle.color,
            opacity: inactiveStyle.opacity,
            zOffset: layerDefinition.zOffset,
            renderOrder: (isTint ? 10 : 1) + layerIndex,
            materialType: "standard",
          });
          segmentLayer.setAttribute("visible", false);
          self.segmentRoot.appendChild(segmentLayer);
          return segmentLayer;
        });

        self.segmentLayersByHex[color.hex] = segmentLayers;
      });
    },

    createSlots: function createSlots() {
      const self = this;

      getAllColors().forEach(function (color) {
        let slotRadius = self.data.radius - 0.02;
        if (color.type === "Tint") {
          slotRadius = 0.46;
        } else if (color.type === "Base") {
          slotRadius = 0;
        }

        const slotPosition = getWheelSlotPosition(color.angle || 0, slotRadius);
        const slot = document.createElement("a-entity");
        slot.id = "slot-" + (color.type === "Base" ? "center" : color.type.toLowerCase() + "-" + color.angle);
        slot.classList.add("color-slot", "interactive");
        slot.dataset.targetColor = color.hex;
        slot.dataset.targetName = color.name;
        slot.dataset.angle = String(color.angle || 0);
        slot.dataset.type = color.type;
        slot.setAttribute(
          "position",
          vec3ToString(new THREE.Vector3(slotPosition.x, slotPosition.y, slotPosition.z)),
        );
        slot.setAttribute("geometry", "primitive: cylinder; radius: 0.14; height: 0.1");
        slot.setAttribute(
          "material",
          "color: #ffffff; opacity: 0; transparent: true; depthWrite: false; side: double",
        );
        slot.setAttribute("visible", false);
        slot.__segmentLayers = self.segmentLayersByHex[color.hex] || [];

        const visual = document.createElement("a-cylinder");
        visual.classList.add("slot-visual");
        visual.setAttribute("radius", color.type === "Base" ? "0.14" : "0.052");
        visual.setAttribute("height", color.type === "Base" ? "0.032" : "0.026");
        visual.setAttribute("rotation", "90 0 0");
        visual.setAttribute("position", "0 0 -0.01");
        const baseMaterial =
          color.type === "Base"
            ? "color: #ffffff; opacity: 0.92; transparent: true; shader: flat; emissive: #ffffff; emissiveIntensity: 0.45; depthTest: false"
            : "color: #8a6f4b; opacity: 0.42; transparent: true; shader: flat";
        visual.setAttribute("visible", false);
        visual.setAttribute("material", baseMaterial);
        slot.appendChild(visual);

        self.slotRoot.appendChild(slot);
        self.slotsByHex[color.hex] = slot;
        self.slotList.push(slot);
      });
    },

    resetSlots: function resetSlots() {
      const self = this;
      this.slotList.forEach(function (slot) {
        slot.classList.remove("occupied");
        delete slot.dataset.occupied;
        slot.setAttribute("visible", false);
        (slot.__segmentLayers || []).forEach(function (segmentLayer) {
          segmentLayer.setAttribute("visible", false);
        });
        self.setSlotState(slot, { occupied: false, revealName: false });
      });
    },

    prepareGameLevel: function prepareGameLevel(level) {
      const visibleColors = getColorsForLevel(level);
      this.updateVisibleSlots(visibleColors, false);

      if (this.tintRingEl) this.tintRingEl.setAttribute("visible", false);
      if (this.centerRingEl) this.centerRingEl.setAttribute("visible", false);
    },

    prepareMixingLevel: function prepareMixingLevel(level) {
      const config = MIX_LEVEL_CONFIG[level];
      if (!config) return;
      const targetHexes = new Set(config.targets);
      const visibleColors = getAllColors().filter(function (color) {
        return targetHexes.has(color.hex);
      });
      this.updateVisibleSlots(visibleColors, false);

      if (this.tintRingEl) this.tintRingEl.setAttribute("visible", false);
      if (this.centerRingEl) this.centerRingEl.setAttribute("visible", false);
    },

    prepareFreePlay: function prepareFreePlay() {
      this.updateVisibleSlots(getAllColors(), true);
    },

    updateVisibleSlots: function updateVisibleSlots(colors, revealName) {
      const visibleHexes = new Set(
        colors.map(function (color) {
          return color.hex;
        }),
      );
      const self = this;

      getAllColors().forEach(function (color) {
        const slot = self.slotsByHex[color.hex];
        const segmentLayers = self.segmentLayersByHex[color.hex] || [];
        const shouldShow = visibleHexes.has(color.hex);
        slot.setAttribute("visible", shouldShow);
        segmentLayers.forEach(function (segmentLayer) {
          segmentLayer.setAttribute("visible", shouldShow);
        });
        if (!shouldShow) {
          self.setSlotState(slot, { occupied: false, revealName: false });
          return;
        }
        if (slot.dataset.occupied === "true") {
          const fillColorHex = slot.dataset.fillColorHex || color.hex;
          self.setSlotState(slot, { occupied: true, revealName: true, colorHex: fillColorHex });
          return;
        }
        self.setSlotState(slot, { occupied: false, revealName: revealName });
      });
    },

    setSlotState: function setSlotState(slotOrHex, options) {
      const slot = typeof slotOrHex === "string" ? this.slotsByHex[slotOrHex] : slotOrHex;
      if (!slot) {
        return;
      }

      const visual = slot.querySelector(".slot-visual");
      const segmentLayers = slot.__segmentLayers || [];
      const targetColor = slot.dataset.targetColor;
      const isOccupied = Boolean(options && options.occupied);

      const isTint = slot.dataset.type === "Tint";
      const isBase = slot.dataset.type === "Base";
      visual.setAttribute("visible", false);

      if (isOccupied) {
        slot.classList.add("occupied");
        slot.dataset.occupied = "true";
        slot.dataset.fillColorHex = options.colorHex || targetColor;
        if (!isTint) {
          if (isBase) {
            visual.setAttribute("visible", true);
            visual.setAttribute(
              "material",
              "color: #ffffff; opacity: 1; transparent: true; shader: flat; emissive: #ffffff; emissiveIntensity: 0.45; depthTest: false",
            );
          } else {
            visual.setAttribute(
              "material",
              "color: " +
                (options.colorHex || targetColor) +
                "; opacity: 0.72; transparent: true; shader: flat; emissive: " +
                (options.colorHex || targetColor) +
                "; emissiveIntensity: 0.12",
            );
          }
        }
        segmentLayers.forEach(function (segmentLayer, layerIndex) {
          applyLayerStyle(
            segmentLayer,
            getActiveLayerStyle(options.colorHex || targetColor, layerIndex, isTint),
          );
        });
        return;
      }

      slot.classList.remove("occupied");
      delete slot.dataset.occupied;
      delete slot.dataset.fillColorHex;
      if (isBase) {
        visual.setAttribute(
          "material",
          "color: #ffffff; opacity: 0.92; transparent: true; shader: flat; emissive: #ffffff; emissiveIntensity: 0.45; depthTest: false",
        );
      } else {
        visual.setAttribute(
          "material",
          "color: #8a6f4b; opacity: 0.42; transparent: true; shader: flat",
        );
      }
      segmentLayers.forEach(function (segmentLayer, layerIndex) {
        applyLayerStyle(segmentLayer, getInactiveLayerStyle(layerIndex, isTint));
      });
    },

    playSlotFeedback: function playSlotFeedback(slot, colorHex, stateName) {
      if (!slot) {
        return;
      }

      const color = stateName === "error" ? "#ff6b6b" : colorHex || slot.dataset.targetColor || "#ffd43b";
      const segmentLayers = slot.__segmentLayers || [];
      segmentLayers.forEach(function (segmentLayer) {
        if (segmentLayer.__sectorMaterial && segmentLayer.__sectorMaterial.emissive) {
          segmentLayer.__sectorMaterial.emissive.set(color);
          segmentLayer.__sectorMaterial.emissiveIntensity = stateName === "error" ? 0.42 : 0.36;
          segmentLayer.__sectorMaterial.needsUpdate = true;
          setTimeout(function () {
            if (slot.dataset.occupied === "true") {
              segmentLayer.__sectorMaterial.emissive.set(slot.dataset.fillColorHex || slot.dataset.targetColor);
              segmentLayer.__sectorMaterial.emissiveIntensity = 0.2;
            } else {
              segmentLayer.__sectorMaterial.emissive.setHex(0x000000);
              segmentLayer.__sectorMaterial.emissiveIntensity = 0;
            }
            segmentLayer.__sectorMaterial.needsUpdate = true;
          }, 420);
        }
      });
    },

    clearColor: function clearColor(colorHex, revealName) {
      this.setSlotState(colorHex, { occupied: false, revealName: Boolean(revealName) });
    },

    occupyColor: function occupyColor(colorHex, fillColorHex) {
      this.setSlotState(colorHex, {
        occupied: true,
        revealName: true,
        colorHex: fillColorHex || colorHex,
      });
    },

    getSlotByColor: function getSlotByColor(colorHex) {
      return this.slotsByHex[colorHex] || null;
    },
  });
})();
