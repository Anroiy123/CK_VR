(function () {
  if (!window.AFRAME) {
    return;
  }

  let activeTooltipComponent = null;

  function promoteTooltipObject(rootObject3D) {
    if (!rootObject3D) {
      return;
    }

    rootObject3D.traverse(function (object3D) {
      if (!object3D.material) {
        return;
      }

      const materials = Array.isArray(object3D.material) ? object3D.material : [object3D.material];
      materials.forEach(function (material) {
        material.depthTest = false;
        material.depthWrite = false;
        material.transparent = true;
        material.needsUpdate = true;
      });

      object3D.renderOrder = 1000;
    });
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
      xOffset: { type: "number", default: -0.62 },
      yOffset: { type: "number", default: -0.12 },
      zOffset: { type: "number", default: -1.1 },
      width: { type: "number", default: 1.38 },
      height: { type: "number", default: 0.72 },
    },

    init: function init() {
      this.hideTimer = null;
      this.tooltipEl = document.createElement("a-entity");
      this.tooltipEl.setAttribute("visible", false);
      this.tooltipEl.setAttribute("position", this.data.xOffset + " " + this.data.yOffset + " " + this.data.zOffset);

      const background = document.createElement("a-plane");
      background.setAttribute("width", this.data.width);
      background.setAttribute("height", this.data.height);
      background.setAttribute("color", "#0f1729");
      background.setAttribute("opacity", "0.94");
      background.setAttribute("material", "shader: flat; depthTest: false; depthWrite: false; transparent: true");
      this.tooltipEl.appendChild(background);

      this.titleEl = document.createElement("a-text");
      this.titleEl.setAttribute("position", "0 " + (this.data.height * 0.24) + " 0.01");
      this.titleEl.setAttribute("align", "center");
      this.titleEl.setAttribute("color", "#ffd43b");
      this.titleEl.setAttribute("width", String(this.data.width * 1.18));
      this.titleEl.setAttribute("material", "shader: flat; depthTest: false; depthWrite: false; transparent: true");
      this.tooltipEl.appendChild(this.titleEl);

      this.theoryEl = document.createElement("a-text");
      this.theoryEl.setAttribute("position", "0 " + (-this.data.height * 0.12) + " 0.01");
      this.theoryEl.setAttribute("align", "center");
      this.theoryEl.setAttribute("color", "#e9ecef");
      this.theoryEl.setAttribute("width", String(this.data.width * 1.02));
      this.theoryEl.setAttribute("material", "shader: flat; depthTest: false; depthWrite: false; transparent: true");
      this.tooltipEl.appendChild(this.theoryEl);

      const cameraEl = document.querySelector("#camera");
      (cameraEl || this.el).appendChild(this.tooltipEl);
      this.tooltipEl.addEventListener("loaded", function () {
        promoteTooltipObject(this.tooltipEl.object3D);
      }.bind(this));
      this.tooltipEl.addEventListener("object3dset", function () {
        promoteTooltipObject(this.tooltipEl.object3D);
      }.bind(this));

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
      if (this.el.dataset.held === "true") {
        this.hideImmediate();
        return;
      }

      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }

      const color = getColorByHex(this.data.colorHex);
      if (!color) {
        return;
      }

      if (activeTooltipComponent && activeTooltipComponent !== this) {
        activeTooltipComponent.hideImmediate();
      }

      this.titleEl.setAttribute("value", color.name + " (" + color.type + ")");
      this.theoryEl.setAttribute("value", color.theory);
      this.tooltipEl.setAttribute("visible", true);
      this.tooltipEl.setAttribute("scale", "0.85 0.85 0.85");
      this.tooltipEl.setAttribute("animation__tooltip", "property: scale; from: 0.85 0.85 0.85; to: 1 1 1; dur: 180; easing: easeOutQuad");
      activeTooltipComponent = this;
    },

    hide: function hide() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
      }
      this.hideTimer = setTimeout(function () {
        this.tooltipEl.setAttribute("visible", false);
        if (activeTooltipComponent === this) {
          activeTooltipComponent = null;
        }
      }.bind(this), 90);
    },

    hideImmediate: function hideImmediate() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      this.tooltipEl.removeAttribute("animation__tooltip");
      this.tooltipEl.setAttribute("visible", false);
      if (activeTooltipComponent === this) {
        activeTooltipComponent = null;
      }
    },

    showTemporary: function showTemporary(duration) {
      this.show();
      this.hideTimer = setTimeout(function () {
        this.tooltipEl.setAttribute("visible", false);
      }.bind(this), duration || 1800);
    },
  });
})();
