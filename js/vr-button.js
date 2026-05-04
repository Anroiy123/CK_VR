(function () {
  if (!window.AFRAME) {
    return;
  }

  AFRAME.registerComponent("vr-button", {
    schema: {
      label: { type: "string", default: "BUTTON" },
      helper: { type: "string", default: "" },
      action: { type: "string", default: "" },
      width: { type: "number", default: 0.92 },
      height: { type: "number", default: 0.32 },
      bgColor: { type: "string", default: "#e64980" },
      hoverColor: { type: "string", default: "#f06595" },
      labelColor: { type: "string", default: "#ffffff" },
      helperColor: { type: "string", default: "#e9ecef" },
      helperWidth: { type: "number", default: 2.0 },
    },

    init: function init() {
      this.el.classList.add("interactive", "vr-button-root");

      this.isHovering = false;
      this.glowPulseTime = 0;
      this.glowPulseActive = false;

      // Glow plane behind button
      this.glow = document.createElement("a-plane");
      this.glow.setAttribute("width", this.data.width + 0.06);
      this.glow.setAttribute("height", this.data.height + 0.06);
      this.glow.setAttribute("position", "0 0 -0.008");
      this.glow.setAttribute("color", this.data.bgColor);
      this.glow.setAttribute("opacity", "0.12");
      this.glow.setAttribute("material", "shader: flat; transparent: true");
      this.glow.classList.add("interactive");
      this.el.appendChild(this.glow);

      this.background = document.createElement("a-plane");
      this.background.setAttribute("width", this.data.width);
      this.background.setAttribute("height", this.data.height);
      this.background.setAttribute("color", this.data.bgColor);
      this.background.setAttribute("material", "shader: flat");
      this.background.classList.add("interactive");
      this.el.appendChild(this.background);

      var border = document.createElement("a-plane");
      border.setAttribute("width", this.data.width + 0.04);
      border.setAttribute("height", this.data.height + 0.04);
      border.setAttribute("position", "0 0 -0.005");
      border.setAttribute("color", "#ffffff");
      border.setAttribute("opacity", "0.08");
      border.setAttribute("material", "shader: flat; transparent: true");
      this.el.appendChild(border);

      this.label = document.createElement("a-text");
      this.label.setAttribute("value", this.data.label);
      this.label.setAttribute("position", this.data.helper ? "0 0.05 0.01" : "0 0 0.01");
      this.label.setAttribute("align", "center");
      this.label.setAttribute("color", this.data.labelColor);
      this.label.setAttribute("width", String(this.data.width * 2.2));
      this.el.appendChild(this.label);

      if (this.data.helper) {
        this.helper = document.createElement("a-text");
        this.helper.setAttribute("value", this.data.helper);
        this.helper.setAttribute("position", "0 -0.06 0.01");
        this.helper.setAttribute("align", "center");
        this.helper.setAttribute("color", this.data.helperColor);
        this.helper.setAttribute("width", String(this.data.helperWidth));
        this.helper.setAttribute("opacity", "0.92");
        this.el.appendChild(this.helper);
      }

      this.el.addEventListener("mouseenter", this.onEnter.bind(this));
      this.el.addEventListener("mouseleave", this.onLeave.bind(this));
      this.el.addEventListener("click", this.onClick.bind(this));
    },

    onEnter: function onEnter() {
      this.isHovering = true;
      this.background.setAttribute("color", this.data.hoverColor);
      this.el.object3D.scale.set(1.08, 1.08, 1.08);
      this.glow.setAttribute("opacity", "0.25");

      if (!this.glowPulseActive) {
        this.glowPulseActive = true;
        this.glowPulseTime = 0;
        this.pulseGlow();
      }
    },

    onLeave: function onLeave() {
      this.isHovering = false;
      this.glowPulseActive = false;
      this.background.setAttribute("color", this.data.bgColor);
      this.el.object3D.scale.set(1, 1, 1);
      this.glow.setAttribute("opacity", "0.12");
    },

    onClick: function onClick() {
      if (window.SoundManager) {
        SoundManager.play("click");
      }
      if (this.data.action) {
        this.el.sceneEl.emit(this.data.action);
      }
    },

    pulseGlow: function pulseGlow() {
      if (!this.glowPulseActive) {
        return;
      }

      this.glowPulseTime += 0.016;
      var cycle = Math.sin(this.glowPulseTime * Math.PI * 2 / 0.8);
      var pulseOpacity = 0.12 + (cycle + 1) * 0.05;
      if (pulseOpacity > 0.25) {
        pulseOpacity = 0.25;
      }
      this.glow.setAttribute("opacity", String(pulseOpacity));

      if (this.isHovering) {
        requestAnimationFrame(this.pulseGlow.bind(this));
      } else {
        this.glowPulseActive = false;
      }
    },
  });
})();
