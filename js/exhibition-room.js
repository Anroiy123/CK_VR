(function () {
  if (!window.AFRAME) {
    return;
  }

  var SPECTATORS = [
    { position: "-3.2 0 1.15", scale: 1.02 },
    { position: "-2.25 0 1.78", scale: 0.94 },
    {
      position: "-1.05 0 2.18",
      scale: 0.9,
      modelSrc: "assets/images/ishowspeed_fortnite_skin.glb",
    },
    { position: "1.05 0 2.18", scale: 0.92, modelSrc: "assets/images/mrbeast_fortnite_skin.glb" },
    { position: "2.25 0 1.78", scale: 0.95 },
    { position: "3.2 0 1.15", scale: 1.03 },
    { position: "-3.55 0 2.45", scale: 0.88 },
    { position: "3.55 0 2.45", scale: 0.88 },
  ];

  var SPECTATOR_MODEL_SRC = "assets/npc_character_-_proto_series.glb";
  var EXHIBITION_MODEL_SRC = "assets/Sketchfab_Scene.glb";
  var SPECTATOR_LOOK_TARGET = { x: 0, z: -1.45 };

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

  function parsePosition(position) {
    var parts = String(position).trim().split(/\s+/).map(Number);
    return {
      x: parts[0] || 0,
      y: parts[1] || 0,
      z: parts[2] || 0,
    };
  }

  function getYawToPlayArea(position) {
    var dx = SPECTATOR_LOOK_TARGET.x - position.x;
    var dz = SPECTATOR_LOOK_TARGET.z - position.z;
    return THREE.MathUtils.radToDeg(Math.atan2(dx, dz));
  }

  function keepSingleSpectatorModel(modelObject) {
    modelObject.traverse(function (node) {
      if (!node.name) {
        return;
      }

      if (node.name.indexOf("head_angry") !== -1) {
        node.visible = false;
      }
    });
  }

  function hideBuiltInBenches(modelObject) {
    var benchNodeNames = {
      "Cube.001": true,
      "Cube.002": true,
      "Cube.003": true,
      "Cube.004": true,
    };

    modelObject.traverse(function (node) {
      if (benchNodeNames[node.name]) {
        node.visible = false;
      }
    });
  }

  function createExhibitionModel(parent) {
    var model = document.createElement("a-entity");
    model.setAttribute("gltf-model", "url(" + EXHIBITION_MODEL_SRC + ")");
    model.setAttribute("position", "0 3.2 -0.86");
    model.setAttribute("rotation", "0 0 0");
    model.setAttribute("scale", "3.25 3.25 3.25");
    model.setAttribute("shadow", "cast: false; receive: true");
    model.addEventListener("model-loaded", function () {
      hideBuiltInBenches(model.object3D);
    });
    parent.appendChild(model);
    return model;
  }

  function createSpectator(parent, spectator) {
    var group = document.createElement("a-entity");
    var position = parsePosition(spectator.position);
    group.setAttribute("position", spectator.position);
    group.setAttribute("rotation", "0 " + getYawToPlayArea(position) + " 0");
    group.setAttribute("scale", spectator.scale + " " + spectator.scale + " " + spectator.scale);
    group.classList.add("gallery-spectator");
    parent.appendChild(group);

    var fallback = document.createElement("a-entity");
    group.appendChild(fallback);

    var model = document.createElement("a-entity");
    model.setAttribute("gltf-model", "url(" + (spectator.modelSrc || SPECTATOR_MODEL_SRC) + ")");
    model.setAttribute("position", "0 0 0");
    model.setAttribute("scale", "0.72 0.72 0.72");
    model.setAttribute("shadow", "cast: true; receive: false");
    model.setAttribute("visible", "false");
    model.addEventListener("model-loaded", function () {
      keepSingleSpectatorModel(model.object3D);
      fallback.setAttribute("visible", "false");
      model.setAttribute("visible", "true");
    });
    model.addEventListener("model-error", function () {
      fallback.setAttribute("visible", "true");
      model.setAttribute("visible", "false");
    });
    group.appendChild(model);

    appendCylinder(fallback, {
      radius: "0.13",
      height: "0.72",
      position: "0 0.72 0",
      material: "color: #27211d; roughness: 0.85; metalness: 0.02",
    });
    appendSphere(fallback, {
      radius: "0.105",
      position: "0 1.17 0",
      material: "color: #3a2f29; roughness: 0.9; metalness: 0.01",
    });
    appendCylinder(fallback, {
      radius: "0.035",
      height: "0.52",
      position: "-0.07 0.26 0",
      material: "color: #1f2933; roughness: 0.85; metalness: 0.01",
    });
    appendCylinder(fallback, {
      radius: "0.035",
      height: "0.52",
      position: "0.07 0.26 0",
      material: "color: #1f2933; roughness: 0.85; metalness: 0.01",
    });

    var leftArm = appendCylinder(fallback, {
      radius: "0.026",
      height: "0.48",
      position: "-0.16 0.76 0.03",
      rotation: "58 0 -28",
      material: "color: #27211d; roughness: 0.85; metalness: 0.02",
    });
    var rightArm = appendCylinder(fallback, {
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

      createExhibitionModel(this.el);

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
        applause.leftArm.setAttribute("rotation", "74 0 " + -armAngle);
        applause.rightArm.setAttribute("rotation", "74 0 " + armAngle);
        applause.leftArm.setAttribute("position", -0.11 - clap * 0.025 + " 0.86 0.08");
        applause.rightArm.setAttribute("position", 0.11 + clap * 0.025 + " 0.86 0.08");
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
