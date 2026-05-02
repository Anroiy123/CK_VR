(function () {
  var PARTICLE_COUNT_PER_BURST = 48;
  var POOL_SIZE = 6;
  var TRAIL_COUNT = 3;
  var TOTAL_INSTANCES = POOL_SIZE * PARTICLE_COUNT_PER_BURST * (1 + TRAIL_COUNT);
  var DURATION = 800;
  var SPHERE_RADIUS = 0.018;
  var SPHERE_SEGMENTS_W = 6;
  var SPHERE_SEGMENTS_H = 4;

  var ParticlePool = {
    pool: [],
    ready: false,
    animating: false,
    prevTime: 0,

    init: function init() {
      if (this.ready) {
        return;
      }

      var geometry = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS_W, SPHERE_SEGMENTS_H);
      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });

      this.mesh = new THREE.InstancedMesh(geometry, material, TOTAL_INSTANCES);
      this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.mesh.count = TOTAL_INSTANCES;

      this.dummy = new THREE.Object3D();
      this.tempColor = new THREE.Color();

      // Hide all instances initially (positioned far away, scale 0)
      var dummy = this.dummy;
      for (var i = 0; i < TOTAL_INSTANCES; i += 1) {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      }
      this.mesh.instanceMatrix.needsUpdate = true;

      var container = document.getElementById("particle-pool");
      if (container) {
        container.object3D.add(this.mesh);
      }

      // Initialize pool entries
      for (var e = 0; e < POOL_SIZE; e += 1) {
        var particles = [];
        for (var p = 0; p < PARTICLE_COUNT_PER_BURST; p += 1) {
          var velocity = new THREE.Vector3(0, 0, 0);
          var spin = new THREE.Vector3(0, 0, 0);
          var trailPositions = [];
          for (var t = 0; t < TRAIL_COUNT; t += 1) {
            trailPositions.push(new THREE.Vector3(0, -100, 0));
          }
          particles.push({
            velocity: velocity,
            spin: spin,
            trailPositions: trailPositions,
          });
        }
        this.pool.push({
          active: false,
          startedAt: 0,
          origin: new THREE.Vector3(0, 0, 0),
          colorHex: "#ffffff",
          particles: particles,
        });
      }

      this.ready = true;
    },

    burst: function burst(position, colorHex) {
      if (!this.ready) {
        this.init();
      }

      var entry = null;
      for (var i = 0; i < POOL_SIZE; i += 1) {
        if (!this.pool[i].active) {
          entry = this.pool[i];
          break;
        }
      }
      if (!entry) {
        return;
      }

      var origin = toVector3(position);
      entry.active = true;
      entry.startedAt = performance.now();
      entry.origin.copy(origin);
      entry.colorHex = colorHex || "#ffffff";

      var particles = entry.particles;

      for (var p = 0; p < PARTICLE_COUNT_PER_BURST; p += 1) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        var speed = 0.8 + Math.random() * 2.0;

        particles[p].velocity.set(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 0.5,
          Math.cos(phi) * speed
        );
        particles[p].spin.set(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        );

        // Reset trail positions to origin
        for (var t = 0; t < TRAIL_COUNT; t += 1) {
          particles[p].trailPositions[t].copy(origin);
        }
      }

      // Set instance colors
      var color = this.tempColor;
      color.set(colorHex || "#ffffff");
      for (var p = 0; p < PARTICLE_COUNT_PER_BURST; p += 1) {
        var mainIdx = this.getInstanceIndex(i, p, 0);
        this.mesh.setColorAt(mainIdx, color);
        for (var t = 0; t < TRAIL_COUNT; t += 1) {
          var trailColor = color.clone();
          var dimFactor = 1.0 - (t + 1) * 0.15;
          trailColor.multiplyScalar(dimFactor);
          this.mesh.setColorAt(this.getInstanceIndex(i, p, t + 1), trailColor);
        }
      }
      this.mesh.instanceColor.needsUpdate = true;

      if (!this.animating) {
        this.animating = true;
        this.prevTime = performance.now();
        this.animate();
      }
    },

    getInstanceIndex: function getInstanceIndex(entryIndex, particleIndex, trailIndex) {
      return entryIndex * PARTICLE_COUNT_PER_BURST * (1 + TRAIL_COUNT) + particleIndex * (1 + TRAIL_COUNT) + trailIndex;
    },

    animate: function animate() {
      var now = performance.now();
      var dummy = this.dummy;
      var needUpdate = false;
      var anyActive = false;

      for (var e = 0; e < POOL_SIZE; e += 1) {
        var entry = this.pool[e];
        if (!entry.active) {
          continue;
        }

        var elapsed = now - entry.startedAt;
        if (elapsed >= DURATION) {
          entry.active = false;
          // Hide all instances for this completed entry
          for (var p = 0; p < PARTICLE_COUNT_PER_BURST; p += 1) {
            for (var t = 0; t <= TRAIL_COUNT; t += 1) {
              var idx = this.getInstanceIndex(e, p, t);
              dummy.position.set(0, -100, 0);
              dummy.scale.set(0, 0, 0);
              dummy.updateMatrix();
              this.mesh.setMatrixAt(idx, dummy.matrix);
            }
          }
          needUpdate = true;
          continue;
        }

        anyActive = true;
        var progress = elapsed / DURATION;
        var scaleFactor = 1.0 - progress * 0.722;
        var gravity = -1.8;
        var origin = entry.origin;
        var particles = entry.particles;

        for (var p = 0; p < PARTICLE_COUNT_PER_BURST; p += 1) {
          var particle = particles[p];
          var vel = particle.velocity;
          var spin = particle.spin;
          var trail = particle.trailPositions;

          // Kinematic position: x = x0 + vx*t, y = y0 + vy*t + 0.5*g*t^2
          var tSec = elapsed / 1000;
          var dragFactor = 1 + progress * 0.5;
          var currentX = origin.x + vel.x * tSec * dragFactor;
          var currentY = origin.y + vel.y * tSec * dragFactor + 0.5 * gravity * tSec * tSec;
          var currentZ = origin.z + vel.z * tSec * dragFactor;

          var particleScale = Math.max(scaleFactor, 0.01);

          // Shift trail: move all trail positions one step back
          for (var tr = TRAIL_COUNT - 1; tr > 0; tr -= 1) {
            trail[tr].copy(trail[tr - 1]);
          }
          trail[0].set(currentX, currentY, currentZ);

          // Write main instance with deterministic rotation from elapsed time
          var mainIdx = this.getInstanceIndex(e, p, 0);
          dummy.position.set(currentX, currentY, currentZ);
          dummy.scale.set(particleScale, particleScale, particleScale);
          dummy.rotation.set(
            spin.x * tSec,
            spin.y * tSec,
            spin.z * tSec
          );
          dummy.updateMatrix();
          this.mesh.setMatrixAt(mainIdx, dummy.matrix);

          // Write trail instances (ghost positions from previous frames)
          for (var tr = 0; tr < TRAIL_COUNT; tr += 1) {
            var trailPos = trail[tr];
            var trailScale = particleScale * (0.6 - tr * 0.12);
            if (trailScale < 0) { trailScale = 0; }
            var trailIdx = this.getInstanceIndex(e, p, tr + 1);
            dummy.position.copy(trailPos);
            dummy.scale.set(trailScale, trailScale, trailScale);
            dummy.rotation.set(
              spin.x * tSec * 0.3,
              spin.y * tSec * 0.3,
              spin.z * tSec * 0.3
            );
            dummy.updateMatrix();
            this.mesh.setMatrixAt(trailIdx, dummy.matrix);
          }
        }
        needUpdate = true;
      }

      if (needUpdate) {
        this.mesh.instanceMatrix.needsUpdate = true;
      }

      if (anyActive) {
        requestAnimationFrame(this.animate.bind(this));
      } else {
        this.animating = false;
      }
    },
  };

  window.ParticlePool = ParticlePool;
})();
