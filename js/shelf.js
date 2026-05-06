(function () {
  if (!window.AFRAME) {
    return;
  }

  AFRAME.registerComponent("color-shelf", {
    schema: {
      width: { type: "number", default: 2.08 },
      height: { type: "number", default: 0.72 },
      depth: { type: "number", default: 0.74 },
    },

    init: function init() {
      const top = document.createElement("a-box");
      top.setAttribute("width", this.data.width);
      top.setAttribute("height", "0.06");
      top.setAttribute("depth", this.data.depth);
      top.setAttribute("position", "0 " + this.data.height + " 0");
      top.setAttribute("material", "color: #7b6a55; metalness: 0.08; roughness: 0.72");
      this.el.appendChild(top);

      const frame = document.createElement("a-box");
      frame.setAttribute("width", this.data.width + 0.06);
      frame.setAttribute("height", "0.03");
      frame.setAttribute("depth", this.data.depth + 0.06);
      frame.setAttribute("position", "0 " + (this.data.height + 0.03) + " 0");
      frame.setAttribute("material", "color: #4c3f32; roughness: 0.65; metalness: 0.08");
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
        leg.setAttribute("material", "color: #3b3027; roughness: 0.7; metalness: 0.06");
        this.el.appendChild(leg);
      }.bind(this));

      const shadow = document.createElement("a-plane");
      shadow.setAttribute("rotation", "-90 0 0");
      shadow.setAttribute("width", String(this.data.width * 1.14));
      shadow.setAttribute("height", String(this.data.depth * 1.22));
      shadow.setAttribute("position", "0 0.01 0");
      shadow.setAttribute("material", "color: #000000; opacity: 0.18; transparent: true; shader: flat");
      this.el.appendChild(shadow);

      const inset = document.createElement("a-plane");
      inset.setAttribute("rotation", "-90 0 0");
      inset.setAttribute("width", String(this.data.width * 0.86));
      inset.setAttribute("height", String(this.data.depth * 0.72));
      inset.setAttribute("position", "0 " + (this.data.height + 0.032) + " 0");
      inset.setAttribute("material", "color: #9a8a75; opacity: 0.35; transparent: true; roughness: 0.82; metalness: 0.02");
      this.el.appendChild(inset);
    },
  });
})();
