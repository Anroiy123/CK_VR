(function () {
  if (!window.AFRAME) {
    return;
  }

  AFRAME.registerComponent("vr-button", {
    schema: {
      label: { type: "string", default: "BUTTON" },
      action: { type: "string", default: "" },
      width: { type: "number", default: 0.92 },
      height: { type: "number", default: 0.32 },
      bgColor: { type: "string", default: "#e64980" },
      hoverColor: { type: "string", default: "#f06595" },
    },

    init: function init() {
      this.el.classList.add("interactive", "vr-button-root");

      this.background = document.createElement("a-plane");
      this.background.setAttribute("width", this.data.width);
      this.background.setAttribute("height", this.data.height);
      this.background.setAttribute("color", this.data.bgColor);
      this.background.setAttribute("material", "shader: flat");
      this.background.classList.add("interactive");
      this.el.appendChild(this.background);

      const border = document.createElement("a-plane");
      border.setAttribute("width", this.data.width + 0.04);
      border.setAttribute("height", this.data.height + 0.04);
      border.setAttribute("position", "0 0 -0.005");
      border.setAttribute("color", "#ffffff");
      border.setAttribute("opacity", "0.08");
      border.setAttribute("material", "shader: flat; transparent: true");
      this.el.appendChild(border);

      this.label = document.createElement("a-text");
      this.label.setAttribute("value", this.data.label);
      this.label.setAttribute("position", "0 0 0.01");
      this.label.setAttribute("align", "center");
      this.label.setAttribute("color", "#ffffff");
      this.label.setAttribute("width", String(this.data.width * 2.2));
      this.el.appendChild(this.label);

      this.el.addEventListener("mouseenter", this.onEnter.bind(this));
      this.el.addEventListener("mouseleave", this.onLeave.bind(this));
      this.el.addEventListener("click", this.onClick.bind(this));
    },

    onEnter: function onEnter() {
      this.background.setAttribute("color", this.data.hoverColor);
      this.el.object3D.scale.set(1.04, 1.04, 1.04);
    },

    onLeave: function onLeave() {
      this.background.setAttribute("color", this.data.bgColor);
      this.el.object3D.scale.set(1, 1, 1);
    },

    onClick: function onClick() {
      if (window.SoundManager) {
        SoundManager.play("click");
      }
      if (this.data.action) {
        this.el.sceneEl.emit(this.data.action);
      }
    },
  });
})();
