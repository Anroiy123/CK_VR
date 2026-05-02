(function () {
  if (!window.AFRAME) {
    return;
  }

  AFRAME.registerComponent("color-shelf", {
    schema: {
      width: { type: "number", default: 1.36 },
      height: { type: "number", default: 0.72 },
      depth: { type: "number", default: 0.52 },
    },

    init: function init() {
      const top = document.createElement("a-box");
      top.setAttribute("width", this.data.width);
      top.setAttribute("height", "0.06");
      top.setAttribute("depth", this.data.depth);
      top.setAttribute("position", "0 " + this.data.height + " 0");
      top.setAttribute("material", "color: #30475e; metalness: 0.6; roughness: 0.35; emissive: #1a2744; emissiveIntensity: 0.15");
      this.el.appendChild(top);

      const frame = document.createElement("a-box");
      frame.setAttribute("width", this.data.width + 0.06);
      frame.setAttribute("height", "0.03");
      frame.setAttribute("depth", this.data.depth + 0.06);
      frame.setAttribute("position", "0 " + (this.data.height + 0.03) + " 0");
      frame.setAttribute("material", "color: #495057; shader: flat; emissive: #3b5bdb; emissiveIntensity: 0.12");
      this.el.appendChild(frame);

      const legPositions = [
        [-(this.data.width / 2 - 0.08), this.data.height / 2, -(this.data.depth / 2 - 0.08)],
        [this.data.width / 2 - 0.08, this.data.height / 2, -(this.data.depth / 2 - 0.08)],
        [-(this.data.width / 2 - 0.08), this.data.height / 2, this.data.depth / 2 - 0.08],
        [this.data.width / 2 - 0.08, this.data.height / 2, this.data.depth / 2 - 0.08],
      ];

      legPositions.forEach(function (legPosition) {
        const leg = document.createElement("a-cylinder");
        leg.setAttribute("radius", "0.035");
        leg.setAttribute("height", this.data.height);
        leg.setAttribute("position", legPosition.join(" "));
        leg.setAttribute("material", "color: #34495e; shader: flat; emissive: #2b4578; emissiveIntensity: 0.1");
        this.el.appendChild(leg);
      }.bind(this));

      const shadow = document.createElement("a-plane");
      shadow.setAttribute("rotation", "-90 0 0");
      shadow.setAttribute("width", String(this.data.width * 1.14));
      shadow.setAttribute("height", String(this.data.depth * 1.22));
      shadow.setAttribute("position", "0 0.01 0");
      shadow.setAttribute("material", "color: #000000; opacity: 0.18; transparent: true; shader: flat");
      this.el.appendChild(shadow);

      const underglow = document.createElement("a-plane");
      underglow.setAttribute("rotation", "-90 0 0");
      underglow.setAttribute("width", String(this.data.width * 0.86));
      underglow.setAttribute("height", String(this.data.depth * 0.72));
      underglow.setAttribute("position", "0 " + (this.data.height - 0.03) + " 0");
      underglow.setAttribute("material", "color: #4dabf7; emissive: #4dabf7; emissiveIntensity: 0.2; opacity: 0.15; transparent: true; shader: flat; depthTest: false");
      this.el.appendChild(underglow);
    },
  });
})();
