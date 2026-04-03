(function () {
  const ParticlePool = {
    pool: [],
    poolSize: 6,
    ready: false,

    init: function init() {
      if (this.ready) {
        return;
      }

      const container = document.getElementById("particle-pool");
      if (!container) {
        return;
      }

      for (let index = 0; index < this.poolSize; index += 1) {
        this.pool.push(this.createEntry(container, index));
      }

      this.ready = true;
    },

    createEntry: function createEntry(container, index) {
      const entity = document.createElement("a-entity");
      entity.setAttribute("id", "particle-" + index);
      entity.setAttribute("visible", false);
      container.appendChild(entity);

      const count = 30;
      const positions = new Float32Array(count * 3);
      const velocities = [];

      for (let particleIndex = 0; particleIndex < count; particleIndex += 1) {
        velocities.push(new THREE.Vector3((Math.random() - 0.5) * 2.8, Math.random() * 2.6 + 0.8, (Math.random() - 0.5) * 2.8));
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        size: 0.06,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
      });

      const points = new THREE.Points(geometry, material);
      points.visible = false;
      entity.object3D.add(points);

      return {
        el: entity,
        geometry: geometry,
        material: material,
        points: points,
        velocities: velocities,
        active: false,
        startedAt: 0,
      };
    },

    burst: function burst(position, colorHex) {
      if (!this.ready) {
        this.init();
      }

      const entry = this.pool.find(function (item) {
        return !item.active;
      });
      if (!entry) {
        return;
      }

      const origin = toVector3(position);
      entry.active = true;
      entry.startedAt = performance.now();
      entry.el.setAttribute("visible", true);
      entry.points.visible = true;
      entry.el.object3D.position.copy(origin);
      entry.material.color.set(colorHex);
      entry.material.opacity = 1;

      const positionAttribute = entry.geometry.getAttribute("position");
      for (let index = 0; index < positionAttribute.count; index += 1) {
        positionAttribute.setXYZ(index, 0, 0, 0);
      }
      positionAttribute.needsUpdate = true;

      this.animate(entry);
    },

    animate: function animate(entry) {
      const duration = 760;
      const elapsed = performance.now() - entry.startedAt;

      if (elapsed >= duration || !entry.active) {
        entry.active = false;
        entry.points.visible = false;
        entry.el.setAttribute("visible", false);
        return;
      }

      const dt = 0.016;
      const positionAttribute = entry.geometry.getAttribute("position");

      for (let index = 0; index < positionAttribute.count; index += 1) {
        const velocity = entry.velocities[index];
        positionAttribute.setXYZ(index, positionAttribute.getX(index) + velocity.x * dt, positionAttribute.getY(index) + velocity.y * dt - 1.8 * dt, positionAttribute.getZ(index) + velocity.z * dt);
      }
      positionAttribute.needsUpdate = true;
      entry.material.opacity = 1 - elapsed / duration;

      requestAnimationFrame(function () {
        this.animate(entry);
      }.bind(this));
    },
  };

  window.ParticlePool = ParticlePool;
})();
