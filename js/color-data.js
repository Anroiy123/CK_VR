(function () {
  const COLOR_DATA = {
    primary: [
      { name: "Red", hex: "#FF0000", angle: 0, level: 1, type: "Primary", theory: "Primary color. It cannot be created by mixing other colors." },
      { name: "Yellow", hex: "#FFFF00", angle: 120, level: 1, type: "Primary", theory: "Primary color. It brings brightness and warmth to the wheel." },
      { name: "Blue", hex: "#0000FF", angle: 240, level: 1, type: "Primary", theory: "Primary color. It anchors the cool side of the wheel." },
    ],
    secondary: [
      { name: "Orange", hex: "#FF8000", angle: 60, level: 2, type: "Secondary", theory: "Orange is made by mixing red and yellow." },
      { name: "Green", hex: "#00FF00", angle: 180, level: 2, type: "Secondary", theory: "Green is made by mixing yellow and blue." },
      { name: "Purple", hex: "#8000FF", angle: 300, level: 2, type: "Secondary", theory: "Purple is made by mixing red and blue." },
    ],
    tertiary: [
      { name: "Red-Orange", hex: "#FF4000", angle: 30, level: 3, type: "Tertiary", theory: "Red-Orange sits between red and orange." },
      { name: "Yellow-Orange", hex: "#FFBF00", angle: 90, level: 3, type: "Tertiary", theory: "Yellow-Orange sits between yellow and orange." },
      { name: "Yellow-Green", hex: "#80FF00", angle: 150, level: 3, type: "Tertiary", theory: "Yellow-Green sits between yellow and green." },
      { name: "Blue-Green", hex: "#00FF80", angle: 210, level: 3, type: "Tertiary", theory: "Blue-Green sits between blue and green." },
      { name: "Blue-Purple", hex: "#0040FF", angle: 270, level: 3, type: "Tertiary", theory: "Blue-Purple sits between blue and purple." },
      { name: "Red-Purple", hex: "#FF0080", angle: 330, level: 3, type: "Tertiary", theory: "Red-Purple sits between red and purple." },
    ],
  };

  const LEVEL_CONFIG = {
    1: { colors: "primary", timer: 30, label: "Primary Colors" },
    2: { colors: "secondary", timer: 25, label: "Secondary Colors" },
    3: { colors: "tertiary", timer: 45, label: "Tertiary Colors" },
  };

  const APP_CONFIG = {
    snapDistance: 0.46,
    shelfY: 0.88,
    shelfZ: -1.18,
    shelfWidth: 1.22,
    shelfBallColumns: 6,
    shelfBallSpacingX: 0.24,
    shelfBallRowLift: 0.09,
    shelfBallRowDepth: 0.16,
    wheelRadius: 1.28,
    slotDepthOffset: 0.08,
    desktopDrag: {
      minX: -1.85,
      maxX: 1.85,
      minY: 0.45,
      maxY: 2.65,
      minZ: -3.2,
      maxZ: -2.2,
      planePoint: { x: 0, y: 1.45, z: -2.58 },
      planeNormal: { x: 0, y: 0, z: 1 },
    },
  };

  const COLOR_LIST = [...COLOR_DATA.primary, ...COLOR_DATA.secondary, ...COLOR_DATA.tertiary].sort(function (left, right) {
    return left.angle - right.angle;
  });

  const COLOR_BY_HEX = COLOR_LIST.reduce(function (accumulator, color) {
    accumulator[color.hex] = color;
    return accumulator;
  }, {});

  function cloneColor(color) {
    return Object.assign({}, color);
  }

  function getAllColors() {
    return COLOR_LIST.map(cloneColor);
  }

  function getColorsForLevel(level) {
    const config = LEVEL_CONFIG[level];
    if (!config) {
      return [];
    }
    return COLOR_DATA[config.colors].map(cloneColor);
  }

  function getVisibleColorsForGame(level) {
    if (level <= 1) {
      return COLOR_DATA.primary.map(cloneColor);
    }
    if (level === 2) {
      return [...COLOR_DATA.primary, ...COLOR_DATA.secondary].map(cloneColor);
    }
    return getAllColors();
  }

  function shuffleColors(colors) {
    const copy = colors.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = current;
    }
    return copy;
  }

  function getColorByHex(hex) {
    return COLOR_BY_HEX[hex] ? cloneColor(COLOR_BY_HEX[hex]) : null;
  }

  function getSlotPosition(angleDeg, radius) {
    const radians = (angleDeg * Math.PI) / 180;
    return { x: radius * Math.sin(radians), y: radius * Math.cos(radians), z: 0 };
  }

  function toVector3(value) {
    if (value instanceof THREE.Vector3) {
      return value.clone();
    }
    if (value && typeof value.x === "number") {
      return new THREE.Vector3(value.x, value.y, value.z);
    }
    if (typeof value === "string") {
      const parts = value.trim().split(/\s+/).map(Number);
      return new THREE.Vector3(parts[0] || 0, parts[1] || 0, parts[2] || 0);
    }
    return new THREE.Vector3();
  }

  function vec3ToString(vector) {
    return [vector.x, vector.y, vector.z].join(" ");
  }

  function findClosestWithClass(element, className) {
    let current = element;
    while (current && current !== document.body) {
      if (current.classList && current.classList.contains(className)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function getWorldPosition(element) {
    const position = new THREE.Vector3();
    element.object3D.getWorldPosition(position);
    return position;
  }

  function reparentObject3D(element, newParent) {
    if (!element || !newParent) {
      return;
    }
    newParent.object3D.attach(element.object3D);
  }

  function setLocalPositionFromWorld(element, newParent, worldPosition) {
    const localPosition = toVector3(worldPosition);
    newParent.object3D.worldToLocal(localPosition);
    element.object3D.position.copy(localPosition);
  }

  function isVisible(element) {
    return element && element.getAttribute("visible") !== false;
  }

  function onSceneReady(callback) {
    const scene = document.querySelector("a-scene");
    if (!scene) {
      return;
    }
    if (scene.hasLoaded) {
      callback(scene);
      return;
    }
    scene.addEventListener("loaded", function () {
      callback(scene);
    }, { once: true });
  }

  window.APP_CONFIG = APP_CONFIG;
  window.COLOR_DATA = COLOR_DATA;
  window.COLOR_LIST = COLOR_LIST;
  window.COLOR_BY_HEX = COLOR_BY_HEX;
  window.LEVEL_CONFIG = LEVEL_CONFIG;
  window.cloneColor = cloneColor;
  window.findClosestWithClass = findClosestWithClass;
  window.getAllColors = getAllColors;
  window.getColorByHex = getColorByHex;
  window.getColorsForLevel = getColorsForLevel;
  window.getSlotPosition = getSlotPosition;
  window.getVisibleColorsForGame = getVisibleColorsForGame;
  window.getWorldPosition = getWorldPosition;
  window.isVisible = isVisible;
  window.onSceneReady = onSceneReady;
  window.reparentObject3D = reparentObject3D;
  window.setLocalPositionFromWorld = setLocalPositionFromWorld;
  window.shuffleColors = shuffleColors;
  window.toVector3 = toVector3;
  window.vec3ToString = vec3ToString;
})();
