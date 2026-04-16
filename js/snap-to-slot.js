(function () {
  if (!window.AFRAME) {
    return;
  }

  function getWheelComponent() {
    const wheelEl = document.getElementById("color-wheel");
    return wheelEl && wheelEl.components["color-wheel"];
  }

  function getBallsContainer() {
    return document.getElementById("balls-container");
  }

  function getAvailableSlots() {
    return Array.from(document.querySelectorAll(".color-slot")).filter(function (slot) {
      return isVisible(slot) && slot.dataset.occupied !== "true";
    });
  }

  function getPointedSlot(controller) {
    if (!controller || !controller.components || !controller.components.raycaster) {
      return null;
    }

    const raycaster = controller.components.raycaster;
    if (!raycaster.intersectedEls || !raycaster.intersectedEls.length) {
      return null;
    }

    return raycaster.intersectedEls
      .map(function (element) {
        return findClosestWithClass(element, "color-slot");
      })
      .find(function (slot) {
        return slot && isVisible(slot) && slot.dataset.occupied !== "true";
      }) || null;
  }

  AFRAME.registerComponent("snap-to-slot", {
    schema: {
      snapDistance: { type: "number", default: APP_CONFIG.snapDistance },
    },

    init: function init() {
      this.dropHandler = this.onDrop.bind(this);
      this.grabHandler = this.onGrabStart.bind(this);
      this.activeController = null;
      this.el.addEventListener("grab-end", this.dropHandler);
      this.el.addEventListener("grab-start", this.grabHandler);
    },

    remove: function remove() {
      this.el.removeEventListener("grab-end", this.dropHandler);
      this.el.removeEventListener("grab-start", this.grabHandler);
    },

    onGrabStart: function onGrabStart(event) {
      this.activeController = event && event.detail ? event.detail.controller || null : null;
      if (this.el.dataset.slotId) {
        this.releaseCurrentSlot();
      }
    },

    onDrop: function onDrop(event) {
      if (this.el.dataset.locked === "true") {
        return;
      }

      const slots = getAvailableSlots();
      if (!slots.length) {
        this.returnToShelf();
        return;
      }

      const ballData = this.el.getAttribute("color-ball");
      const controller = event && event.detail ? event.detail.controller || this.activeController : this.activeController;
      const pointedSlot = getPointedSlot(controller);
      const ballPosition = getWorldPosition(this.el);
      const snapDistance = event && event.detail && event.detail.desktop ? this.data.snapDistance : APP_CONFIG.vrSnapDistance;

      if (pointedSlot) {
        const isFreePlay = window.FreePlayManager && FreePlayManager.active;
        const isCorrect = pointedSlot.dataset.targetColor === ballData.colorHex;
        this.activeController = null;

        if (isFreePlay) {
          this.snapSuccess(pointedSlot, isCorrect, true);
          return;
        }

        if (isCorrect) {
          this.snapSuccess(pointedSlot, true, false);
          return;
        }

        this.snapFail();
        return;
      }

      const match = this.findClosestSlot(slots, ballPosition);
      this.activeController = null;
      if (!match || match.distance > snapDistance) {
        this.returnToShelf();
        return;
      }

      const isFreePlay = window.FreePlayManager && FreePlayManager.active;
      const isCorrect = match.slot.dataset.targetColor === ballData.colorHex;

      if (isFreePlay) {
        this.snapSuccess(match.slot, isCorrect, true);
        return;
      }

      if (isCorrect) {
        this.snapSuccess(match.slot, true, false);
        return;
      }

      this.snapFail();
    },

    findClosestSlot: function findClosestSlot(slots, ballPosition) {
      let closest = null;
      let minDistanceSquared = Infinity;

      slots.forEach(function (slot) {
        const slotPosition = getWorldPosition(slot);
        const distanceSquared = slotPosition.distanceToSquared(ballPosition);
        if (distanceSquared < minDistanceSquared) {
          minDistanceSquared = distanceSquared;
          closest = { slot: slot, distance: Math.sqrt(distanceSquared) };
        }
      });

      return closest;
    },

    snapSuccess: function snapSuccess(slot, isCorrect, isFreePlay) {
      const wheel = getWheelComponent();
      const slotColor = slot.dataset.targetColor;
      const ballColor = this.el.getAttribute("color-ball").colorHex;

      slot.object3D.attach(this.el.object3D);
      this.el.object3D.position.set(0, 0, APP_CONFIG.placedBallDepthOffset);
      this.el.object3D.rotation.set(0, 0, 0);

      this.el.dataset.slotId = slot.id;
      this.el.dataset.placed = "true";
      delete this.el.dataset.held;

      if (wheel) {
        wheel.occupyColor(slotColor, ballColor);
      }

      if (isFreePlay) {
        delete this.el.dataset.locked;
        this.el.classList.add("grabbable", "interactive");
        if (isCorrect) {
          if (window.SoundManager) {
            SoundManager.play("correct");
          }
          if (window.ParticlePool) {
            ParticlePool.burst(getWorldPosition(slot), ballColor);
          }
          const ballTooltip = this.el.components["color-tooltip"];
          const slotTooltip = slot.components["color-tooltip"];
          if (ballTooltip) {
            ballTooltip.showTemporary(1800);
          }
          if (slotTooltip) {
            slotTooltip.showTemporary(1800);
          }
        }

        this.el.sceneEl.emit("color-placed", {
          mode: "freeplay",
          color: ballColor,
          correct: isCorrect,
          slotId: slot.id,
        });
        return;
      }

      this.el.dataset.locked = "true";
      this.el.classList.remove("grabbable", "interactive");
      this.el.removeAttribute("ball-respawn");

      if (window.SoundManager) {
        SoundManager.play("correct");
      }
      if (window.ParticlePool) {
        ParticlePool.burst(getWorldPosition(slot), ballColor);
      }

      this.el.sceneEl.emit("color-placed", {
        mode: "game",
        color: ballColor,
        correct: true,
        slotId: slot.id,
      });
    },

    snapFail: function snapFail() {
      if (window.SoundManager) {
        SoundManager.play("wrong");
      }

      const current = this.el.object3D.position.clone();
      this.el.setAttribute("animation__shake", "property: position; from: " + vec3ToString(current) + "; to: " + vec3ToString(new THREE.Vector3(current.x + 0.05, current.y, current.z)) + "; dir: alternate; loop: 4; dur: 70; easing: easeInOutQuad");

      setTimeout(function () {
        this.el.removeAttribute("animation__shake");
        this.returnToShelf();
      }.bind(this), 360);
    },

    releaseCurrentSlot: function releaseCurrentSlot() {
      const slotId = this.el.dataset.slotId;
      if (!slotId) {
        return;
      }

      const slot = document.getElementById(slotId);
      const wheel = getWheelComponent();
      if (slot && wheel) {
        wheel.clearColor(slot.dataset.targetColor, window.FreePlayManager && FreePlayManager.active);
      }

      delete this.el.dataset.slotId;
      delete this.el.dataset.placed;
    },

    returnToShelf: function returnToShelf() {
      this.releaseCurrentSlot();

      const container = getBallsContainer();
      const originalPosition = this.el.getAttribute("color-ball").originalPosition;
      reparentObject3D(this.el, container);
      this.el.object3D.position.copy(toVector3(originalPosition));
      this.el.object3D.rotation.set(0, 0, 0);
      delete this.el.dataset.held;
      delete this.el.dataset.selected;
      if (this.el.dataset.locked !== "true") {
        this.el.classList.add("grabbable", "interactive");
        this.el.setAttribute("material", "emissiveIntensity", 0);
      }
    },
  });
})();
