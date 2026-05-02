(function () {
  if (!window.AFRAME) {
    return;
  }

  var PARTICLE_COUNT = 120;
  var BOUNDS_X = 4.0;
  var BOUNDS_Y = 3.0;
  var BOUNDS_Z = 4.0;

  // Opacity tiers to approximate per-instance opacity without ShaderMaterial
  var OPACITY_TIERS = [0.3, 0.45, 0.6];
  var INSTANCES_PER_TIER = 40;

  AFRAME.registerComponent("ambient-particles", {
    init: function init() {
      var geometry = new THREE.SphereGeometry(0.008, 6, 4);
      this.meshes = [];
      this.initialPositions = [];
      this.phases = [];
      this.speeds = [];
      this.dummy = new THREE.Object3D();

      for (var t = 0; t < OPACITY_TIERS.length; t += 1) {
        var material = new THREE.MeshBasicMaterial({
          color: 0xd0e4ff,
          transparent: true,
          opacity: OPACITY_TIERS[t],
        });

        var mesh = new THREE.InstancedMesh(
          geometry,
          material,
          INSTANCES_PER_TIER
        );
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.meshes.push(mesh);
        this.el.object3D.add(mesh);
      }

      for (var i = 0; i < PARTICLE_COUNT; i += 1) {
        var x = (Math.random() - 0.5) * BOUNDS_X;
        var y = (Math.random() - 0.5) * BOUNDS_Y + 1.0;
        var z = (Math.random() - 0.5) * BOUNDS_Z - 1.0;

        this.initialPositions.push(new THREE.Vector3(x, y, z));
        this.phases.push(Math.random() * Math.PI * 2);
        this.speeds.push(0.3 + Math.random() * 0.5);

        // Distribute particles across opacity tiers: 0..39 -> tier 0, 40..79 -> tier 1, 80..119 -> tier 2
        var tierIndex = Math.floor(i / INSTANCES_PER_TIER);
        var localIndex = i % INSTANCES_PER_TIER;
        var opacity = OPACITY_TIERS[tierIndex];
        var color = new THREE.Color(
          0.7 + 0.3 * opacity,
          0.8 + 0.2 * opacity,
          1.0
        );
        this.meshes[tierIndex].setColorAt(localIndex, color);

        this.dummy.position.set(x, y, z);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();
        this.meshes[tierIndex].setMatrixAt(localIndex, this.dummy.matrix);
      }

      for (var m = 0; m < this.meshes.length; m += 1) {
        this.meshes[m].instanceMatrix.needsUpdate = true;
        this.meshes[m].instanceColor.needsUpdate = true;
      }
    },

    tick: function tick(time) {
      if (!this.meshes || this.meshes.length === 0) {
        return;
      }

      var t = time / 1000;
      var dummy = this.dummy;
      var positions = this.initialPositions;
      var phases = this.phases;
      var speeds = this.speeds;

      for (var i = 0; i < PARTICLE_COUNT; i += 1) {
        var pos = positions[i];
        var phase = phases[i];
        var speed = speeds[i];

        var yOffset = Math.sin(t * speed + phase) * 0.12;
        var rotY = t * 0.08 + phase;

        dummy.position.set(pos.x, pos.y + yOffset, pos.z);
        dummy.rotation.y = rotY;
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        var tierIndex = Math.floor(i / INSTANCES_PER_TIER);
        var localIndex = i % INSTANCES_PER_TIER;
        this.meshes[tierIndex].setMatrixAt(localIndex, dummy.matrix);
      }

      for (var m = 0; m < this.meshes.length; m += 1) {
        this.meshes[m].instanceMatrix.needsUpdate = true;
      }
    },
  });
})();
