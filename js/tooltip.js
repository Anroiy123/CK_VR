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

      const materials = Array.isArray(object3D.material)
        ? object3D.material
        : [object3D.material];
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
      this.tooltipEl.setAttribute(
        "position",
        this.data.xOffset + " " + this.data.yOffset + " " + this.data.zOffset,
      );

      // Clean, very dark glass background for high contrast
      const background = document.createElement("a-plane");
      background.setAttribute("width", this.data.width);
      background.setAttribute("height", this.data.height);
      background.setAttribute("position", "0 0 0");
      background.setAttribute("color", "#0b1120"); // Deep dark navy/obsidian
      background.setAttribute("opacity", "0.95");
      background.setAttribute(
        "material",
        "shader: flat; depthTest: false; depthWrite: false; transparent: true",
      );
      this.tooltipEl.appendChild(background);

      // Sleek top neon accent line (adjusted to not overlap with left bar)
      const topBar = document.createElement("a-plane");
      topBar.setAttribute("width", String(this.data.width - 0.02));
      topBar.setAttribute("height", "0.02");
      topBar.setAttribute(
        "position",
        "0.01 " + (this.data.height / 2 - 0.01) + " 0.01",
      );
      topBar.setAttribute("color", "#00d4ff");
      topBar.setAttribute(
        "material",
        "shader: flat; depthTest: false; depthWrite: false; emissive: #00d4ff; emissiveIntensity: 0.8",
      );
      this.tooltipEl.appendChild(topBar);

      // Sleek left neon accent line
      const leftBar = document.createElement("a-plane");
      leftBar.setAttribute("width", "0.02");
      leftBar.setAttribute("height", this.data.height);
      leftBar.setAttribute("position", -this.data.width / 2 + 0.01 + " 0 0.01");
      leftBar.setAttribute("color", "#ff00ff");
      leftBar.setAttribute(
        "material",
        "shader: flat; depthTest: false; depthWrite: false; emissive: #ff00ff; emissiveIntensity: 0.8",
      );
      this.tooltipEl.appendChild(leftBar);

      this.titleEl = document.createElement("a-text");
      this.titleEl.setAttribute(
        "position",
        "0 " + this.data.height * 0.22 + " 0.02",
      );
      this.titleEl.setAttribute("align", "center");
      this.titleEl.setAttribute("color", "#ffff00"); // Pure bold yellow
      this.titleEl.setAttribute("width", String(this.data.width * 0.9)); // Keep inside box (padding)
      this.titleEl.setAttribute("wrap-count", "22"); // Make font larger
      this.titleEl.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Exo2Bold.fnt",
      );
      this.titleEl.setAttribute(
        "material",
        "shader: flat; depthTest: false; depthWrite: false; transparent: true",
      );
      this.tooltipEl.appendChild(this.titleEl);

      this.theoryEl = document.createElement("a-text");
      this.theoryEl.setAttribute(
        "position",
        "0 " + -this.data.height * 0.1 + " 0.02",
      );
      this.theoryEl.setAttribute("align", "center");
      this.theoryEl.setAttribute("color", "#ffffff"); // Pure white
      this.theoryEl.setAttribute("width", String(this.data.width * 0.85)); // Generous padding so text never overflows
      this.theoryEl.setAttribute("wrap-count", "35"); // Makes theory text bigger
      this.theoryEl.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Exo2Bold.fnt",
      ); // Use bold font for readability
      this.theoryEl.setAttribute("line-height", "60"); // Better spacing between lines
      this.theoryEl.setAttribute(
        "material",
        "shader: flat; depthTest: false; depthWrite: false; transparent: true",
      );
      this.tooltipEl.appendChild(this.theoryEl);

      const cameraEl = document.querySelector("#camera");
      (cameraEl || this.el).appendChild(this.tooltipEl);
      this.tooltipEl.addEventListener(
        "loaded",
        function () {
          promoteTooltipObject(this.tooltipEl.object3D);
        }.bind(this),
      );
      this.tooltipEl.addEventListener(
        "object3dset",
        function () {
          promoteTooltipObject(this.tooltipEl.object3D);
        }.bind(this),
      );

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
      this.tooltipEl.setAttribute(
        "animation__tooltip",
        "property: scale; from: 0.85 0.85 0.85; to: 1 1 1; dur: 180; easing: easeOutQuad",
      );
      activeTooltipComponent = this;
    },

    hide: function hide() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
      }
      this.hideTimer = setTimeout(
        function () {
          this.tooltipEl.setAttribute("visible", false);
          if (activeTooltipComponent === this) {
            activeTooltipComponent = null;
          }
        }.bind(this),
        90,
      );
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
      this.hideTimer = setTimeout(
        function () {
          this.tooltipEl.setAttribute("visible", false);
        }.bind(this),
        duration || 1800,
      );
    },
  });
})();
