(function () {
  if (!window.AFRAME) {
    return;
  }

  AFRAME.registerComponent("billboard", {
    tick: (function () {
      const cameraPosition = new THREE.Vector3();

      return function tick() {
        const scene = this.el.sceneEl;
        const camera = scene && scene.camera;
        if (!camera) {
          return;
        }

        camera.getWorldPosition(cameraPosition);
        this.el.object3D.lookAt(cameraPosition);
      };
    })(),
  });

  AFRAME.registerComponent("color-tooltip", {
    schema: {
      colorHex: { type: "string" },
      yOffset: { type: "number", default: 0.42 },
      width: { type: "number", default: 1.38 },
      height: { type: "number", default: 0.72 },
    },

    init: function init() {
      this.hideTimer = null;
      this.tooltipEl = document.createElement("a-entity");
      this.tooltipEl.setAttribute("visible", false);
      this.tooltipEl.setAttribute("position", "0 " + this.data.yOffset + " 0");
      this.tooltipEl.setAttribute("billboard", "");

      const background = document.createElement("a-plane");
      background.setAttribute("width", this.data.width);
      background.setAttribute("height", this.data.height);
      background.setAttribute("color", "#0f1729");
      background.setAttribute("opacity", "0.94");
      background.setAttribute("material", "shader: flat");
      this.tooltipEl.appendChild(background);

      this.titleEl = document.createElement("a-text");
      this.titleEl.setAttribute("position", "0 0.18 0.01");
      this.titleEl.setAttribute("align", "center");
      this.titleEl.setAttribute("color", "#ffd43b");
      this.titleEl.setAttribute("width", "1.55");
      this.tooltipEl.appendChild(this.titleEl);

      this.theoryEl = document.createElement("a-text");
      this.theoryEl.setAttribute("position", "0 -0.08 0.01");
      this.theoryEl.setAttribute("align", "center");
      this.theoryEl.setAttribute("color", "#e9ecef");
      this.theoryEl.setAttribute("width", "1.26");
      this.tooltipEl.appendChild(this.theoryEl);

      this.el.appendChild(this.tooltipEl);

      this.boundShow = this.show.bind(this);
      this.boundHide = this.hide.bind(this);
      this.el.addEventListener("mouseenter", this.boundShow);
      this.el.addEventListener("mouseleave", this.boundHide);
    },

    remove: function remove() {
      this.el.removeEventListener("mouseenter", this.boundShow);
      this.el.removeEventListener("mouseleave", this.boundHide);
    },

    show: function show() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }

      const color = getColorByHex(this.data.colorHex);
      if (!color) {
        return;
      }

      this.titleEl.setAttribute("value", color.name + " (" + color.type + ")");
      this.theoryEl.setAttribute("value", color.theory);
      this.tooltipEl.setAttribute("visible", true);
      this.tooltipEl.setAttribute("scale", "0.85 0.85 0.85");
      this.tooltipEl.setAttribute("animation__tooltip", "property: scale; from: 0.85 0.85 0.85; to: 1 1 1; dur: 180; easing: easeOutQuad");
    },

    hide: function hide() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
      }
      this.hideTimer = setTimeout(function () {
        this.tooltipEl.setAttribute("visible", false);
      }.bind(this), 90);
    },

    showTemporary: function showTemporary(duration) {
      this.show();
      this.hideTimer = setTimeout(function () {
        this.tooltipEl.setAttribute("visible", false);
      }.bind(this), duration || 1800);
    },
  });
})();
