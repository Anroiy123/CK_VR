(function () {
  if (!window.AFRAME) {
    return;
  }

  function resolveTarget(element) {
    if (!element) {
      return null;
    }
    return (
      findClosestWithClass(element, "grabbable") ||
      findClosestWithClass(element, "color-slot") ||
      findClosestWithClass(element, "vr-button-root")
    );
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  AFRAME.registerComponent("grabber", {
    init: function init() {
      this.grabbed = null;
      this.el.addEventListener("gripdown", this.tryGrab.bind(this));
      this.el.addEventListener("gripup", this.tryDrop.bind(this));
      this.el.addEventListener("triggerdown", this.tryGrab.bind(this));
      this.el.addEventListener("triggerup", this.tryDrop.bind(this));
    },

    tryGrab: function tryGrab() {
      if (this.grabbed) {
        return;
      }

      const raycaster = this.el.components.raycaster;
      if (!raycaster || !raycaster.intersectedEls.length) {
        return;
      }

      const target = raycaster.intersectedEls.map(resolveTarget).find(function (element) {
        return element && element.classList.contains("grabbable");
      });

      if (!target || target.dataset.locked === "true") {
        return;
      }

      this.grabbed = target;
      target.emit("grab-start", { controller: this.el });
      this.el.object3D.attach(target.object3D);
      target.object3D.position.set(0, -0.02, -0.18);
      target.object3D.rotation.set(0, 0, 0);

      if (window.SoundManager) {
        SoundManager.play("grab");
      }
    },

    tryDrop: function tryDrop() {
      if (!this.grabbed) {
        return;
      }

      this.el.sceneEl.object3D.attach(this.grabbed.object3D);
      this.grabbed.emit("grab-end", { controller: this.el });
      this.grabbed = null;
    },
  });

  AFRAME.registerComponent("desktop-grabber", {
    init: function init() {
      this.canvas = null;
      this.draggedBall = null;
      this.isDragging = false;
      this.suppressNextClick = false;
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      this.dragPosition = new THREE.Vector3();
      this.dragPlane = new THREE.Plane();
      this.cameraEl = document.getElementById("camera");
      this.cursorEl = this.cameraEl && this.cameraEl.querySelector("a-cursor");

      const planeNormal = toVector3(APP_CONFIG.desktopDrag.planeNormal).normalize();
      const planePoint = toVector3(APP_CONFIG.desktopDrag.planePoint);
      this.dragPlane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);

      this.boundMouseDown = this.onMouseDown.bind(this);
      this.boundMouseMove = this.onMouseMove.bind(this);
      this.boundMouseUp = this.onMouseUp.bind(this);
      this.boundClickCapture = this.onClickCapture.bind(this);
      this.boundBindEvents = this.bindDesktopEvents.bind(this);

      if (this.el.hasLoaded) {
        this.bindDesktopEvents();
      } else {
        this.el.addEventListener("loaded", this.boundBindEvents, { once: true });
      }
    },

    remove: function remove() {
      if (this.canvas) {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
      }
      window.removeEventListener("mousemove", this.boundMouseMove);
      window.removeEventListener("mouseup", this.boundMouseUp);
      this.el.removeEventListener("click", this.boundClickCapture, true);
      this.el.removeEventListener("loaded", this.boundBindEvents);
    },

    bindDesktopEvents: function bindDesktopEvents() {
      this.canvas = this.el.canvas || (this.el.renderer && this.el.renderer.domElement);
      if (!this.canvas) {
        return;
      }
      this.canvas.addEventListener("mousedown", this.boundMouseDown);
      window.addEventListener("mousemove", this.boundMouseMove);
      window.addEventListener("mouseup", this.boundMouseUp);
      this.el.addEventListener("click", this.boundClickCapture, true);
    },

    onMouseDown: function onMouseDown(event) {
      const target = this.getTargetFromPointer(event);
      if (!target || !target.classList.contains("grabbable") || target.dataset.locked === "true") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      this.startDrag(target, event);
    },

    onMouseMove: function onMouseMove(event) {
      if (!this.isDragging || !this.draggedBall) {
        return;
      }

      event.preventDefault();
      this.updateDragPosition(event);
    },

    onMouseUp: function onMouseUp(event) {
      if (!this.isDragging || !this.draggedBall) {
        return;
      }

      this.updateDragPosition(event);
      const ball = this.draggedBall;
      this.finishDrag();
      ball.emit("grab-end", { desktop: true });
    },

    onClickCapture: function onClickCapture(event) {
      if (!this.suppressNextClick) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.suppressNextClick = false;
    },

    startDrag: function startDrag(ball, event) {
      const snapComponent = ball.components["snap-to-slot"];
      if (snapComponent && ball.dataset.slotId) {
        snapComponent.releaseCurrentSlot();
      }

      this.draggedBall = ball;
      this.isDragging = true;
      this.setLookControlsEnabled(false);
      reparentObject3D(ball, this.el);
      ball.emit("grab-start", { desktop: true });

      if (window.SoundManager) {
        SoundManager.play("grab");
      }

      this.updateDragPosition(event);
    },

    updateDragPosition: function updateDragPosition(event) {
      if (!this.draggedBall || !this.el.camera || !this.canvas) {
        return;
      }

      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.el.camera);

      if (!this.raycaster.ray.intersectPlane(this.dragPlane, this.dragPosition)) {
        return;
      }

      this.dragPosition.x = clamp(this.dragPosition.x, APP_CONFIG.desktopDrag.minX, APP_CONFIG.desktopDrag.maxX);
      this.dragPosition.y = clamp(this.dragPosition.y, APP_CONFIG.desktopDrag.minY, APP_CONFIG.desktopDrag.maxY);
      this.dragPosition.z = clamp(this.dragPosition.z, APP_CONFIG.desktopDrag.minZ, APP_CONFIG.desktopDrag.maxZ);

      this.draggedBall.object3D.position.copy(this.dragPosition);
    },

    finishDrag: function finishDrag() {
      this.isDragging = false;
      this.suppressNextClick = true;
      this.setLookControlsEnabled(true);
      this.draggedBall = null;
      setTimeout(function () {
        this.suppressNextClick = false;
      }.bind(this), 80);
    },

    setLookControlsEnabled: function setLookControlsEnabled(enabled) {
      if (!this.cameraEl) {
        return;
      }
      this.cameraEl.setAttribute("look-controls", "enabled", enabled);
    },

    getTargetFromPointer: function getTargetFromPointer(event) {
      const hoverTarget = this.getTargetFromCursorRaycaster();
      if (hoverTarget) {
        return hoverTarget;
      }

      return this.getTargetFromManualRaycast(event);
    },

    getTargetFromCursorRaycaster: function getTargetFromCursorRaycaster() {
      if (!this.cursorEl) {
        return null;
      }

      const cursorRaycaster = this.cursorEl.components.raycaster;
      if (!cursorRaycaster || !Array.isArray(cursorRaycaster.intersections)) {
        return null;
      }

      for (let index = 0; index < cursorRaycaster.intersections.length; index += 1) {
        const intersection = cursorRaycaster.intersections[index];
        const candidate = resolveTarget(intersection.object && intersection.object.el);
        if (!candidate || !isVisible(candidate)) {
          continue;
        }
        return candidate;
      }

      return null;
    },

    getTargetFromManualRaycast: function getTargetFromManualRaycast(event) {
      if (!this.el.camera || !this.canvas) {
        return null;
      }

      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return null;
      }

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.el.camera);

      const interactiveObjects = Array.from(document.querySelectorAll(".grabbable, .color-slot, .vr-button-root"))
        .filter(function (element) {
          return isVisible(element);
        })
        .map(function (element) {
          return element.object3D;
        });

      const intersections = this.raycaster.intersectObjects(interactiveObjects, true);
      for (let index = 0; index < intersections.length; index += 1) {
        const intersection = intersections[index];
        const candidate = resolveTarget(intersection.object && intersection.object.el);
        if (!candidate || !isVisible(candidate)) {
          continue;
        }
        return candidate;
      }

      return null;
    },
  });
})();
