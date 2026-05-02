(function () {
  if (!window.AFRAME) {
    return;
  }

  const SECTOR_SWEEP_DEGREES = 30.6;

  function getWheelAngleRadians(angleDeg) {
    return Math.PI / 2 - (angleDeg * Math.PI) / 180;
  }

  function getArcPoint(radius, radians) {
    return new THREE.Vector2(
      Math.cos(radians) * radius,
      Math.sin(radians) * radius
    );
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
        options.sweepDeg
      )
    );
    const material = new THREE.MeshStandardMaterial({
      color: options.color,
      transparent: true,
      opacity: options.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      emissive: new THREE.Color(options.color),
      emissiveIntensity: 0,
      roughness: 0.5,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = options.zOffset || 0;
    mesh.renderOrder = options.renderOrder || 1;
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
    const fullHex = normalizedHex.length === 3
      ? normalizedHex.split("").map(function (part) {
        return part + part;
      }).join("")
      : normalizedHex;

    return {
      r: parseInt(fullHex.slice(0, 2), 16),
      g: parseInt(fullHex.slice(2, 4), 16),
      b: parseInt(fullHex.slice(4, 6), 16),
    };
  }

  function rgbToHex(rgb) {
    return "#" + [rgb.r, rgb.g, rgb.b].map(function (channel) {
      return clampColorChannel(channel).toString(16).padStart(2, "0");
    }).join("");
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

  function buildSegmentLayerDefinitions(radius) {
    const outerEdge = radius - 0.004;
    const innerEdge = 0.11;
    const layerCount = 4;
    const layerThickness = (outerEdge - innerEdge) / layerCount;
    const layerDefinitions = [];

    for (let index = 0; index < layerCount; index += 1) {
      const outerRadius = outerEdge - layerThickness * index;
      const innerRadius = index === layerCount - 1
        ? innerEdge
        : outerRadius - layerThickness;

      layerDefinitions.push({
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        zOffset: -0.01 + index * 0.001,
      });
    }

    return layerDefinitions;
  }

  function getInactiveLayerStyle(layerIndex) {
    const opacityByLayer = [0.34, 0.28, 0.24, 0.2];
    return {
      color: mixHexColors("#24324f", "#ffffff", layerIndex * 0.08),
      opacity: opacityByLayer[layerIndex] || 0.2,
    };
  }

  function getActiveLayerStyle(fillColorHex, layerIndex) {
    const tintByLayer = [0, 0.28, 0.52, 0.74];
    const opacityByLayer = [1.0, 0.96, 0.92, 0.88];

    return {
      color: mixHexColors(fillColorHex, "#ffffff", tintByLayer[layerIndex] || 0),
      opacity: opacityByLayer[layerIndex] || 0.88,
      emissive: fillColorHex,
      emissiveIntensity: 0.15,
    };
  }

  function applyLayerStyle(layerEl, style) {
    if (!layerEl || !layerEl.__sectorMaterial) {
      return;
    }

    layerEl.__sectorMaterial.color.set(style.color);
    layerEl.__sectorMaterial.opacity = style.opacity;
    if (style.emissive) {
      layerEl.__sectorMaterial.emissive.set(style.emissive);
      layerEl.__sectorMaterial.emissiveIntensity = style.emissiveIntensity || 0;
    } else {
      layerEl.__sectorMaterial.emissive.setHex(0x000000);
      layerEl.__sectorMaterial.emissiveIntensity = 0;
    }
    layerEl.__sectorMaterial.needsUpdate = true;
  }

  function getLabelOffset(slotPosition) {
    const radialDirection = new THREE.Vector3(slotPosition.x, slotPosition.y, 0).normalize();
    return radialDirection.multiplyScalar(0.16).add(new THREE.Vector3(0, 0, 0.08));
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
      this.createCenterLabel();
      this.createSlots();
      this.resetSlots();
    },

    createRing: function createRing() {
      const outerRing = document.createElement("a-torus");
      outerRing.setAttribute("radius", this.data.radius);
      outerRing.setAttribute("radius-tubular", "0.045");
      outerRing.setAttribute("segments-radial", "12");
      outerRing.setAttribute("segments-tubular", "24");
      outerRing.setAttribute("material", "color: #d0d7ff; opacity: 0.34; transparent: true; emissive: #3b5bdb; emissiveIntensity: 0.45");
      this.ringRoot.appendChild(outerRing);

      const innerRing = document.createElement("a-torus");
      innerRing.setAttribute("radius", this.data.radius - 0.12);
      innerRing.setAttribute("radius-tubular", "0.018");
      innerRing.setAttribute("segments-radial", "10");
      innerRing.setAttribute("segments-tubular", "24");
      innerRing.setAttribute("material", "color: #4dabf7; opacity: 0.2; transparent: true; emissive: #4dabf7; emissiveIntensity: 0.35");
      this.ringRoot.appendChild(innerRing);

      const haloRing = document.createElement("a-torus");
      const haloRadius = this.data.radius + 0.02;
      haloRing.setAttribute("radius", String(haloRadius));
      haloRing.setAttribute("radius-tubular", "0.015");
      haloRing.setAttribute("segments-radial", "16");
      haloRing.setAttribute("segments-tubular", "24");
      haloRing.setAttribute("material", "color: #4dabf7; opacity: 0.1; transparent: true; emissive: #4dabf7; emissiveIntensity: 0.08; depthTest: false");
      this.ringRoot.appendChild(haloRing);
    },

    createSegments: function createSegments() {
      const self = this;
      const layerDefinitions = buildSegmentLayerDefinitions(this.data.radius);

      getAllColors().forEach(function (color) {
        const segmentLayers = layerDefinitions.map(function (layerDefinition, layerIndex) {
          const inactiveStyle = getInactiveLayerStyle(layerIndex);
          const segmentLayer = createSectorEntity({
            innerRadius: layerDefinition.innerRadius,
            outerRadius: layerDefinition.outerRadius,
            angleDeg: color.angle,
            sweepDeg: SECTOR_SWEEP_DEGREES,
            color: inactiveStyle.color,
            opacity: inactiveStyle.opacity,
            zOffset: layerDefinition.zOffset,
            renderOrder: 1 + layerIndex,
          });
          segmentLayer.setAttribute("visible", false);
          self.segmentRoot.appendChild(segmentLayer);
          return segmentLayer;
        });

        self.segmentLayersByHex[color.hex] = segmentLayers;
      });
    },

    createCenterLabel: function createCenterLabel() {
      const label = document.createElement("a-text");
      label.setAttribute("value", "Color Wheel");
      label.setAttribute("position", "0 0 0.06");
      label.setAttribute("align", "center");
      label.setAttribute("color", "#f8f9ff");
      label.setAttribute("width", "1.15");
      label.setAttribute("billboard", "");
      this.ringRoot.appendChild(label);
    },

    createSlots: function createSlots() {
      const self = this;
      const slotRadius = this.data.radius - 0.02;

      getAllColors().forEach(function (color) {
        const slotPosition = getSlotPosition(color.angle, slotRadius);
        const labelOffset = getLabelOffset(slotPosition);
        const slot = document.createElement("a-entity");
        slot.id = "slot-" + color.angle;
        slot.classList.add("color-slot", "interactive");
        slot.dataset.targetColor = color.hex;
        slot.dataset.targetName = color.name;
        slot.dataset.angle = String(color.angle);
        slot.dataset.type = color.type;
        slot.setAttribute("position", vec3ToString(new THREE.Vector3(slotPosition.x, slotPosition.y, slotPosition.z)));
        slot.setAttribute("geometry", "primitive: cylinder; radius: 0.14; height: 0.1");
        slot.setAttribute("material", "color: #ffffff; opacity: 0.01; transparent: true; side: double");
        slot.setAttribute("visible", false);
        slot.__segmentLayers = self.segmentLayersByHex[color.hex] || [];

        const visual = document.createElement("a-cylinder");
        visual.classList.add("slot-visual");
        visual.setAttribute("radius", "0.052");
        visual.setAttribute("height", "0.024");
        visual.setAttribute("rotation", "90 0 0");
        visual.setAttribute("position", "0 0 -0.01");
        visual.setAttribute("material", "color: #d0d7ff; opacity: 0.16; transparent: true; shader: flat");
        slot.appendChild(visual);

        const label = document.createElement("a-text");
        label.classList.add("slot-label");
        label.setAttribute("value", "?");
        label.setAttribute("position", vec3ToString(labelOffset));
        label.setAttribute("align", "center");
        label.setAttribute("color", "#ffffff");
        label.setAttribute("width", "0.7");
        label.setAttribute("material", "shader: flat; depthTest: false");
        label.setAttribute("billboard", "");
        slot.appendChild(label);

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
      this.updateVisibleSlots(getVisibleColorsForGame(level), false);
    },

    prepareFreePlay: function prepareFreePlay() {
      this.updateVisibleSlots(getAllColors(), true);
    },

    updateVisibleSlots: function updateVisibleSlots(colors, revealName) {
      const visibleHexes = new Set(colors.map(function (color) {
        return color.hex;
      }));
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
          self.setSlotState(slot, { occupied: true, revealName: true, colorHex: color.hex });
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
      const label = slot.querySelector(".slot-label");
      const segmentLayers = slot.__segmentLayers || [];
      const targetColor = slot.dataset.targetColor;
      const targetName = slot.dataset.targetName;
      const isOccupied = Boolean(options && options.occupied);
      const revealName = Boolean(options && options.revealName);

      if (isOccupied) {
        slot.classList.add("occupied");
        slot.dataset.occupied = "true";
        visual.setAttribute("material", "color: " + (options.colorHex || targetColor) + "; opacity: 0.24; transparent: true; shader: flat; emissive: " + (options.colorHex || targetColor) + "; emissiveIntensity: 0.24");
        label.setAttribute("value", targetName);
        segmentLayers.forEach(function (segmentLayer, layerIndex) {
          applyLayerStyle(segmentLayer, getActiveLayerStyle(options.colorHex || targetColor, layerIndex));
        });
        return;
      }

      slot.classList.remove("occupied");
      delete slot.dataset.occupied;
      visual.setAttribute("material", "color: #d0d7ff; opacity: 0.16; transparent: true; shader: flat");
      label.setAttribute("value", revealName ? targetName : "?");
      segmentLayers.forEach(function (segmentLayer, layerIndex) {
        applyLayerStyle(segmentLayer, getInactiveLayerStyle(layerIndex));
      });
    },

    clearColor: function clearColor(colorHex, revealName) {
      this.setSlotState(colorHex, { occupied: false, revealName: Boolean(revealName) });
    },

    occupyColor: function occupyColor(colorHex, fillColorHex) {
      this.setSlotState(colorHex, { occupied: true, revealName: true, colorHex: fillColorHex || colorHex });
    },

    getSlotByColor: function getSlotByColor(colorHex) {
      return this.slotsByHex[colorHex] || null;
    },
  });
})();
