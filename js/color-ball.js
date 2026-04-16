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
    },

    init: function init() {
      this.el.classList.add("color-ball-entity", "grabbable", "interactive");
      this.el.dataset.colorHex = this.data.colorHex;

      this.el.setAttribute("geometry", {
        primitive: "sphere",
        radius: 0.09,
        segmentsWidth: 16,
        segmentsHeight: 12,
      });
      this.el.setAttribute("material", {
        color: this.data.colorHex,
        metalness: 0.3,
        roughness: 0.5,
        emissive: this.data.colorHex,
        emissiveIntensity: 0,
      });
      this.el.setAttribute("color-tooltip", {
        colorHex: this.data.colorHex,
        yOffset: 0.28,
        width: 1,
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
      this.el.setAttribute("material", "emissiveIntensity", 0.22);
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
      this.el.setAttribute("material", "emissiveIntensity", 0.34);
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
    },

    setSelected: function setSelected(isSelected) {
      if (isSelected) {
        this.el.dataset.selected = "true";
        this.el.setAttribute("material", "emissiveIntensity", 0.34);
        return;
      }
      delete this.el.dataset.selected;
      if (this.el.dataset.held !== "true") {
        this.el.setAttribute("material", "emissiveIntensity", 0);
      }
    },
  });
})();
