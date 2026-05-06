(function () {
  if (!window.AFRAME) {
    return;
  }

  var WALL_ART = [
    { position: "-2.35 1.65 -3.18", color: "#c2410c", accent: "#f8fafc" },
    { position: "0 1.72 -3.19", color: "#2563eb", accent: "#facc15" },
    { position: "2.35 1.65 -3.18", color: "#15803d", accent: "#fb7185" },
  ];

  var SPECTATORS = [
    { position: "-2.95 0 -1.05", rotation: "0 46 0", scale: 1.02 },
    { position: "-2.55 0 -2.05", rotation: "0 28 0", scale: 0.94 },
    { position: "2.95 0 -1.05", rotation: "0 -46 0", scale: 1.03 },
    { position: "2.52 0 -2.0", rotation: "0 -28 0", scale: 0.95 },
    { position: "-1.55 0 -3.0", rotation: "0 8 0", scale: 0.9 },
    { position: "1.55 0 -3.0", rotation: "0 -8 0", scale: 0.92 },
    { position: "-3.35 0 0.18", rotation: "0 72 0", scale: 0.88 },
    { position: "3.35 0 0.18", rotation: "0 -72 0", scale: 0.88 },
  ];

  function appendBox(parent, options) {
    var box = document.createElement("a-box");
    box.setAttribute("width", options.width);
    box.setAttribute("height", options.height);
    box.setAttribute("depth", options.depth);
    box.setAttribute("position", options.position);
    box.setAttribute("material", options.material);
    if (options.rotation) {
      box.setAttribute("rotation", options.rotation);
    }
    parent.appendChild(box);
    return box;
  }

  function appendPlane(parent, options) {
    var plane = document.createElement("a-plane");
    plane.setAttribute("width", options.width);
    plane.setAttribute("height", options.height);
    plane.setAttribute("position", options.position);
    plane.setAttribute("rotation", options.rotation);
    plane.setAttribute("material", options.material);
    parent.appendChild(plane);
    return plane;
  }

  function appendCylinder(parent, options) {
    var cylinder = document.createElement("a-cylinder");
    cylinder.setAttribute("radius", options.radius);
    cylinder.setAttribute("height", options.height);
    cylinder.setAttribute("position", options.position);
    cylinder.setAttribute("material", options.material);
    if (options.rotation) {
      cylinder.setAttribute("rotation", options.rotation);
    }
    parent.appendChild(cylinder);
    return cylinder;
  }

  function appendSphere(parent, options) {
    var sphere = document.createElement("a-sphere");
    sphere.setAttribute("radius", options.radius);
    sphere.setAttribute("position", options.position);
    sphere.setAttribute("material", options.material);
    parent.appendChild(sphere);
    return sphere;
  }

  function createWallArt(parent, art) {
    var group = document.createElement("a-entity");
    group.setAttribute("position", art.position);
    parent.appendChild(group);

    appendBox(group, {
      width: "0.98",
      height: "0.68",
      depth: "0.045",
      position: "0 0 0",
      material: "color: #3f3428; roughness: 0.7; metalness: 0.05",
    });
    appendPlane(group, {
      width: "0.82",
      height: "0.52",
      position: "0 0 0.028",
      rotation: "0 0 0",
      material: "color: " + art.color + "; roughness: 0.45; metalness: 0.02",
    });
    appendPlane(group, {
      width: "0.36",
      height: "0.11",
      position: "0.1 0.08 0.032",
      rotation: "0 0 -18",
      material: "color: " + art.accent + "; roughness: 0.35; metalness: 0.05",
    });
    appendPlane(group, {
      width: "0.12",
      height: "0.12",
      position: "-0.2 -0.1 0.034",
      rotation: "0 0 45",
      material: "color: #111827; roughness: 0.45; metalness: 0.02",
    });
  }

  function createSpectator(parent, spectator) {
    var group = document.createElement("a-entity");
    group.setAttribute("position", spectator.position);
    group.setAttribute("rotation", spectator.rotation);
    group.setAttribute("scale", spectator.scale + " " + spectator.scale + " " + spectator.scale);
    group.classList.add("gallery-spectator");
    parent.appendChild(group);

    appendCylinder(group, {
      radius: "0.13",
      height: "0.72",
      position: "0 0.72 0",
      material: "color: #27211d; roughness: 0.85; metalness: 0.02",
    });
    appendSphere(group, {
      radius: "0.105",
      position: "0 1.17 0",
      material: "color: #3a2f29; roughness: 0.9; metalness: 0.01",
    });
    appendCylinder(group, {
      radius: "0.035",
      height: "0.52",
      position: "-0.07 0.26 0",
      material: "color: #1f2933; roughness: 0.85; metalness: 0.01",
    });
    appendCylinder(group, {
      radius: "0.035",
      height: "0.52",
      position: "0.07 0.26 0",
      material: "color: #1f2933; roughness: 0.85; metalness: 0.01",
    });

    var leftArm = appendCylinder(group, {
      radius: "0.026",
      height: "0.48",
      position: "-0.16 0.76 0.03",
      rotation: "58 0 -28",
      material: "color: #27211d; roughness: 0.85; metalness: 0.02",
    });
    var rightArm = appendCylinder(group, {
      radius: "0.026",
      height: "0.48",
      position: "0.16 0.76 0.03",
      rotation: "58 0 28",
      material: "color: #27211d; roughness: 0.85; metalness: 0.02",
    });

    group.__applause = {
      leftArm: leftArm,
      rightArm: rightArm,
      baseY: group.object3D.position.y,
    };

    return group;
  }

  AFRAME.registerComponent("exhibition-room", {
    init: function init() {
      this.spectators = [];
      this.applauseUntil = 0;
      this.isApplauding = false;
      this.onLevelComplete = this.startApplause.bind(this);

      appendPlane(this.el, {
        width: "9",
        height: "8",
        position: "0 0 -0.7",
        rotation: "-90 0 0",
        material: "color: #b9aa96; roughness: 0.76; metalness: 0.03",
      });

      appendBox(this.el, {
        width: "9",
        height: "3.2",
        depth: "0.12",
        position: "0 1.6 -3.35",
        material: "color: #e8dfd2; roughness: 0.88; metalness: 0.01",
      });

      appendBox(this.el, {
        width: "0.12",
        height: "3.2",
        depth: "7.6",
        position: "-4.45 1.6 -0.6",
        material: "color: #ded2c2; roughness: 0.88; metalness: 0.01",
      });

      appendBox(this.el, {
        width: "0.12",
        height: "3.2",
        depth: "7.6",
        position: "4.45 1.6 -0.6",
        material: "color: #ded2c2; roughness: 0.88; metalness: 0.01",
      });

      appendBox(this.el, {
        width: "9",
        height: "0.08",
        depth: "7.6",
        position: "0 3.18 -0.6",
        material: "color: #f1eadf; roughness: 0.9; metalness: 0.01",
      });

      appendBox(this.el, {
        width: "3.0",
        height: "0.12",
        depth: "0.78",
        position: "0 0.06 -2.45",
        material: "color: #6f6255; roughness: 0.62; metalness: 0.05",
      });

      appendBox(this.el, {
        width: "0.34",
        height: "0.035",
        depth: "5.9",
        position: "-3.95 2.92 -0.6",
        material: "color: #3b332b; roughness: 0.6; metalness: 0.25",
      });

      appendBox(this.el, {
        width: "0.34",
        height: "0.035",
        depth: "5.9",
        position: "3.95 2.92 -0.6",
        material: "color: #3b332b; roughness: 0.6; metalness: 0.25",
      });

      WALL_ART.forEach(function (art) {
        createWallArt(this.el, art);
      }, this);

      SPECTATORS.forEach(function (spectator) {
        var spectatorEl = createSpectator(this.el, spectator);
        this.spectators.push(spectatorEl);
      }, this);

      this.el.sceneEl.addEventListener("level-complete-celebration", this.onLevelComplete);
    },

    remove: function remove() {
      if (this.el.sceneEl) {
        this.el.sceneEl.removeEventListener("level-complete-celebration", this.onLevelComplete);
      }
    },

    startApplause: function startApplause() {
      this.applauseUntil = performance.now() + 2600;
      this.isApplauding = true;
    },

    tick: function tick(time) {
      if (!this.isApplauding) {
        return;
      }

      if (performance.now() > this.applauseUntil) {
        this.isApplauding = false;
        this.resetSpectators();
        return;
      }

      var clap = Math.sin(time * 0.026);
      var bounce = Math.abs(Math.sin(time * 0.012)) * 0.035;
      this.spectators.forEach(function (spectatorEl, index) {
        var applause = spectatorEl.__applause;
        if (!applause) {
          return;
        }

        var phase = index * 0.45;
        var localClap = Math.sin(time * 0.026 + phase);
        var armAngle = 18 + localClap * 18;
        spectatorEl.object3D.position.y = applause.baseY + bounce;
        applause.leftArm.setAttribute("rotation", "74 0 " + (-armAngle));
        applause.rightArm.setAttribute("rotation", "74 0 " + armAngle);
        applause.leftArm.setAttribute("position", (-0.11 - clap * 0.025) + " 0.86 0.08");
        applause.rightArm.setAttribute("position", (0.11 + clap * 0.025) + " 0.86 0.08");
      });
    },

    resetSpectators: function resetSpectators() {
      this.spectators.forEach(function (spectatorEl) {
        var applause = spectatorEl.__applause;
        if (!applause) {
          return;
        }
        spectatorEl.object3D.position.y = applause.baseY;
        applause.leftArm.setAttribute("position", "-0.16 0.76 0.03");
        applause.leftArm.setAttribute("rotation", "58 0 -28");
        applause.rightArm.setAttribute("position", "0.16 0.76 0.03");
        applause.rightArm.setAttribute("rotation", "58 0 28");
      });
    },
  });
})();
