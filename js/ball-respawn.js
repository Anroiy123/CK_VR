(function () {
  if (!window.AFRAME) {
    return;
  }

  AFRAME.registerComponent("ball-respawn", {
    schema: {
      minY: { type: "number", default: -1 },
      checkInterval: { type: "number", default: 500 },
    },

    init: function init() {
      this.lastCheck = 0;
      this.worldPosition = new THREE.Vector3();
    },

    tick: function tick(time) {
      if (time - this.lastCheck < this.data.checkInterval) {
        return;
      }
      this.lastCheck = time;

      if (this.el.dataset.held === "true" || this.el.dataset.locked === "true") {
        return;
      }

      this.el.object3D.getWorldPosition(this.worldPosition);
      if (this.worldPosition.y >= this.data.minY) {
        return;
      }

      const snapComponent = this.el.components["snap-to-slot"];
      if (snapComponent) {
        snapComponent.returnToShelf();
      }
    },
  });
})();
