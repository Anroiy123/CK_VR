(function () {
  if (!window.AFRAME) {
    return;
  }

  function createWoodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "#9b7650");
    gradient.addColorStop(0.45, "#76583c");
    gradient.addColorStop(1, "#b58a5e");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    for (let line = 0; line < 34; line += 1) {
      const y = line * 8 + Math.sin(line * 1.7) * 3;
      context.strokeStyle = line % 3 === 0 ? "rgba(63, 41, 25, 0.22)" : "rgba(245, 210, 150, 0.12)";
      context.lineWidth = line % 3 === 0 ? 1.6 : 0.8;
      context.beginPath();
      context.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) {
        context.lineTo(x, y + Math.sin(x * 0.045 + line) * 4);
      }
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.4, 1.2);
    texture.anisotropy = 4;
    return texture;
  }

  function appendBox(parent, options) {
    const box = document.createElement("a-box");
    box.setAttribute("width", options.width);
    box.setAttribute("height", options.height);
    box.setAttribute("depth", options.depth);
    box.setAttribute("position", options.position);
    box.setAttribute("material", options.material);
    if (options.shadow) {
      box.setAttribute("shadow", options.shadow);
    }
    parent.appendChild(box);
    return box;
  }

  function appendCylinder(parent, options) {
    const cylinder = document.createElement("a-cylinder");
    cylinder.setAttribute("radius", options.radius);
    cylinder.setAttribute("height", options.height);
    cylinder.setAttribute("position", options.position);
    cylinder.setAttribute("material", options.material);
    if (options.rotation) {
      cylinder.setAttribute("rotation", options.rotation);
    }
    if (options.shadow) {
      cylinder.setAttribute("shadow", options.shadow);
    }
    parent.appendChild(cylinder);
    return cylinder;
  }

  function appendPlane(parent, options) {
    const plane = document.createElement("a-plane");
    plane.setAttribute("width", options.width);
    plane.setAttribute("height", options.height);
    plane.setAttribute("position", options.position);
    plane.setAttribute("rotation", options.rotation);
    plane.setAttribute("material", options.material);
    parent.appendChild(plane);
    return plane;
  }

  AFRAME.registerComponent("color-shelf", {
    schema: {
      width: { type: "number", default: 2.08 },
      height: { type: "number", default: 0.72 },
      depth: { type: "number", default: 0.74 },
    },

    init: function init() {
      const woodMaterial = new THREE.MeshPhysicalMaterial({
        map: createWoodTexture(),
        color: 0xffffff,
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 0.28,
        clearcoatRoughness: 0.36,
      });
      const topMesh = new THREE.Mesh(
        new THREE.BoxGeometry(this.data.width, 0.075, this.data.depth),
        woodMaterial,
      );
      topMesh.position.set(0, this.data.height, 0);
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      this.el.object3D.add(topMesh);
      this.tableTopMesh = topMesh;

      appendBox(this.el, {
        width: this.data.width + 0.08,
        height: "0.045",
        depth: this.data.depth + 0.09,
        position: "0 " + (this.data.height - 0.035) + " 0",
        material: "color: #4a3829; roughness: 0.48; metalness: 0.08",
        shadow: "cast: true; receive: true",
      });

      appendBox(this.el, {
        width: this.data.width + 0.12,
        height: "0.035",
        depth: "0.055",
        position: "0 " + (this.data.height + 0.045) + " " + -(this.data.depth / 2 + 0.025),
        material: "color: #3a2a1f; roughness: 0.44; metalness: 0.1",
        shadow: "cast: true; receive: true",
      });

      appendBox(this.el, {
        width: this.data.width + 0.12,
        height: "0.035",
        depth: "0.055",
        position: "0 " + (this.data.height + 0.045) + " " + (this.data.depth / 2 + 0.025),
        material: "color: #3a2a1f; roughness: 0.44; metalness: 0.1",
        shadow: "cast: true; receive: true",
      });

      appendBox(this.el, {
        width: "0.055",
        height: "0.035",
        depth: this.data.depth + 0.12,
        position: -(this.data.width / 2 + 0.025) + " " + (this.data.height + 0.045) + " 0",
        material: "color: #3a2a1f; roughness: 0.44; metalness: 0.1",
        shadow: "cast: true; receive: true",
      });

      appendBox(this.el, {
        width: "0.055",
        height: "0.035",
        depth: this.data.depth + 0.12,
        position: this.data.width / 2 + 0.025 + " " + (this.data.height + 0.045) + " 0",
        material: "color: #3a2a1f; roughness: 0.44; metalness: 0.1",
        shadow: "cast: true; receive: true",
      });

      const legPositions = [
        [-(this.data.width / 2 - 0.08), this.data.height / 2, -(this.data.depth / 2 - 0.08)],
        [this.data.width / 2 - 0.08, this.data.height / 2, -(this.data.depth / 2 - 0.08)],
        [-(this.data.width / 2 - 0.08), this.data.height / 2, this.data.depth / 2 - 0.08],
        [this.data.width / 2 - 0.08, this.data.height / 2, this.data.depth / 2 - 0.08],
      ];

      legPositions.forEach(function (legPosition) {
        appendCylinder(this.el, {
          radius: "0.032",
          height: this.data.height,
          position: legPosition.join(" "),
          material: "color: #211913; roughness: 0.4; metalness: 0.35",
          shadow: "cast: true; receive: true",
        });
        appendCylinder(this.el, {
          radius: "0.052",
          height: "0.028",
          position: legPosition[0] + " 0.018 " + legPosition[2],
          material: "color: #15100d; roughness: 0.5; metalness: 0.28",
          shadow: "cast: true; receive: true",
        });
      }.bind(this));

      appendPlane(this.el, {
        rotation: "-90 0 0",
        width: String(this.data.width * 1.26),
        height: String(this.data.depth * 1.36),
        position: "0 0.012 0",
        material: "color: #000000; opacity: 0.24; transparent: true; shader: flat",
      });

      appendPlane(this.el, {
        rotation: "-90 0 0",
        width: String(this.data.width * 0.82),
        height: String(this.data.depth * 0.62),
        position: "0 " + (this.data.height + 0.04) + " 0",
        material: "color: #f0d7a1; opacity: 0.13; transparent: true; shader: flat; depthWrite: false",
      });
    },
  });
})();
