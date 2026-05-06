(function () {
  if (!window.AFRAME) {
    return;
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
        radius: 0.068,
        segmentsWidth: 24,
        segmentsHeight: 18,
      });
      this.el.setAttribute("material", {
        color: this.data.colorHex,
        metalness: 0.3,
        roughness: 0.5,
        emissive: this.data.colorHex,
        emissiveIntensity: 0,
      });

      var self = this;
      this.el.addEventListener("object3dset", function () {
        self.el.object3D.traverse(function (node) {
          if (node.isMesh && node.material) {
            var oldMat = node.material;
            var newMat = new THREE.MeshPhysicalMaterial({
              color: oldMat.color,
              metalness: self.data.isWaste ? 0.1 : 0.45,
              roughness: self.data.isWaste ? 0.9 : 0.28,
              emissive: oldMat.emissive,
              emissiveIntensity: oldMat.emissiveIntensity,
              transparent: oldMat.transparent,
              opacity: oldMat.opacity,
              side: oldMat.side,
              depthWrite: oldMat.depthWrite,
              clearcoat: self.data.isWaste ? 0.0 : 0.4,
              clearcoatRoughness: self.data.isWaste ? 0.8 : 0.15,
              iridescence: self.data.isWaste ? 0.0 : 0.8,
              iridescenceIOR: 1.3,
              iridescenceThicknessRange: [300, 500],
            });
            node.material = newMat;
            // Sync the A-Frame material component's internal reference so
            // setAttribute("material", "emissiveIntensity", ...) updates the right object.
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

    onEnter: function onEnter() {
      if (this.el.dataset.locked === "true") {
        return;
      }
      this.el.setAttribute("material", "emissiveIntensity", 0.4);
    },

    onLeave: function onLeave() {
      if (this.el.dataset.selected === "true") {
        return;
      }
      this.el.setAttribute("material", "emissiveIntensity", 0);
    },

    onGrabStart: function onGrabStart() {
      const tooltip = this.el.components["color-tooltip"];
      this.el.dataset.held = "true";
      this.el.object3D.scale.set(1.06, 1.06, 1.06);
      this.el.setAttribute("material", "emissiveIntensity", 0.55);
      
      this.el.object3D.traverse(function(node) {
        if (node.isMesh && node.material) {
          node.material.depthTest = false;
        }
      });
      
      if (tooltip) {
        tooltip.hideImmediate();
      }
    },

    onGrabEnd: function onGrabEnd() {
      delete this.el.dataset.held;
      delete this.el.dataset.selected;
      this.el.object3D.scale.set(1, 1, 1);
      if (this.el.dataset.locked !== "true") {
        this.el.setAttribute("material", "emissiveIntensity", 0);
      }
      
      this.el.object3D.traverse(function(node) {
        if (node.isMesh && node.material) {
          node.material.depthTest = true;
        }
      });
    },

    setSelected: function setSelected(isSelected) {
      if (isSelected) {
        this.el.dataset.selected = "true";
        this.el.setAttribute("material", "emissiveIntensity", 0.55);
        return;
      }
      delete this.el.dataset.selected;
      if (this.el.dataset.held !== "true") {
        this.el.setAttribute("material", "emissiveIntensity", 0);
      }
    },

    removeBall: function removeBall() {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    },
  });
})();
