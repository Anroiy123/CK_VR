(function () {
  if (!window.AFRAME) {
    return;
  }

  const BALL_RADIUS = 0.074;

  function getBallMaterialAttributes(colorHex, isWaste) {
    return {
      color: colorHex,
      metalness: isWaste ? 0.08 : 0.25,
      roughness: isWaste ? 0.82 : 0.18,
      emissive: colorHex,
      emissiveIntensity: 0,
    };
  }

  function getBallPhysicalMaterialOptions(colorHex, isWaste) {
    return Object.assign(getBallMaterialAttributes(colorHex, isWaste), {
      clearcoat: isWaste ? 0.05 : 0.72,
      clearcoatRoughness: isWaste ? 0.7 : 0.12,
      iridescence: isWaste ? 0 : 0.35,
      iridescenceIOR: 1.25,
      iridescenceThicknessRange: [180, 520],
    });
  }

  function setHeldRenderPriority(el, enabled) {
    el.object3D.traverse(function (node) {
      if (node.isMesh && node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];

        if (enabled) {
          if (!node.userData.colorBallRenderState) {
            node.userData.colorBallRenderState = {
              renderOrder: node.renderOrder,
              materials: materials.map(function (material) {
                return {
                  material: material,
                  transparent: material.transparent,
                  opacity: material.opacity,
                  depthTest: material.depthTest,
                  depthWrite: material.depthWrite,
                };
              }),
            };
          }
          node.renderOrder = 1000;
          materials.forEach(function (material) {
            material.transparent = true;
            material.opacity = 1;
            material.depthTest = false;
            material.depthWrite = false;
            material.needsUpdate = true;
          });
          return;
        }

        const renderState = node.userData.colorBallRenderState;
        if (renderState) {
          node.renderOrder = renderState.renderOrder;
          renderState.materials.forEach(function (materialState) {
            materialState.material.transparent = materialState.transparent;
            materialState.material.opacity = materialState.opacity;
            materialState.material.depthTest = materialState.depthTest;
            materialState.material.depthWrite = materialState.depthWrite;
            materialState.material.needsUpdate = true;
          });
          delete node.userData.colorBallRenderState;
        }
      }
    });
  }

  AFRAME.registerComponent("color-ball", {
    schema: {
      colorHex: { type: "string" },
      colorName: { type: "string" },
      targetAngle: { type: "number" },
      originalPosition: { type: "vec3" },
      isWaste: { type: "boolean", default: false },
    },

    init: function init() {
      this.el.classList.add("color-ball-entity", "grabbable", "interactive");
      this.el.dataset.colorHex = this.data.colorHex;
      this.el.dataset.waste = String(this.data.isWaste);

      this.el.setAttribute("geometry", {
        primitive: "sphere",
        radius: BALL_RADIUS,
        segmentsWidth: 48,
        segmentsHeight: 24,
      });
      this.el.setAttribute("material", getBallMaterialAttributes(this.data.colorHex, this.data.isWaste));
      this.el.setAttribute("shadow", "cast: true; receive: false");
      this.createVisualAccents();

      var self = this;
      this.el.addEventListener("object3dset", function () {
        self.el.object3D.traverse(function (node) {
          if (node.el && node.el !== self.el) {
            return;
          }
          if (node.isMesh && node.material) {
            var oldMat = node.material;
            var newMat = new THREE.MeshPhysicalMaterial(
              Object.assign(getBallPhysicalMaterialOptions(self.data.colorHex, self.data.isWaste), {
                color: oldMat.color,
                emissive: oldMat.emissive,
                transparent: oldMat.transparent,
                opacity: oldMat.opacity,
                side: oldMat.side,
                depthWrite: oldMat.depthWrite,
              }),
            );
            node.material = newMat;
            var matComp = self.el.components && self.el.components.material;
            if (matComp) {
              matComp.material = newMat;
            }
          }
        });
      });
      this.el.setAttribute("color-tooltip", {
        colorHex: this.data.colorHex,
        xOffset: -1.15,
        yOffset: -0.18,
        zOffset: -1.05,
        width: 0.62,
        height: 0.34,
      });

      this.el.addEventListener("mouseenter", this.onEnter.bind(this));
      this.el.addEventListener("mouseleave", this.onLeave.bind(this));
      this.el.addEventListener("grab-start", this.onGrabStart.bind(this));
      this.el.addEventListener("grab-end", this.onGrabEnd.bind(this));
    },

    createVisualAccents: function createVisualAccents() {
      this.hoverRingEl = document.createElement("a-torus");
      this.hoverRingEl.setAttribute("radius", "0.092");
      this.hoverRingEl.setAttribute("radius-tubular", "0.0045");
      this.hoverRingEl.setAttribute("segments-radial", "10");
      this.hoverRingEl.setAttribute("segments-tubular", "40");
      this.hoverRingEl.setAttribute("position", "0 0 0");
      this.hoverRingEl.setAttribute("rotation", "90 0 0");
      this.hoverRingEl.setAttribute(
        "material",
        "color: #fff3b0; opacity: 0.88; transparent: true; shader: flat; depthTest: true; depthWrite: false",
      );
      this.hoverRingEl.setAttribute("visible", false);
      this.el.appendChild(this.hoverRingEl);

      this.shineEl = document.createElement("a-sphere");
      this.shineEl.setAttribute("radius", String(BALL_RADIUS * 0.22));
      this.shineEl.setAttribute("position", "-0.028 0.038 0.052");
      this.shineEl.setAttribute(
        "material",
        "color: #ffffff; opacity: 0.64; transparent: true; shader: flat; depthWrite: false",
      );
      this.el.appendChild(this.shineEl);
    },

    setHoverRingVisible: function setHoverRingVisible(isVisible) {
      if (this.hoverRingEl) {
        this.hoverRingEl.setAttribute("visible", isVisible);
      }
    },

    onEnter: function onEnter() {
      if (this.el.dataset.held === "true") {
        return;
      }
      this.setHoverRingVisible(true);
    },

    onLeave: function onLeave() {
      if (this.el.dataset.held === "true") {
        return;
      }
      this.setHoverRingVisible(false);
    },

    update: function update(oldData) {
      if (!oldData || oldData.colorHex === this.data.colorHex) {
        return;
      }
      var hex = this.data.colorHex;
      var isWaste = this.data.isWaste;
      this.el.dataset.colorHex = hex;
      this.el.dataset.waste = String(isWaste);
      this.el.object3D.traverse(function (node) {
        if (node.isMesh && node.material) {
          node.material.color.set(hex);
          node.material.emissive.set(hex);
          node.material.needsUpdate = true;
        }
      });
    },

    onGrabStart: function onGrabStart() {
      const tooltip = this.el.components["color-tooltip"];
      this.el.dataset.held = "true";
      this.setHoverRingVisible(false);
      this.el.object3D.scale.set(1.08, 1.08, 1.08);
      setHeldRenderPriority(this.el, true);

      if (tooltip) {
        tooltip.hideImmediate();
      }
    },

    onGrabEnd: function onGrabEnd() {
      delete this.el.dataset.held;
      delete this.el.dataset.selected;
      this.setHoverRingVisible(false);
      this.el.object3D.scale.set(1, 1, 1);

      setHeldRenderPriority(this.el, false);
    },

    setSelected: function setSelected(isSelected) {
      if (isSelected) {
        this.el.dataset.selected = "true";
        return;
      }
      delete this.el.dataset.selected;
    },

    removeBall: function removeBall() {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    },
  });
})();
