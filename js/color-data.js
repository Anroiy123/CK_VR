(function () {
  const COLOR_DATA = {
    primary: [
      { name: "Red", hex: "#FF0000", angle: 0, level: 1, type: "Primary", theory: "Primary color. It cannot be created by mixing other colors." },
      { name: "Yellow", hex: "#FFFF00", angle: 120, level: 1, type: "Primary", theory: "Primary color. It brings brightness and warmth to the wheel." },
      { name: "Blue", hex: "#0000FF", angle: 240, level: 1, type: "Primary", theory: "Primary color. It anchors the cool side of the wheel." },
    ],
    secondary: [
      { name: "Orange", hex: "#FF8A00", angle: 60, level: 2, type: "Secondary", theory: "Orange is made by mixing red and yellow." },
      { name: "Green", hex: "#00C800", angle: 180, level: 2, type: "Secondary", theory: "Green is made by mixing yellow and blue." },
      { name: "Purple", hex: "#B000E8", angle: 300, level: 2, type: "Secondary", theory: "Purple is made by mixing red and blue." },
    ],
    tertiary: [
      { name: "Red-Orange", hex: "#FF4D00", angle: 30, level: 3, type: "Tertiary", theory: "Red-Orange sits between red and orange." },
      { name: "Yellow-Orange", hex: "#FFC400", angle: 90, level: 3, type: "Tertiary", theory: "Yellow-Orange sits between yellow and orange." },
      { name: "Yellow-Green", hex: "#8FEA00", angle: 150, level: 3, type: "Tertiary", theory: "Yellow-Green sits between yellow and green." },
      { name: "Blue-Green", hex: "#00A8A8", angle: 210, level: 3, type: "Tertiary", theory: "Blue-Green sits between blue and green." },
      { name: "Blue-Purple", hex: "#6A00FF", angle: 270, level: 3, type: "Tertiary", theory: "Blue-Purple sits between blue and purple." },
      { name: "Red-Purple", hex: "#D0008A", angle: 330, level: 3, type: "Tertiary", theory: "Red-Purple sits between red and purple." },
    ],
    base: [
      { name: "White", hex: "#FFFFFF", type: "Base", targetSlot: "center", theory: "Base color for creating tints." }
    ]
  };

  const MIXING_RECIPES = {
    "#FF0000,#FFFF00": "#FF8A00",
    "#0000FF,#FFFF00": "#00C800",
    "#0000FF,#FF0000": "#B000E8",
    "#FF0000,#FF8A00": "#FF4D00",
    "#FF8A00,#FFFF00": "#FFC400",
    "#00C800,#FFFF00": "#8FEA00",
    "#0000FF,#00C800": "#00A8A8",
    "#0000FF,#B000E8": "#6A00FF",
    "#FF0000,#B000E8": "#D0008A",
  };

  const TINT_VARIANTS = [
    { name: "Tinted Red", hex: "#FF8080", angle: 0, type: "Tint", parentHex: "#FF0000" },
    { name: "Tinted Yellow", hex: "#FFFF80", angle: 120, type: "Tint", parentHex: "#FFFF00" },
    { name: "Tinted Blue", hex: "#8080FF", angle: 240, type: "Tint", parentHex: "#0000FF" },
    { name: "Tinted Orange", hex: "#FFC580", angle: 60, type: "Tint", parentHex: "#FF8A00" },
    { name: "Tinted Green", hex: "#80E480", angle: 180, type: "Tint", parentHex: "#00C800" },
    { name: "Tinted Purple", hex: "#D880F4", angle: 300, type: "Tint", parentHex: "#B000E8" },
    { name: "Tinted Red-Orange", hex: "#FFA680", angle: 30, type: "Tint", parentHex: "#FF4D00" },
    { name: "Tinted Yellow-Orange", hex: "#FFE280", angle: 90, type: "Tint", parentHex: "#FFC400" },
    { name: "Tinted Yellow-Green", hex: "#C7F580", angle: 150, type: "Tint", parentHex: "#8FEA00" },
    { name: "Tinted Blue-Green", hex: "#80D4D4", angle: 210, type: "Tint", parentHex: "#00A8A8" },
    { name: "Tinted Blue-Purple", hex: "#A878E8", angle: 270, type: "Tint", parentHex: "#6A00FF" },
    { name: "Tinted Red-Purple", hex: "#E880C5", angle: 330, type: "Tint", parentHex: "#D0008A" },
  ];

  const TINT_BY_PARENT = TINT_VARIANTS.reduce(function(acc, tint) {
    acc[tint.parentHex] = tint.hex;
    return acc;
  }, {});

  const LEVEL_CONFIG = {
    1: { targets: ["#FF0000", "#FFFF00", "#0000FF", "#FFFFFF"], timer: 30, label: "Primary Colors + White" },
    2: { targets: ["#FF8A00", "#00C800", "#B000E8"], timer: 25, label: "Secondary Colors" },
    3: { targets: ["#FF4D00", "#FFC400", "#8FEA00", "#00A8A8", "#6A00FF", "#D0008A"], timer: 45, label: "Tertiary Colors" },
    4: {
      targets: [
        "#FF8080", "#FFFF80", "#8080FF",
        "#FFC580", "#80E480", "#D880F4",
        "#FFA680", "#FFE280", "#C7F580", "#80D4D4", "#A878E8", "#E880C5"
      ],
      timer: 90,
      label: "Tint Colors"
    },
    5: {
      targets: [
        "#FF0000", "#FFFF00", "#0000FF",
        "#FF8A00", "#00C800", "#B000E8",
        "#FF4D00", "#FFC400", "#8FEA00", "#00A8A8", "#6A00FF", "#D0008A",
        "#FF8080", "#FFFF80", "#8080FF",
        "#FFC580", "#80E480", "#D880F4",
        "#FFA680", "#FFE280", "#C7F580", "#80D4D4", "#A878E8", "#E880C5",
        "#FFFFFF"
      ],
      timer: 150,
      label: "Full Color Wheel"
    }
  };

  const MIX_LEVEL_CONFIG = {
    1: { targets: ["#FF0000", "#FFFF00", "#0000FF"], timer: 60, label: "Mix Primary Colors" },
    2: { targets: ["#FF8A00", "#00C800", "#B000E8"], timer: 75, label: "Mix Secondary Colors" },
    3: { targets: ["#FF4D00", "#FFC400", "#8FEA00", "#00A8A8", "#6A00FF", "#D0008A"], timer: 90, label: "Mix Tertiary Colors" },
    4: {
      targets: [
        "#FF8080", "#FFFF80", "#8080FF",
        "#FFC580", "#80E480", "#D880F4",
        "#FFA680", "#FFE280", "#C7F580", "#80D4D4", "#A878E8", "#E880C5",
        "#FFFFFF"
      ],
      timer: 120,
      label: "Mix Tint Colors"
    },
    5: {
      targets: [
        "#FF0000", "#FFFF00", "#0000FF",
        "#FF8A00", "#00C800", "#B000E8",
        "#FF4D00", "#FFC400", "#8FEA00", "#00A8A8", "#6A00FF", "#D0008A",
        "#FF8080", "#FFFF80", "#8080FF",
        "#FFC580", "#80E480", "#D880F4",
        "#FFA680", "#FFE280", "#C7F580", "#80D4D4", "#A878E8", "#E880C5",
        "#FFFFFF"
      ],
      timer: 150,
      label: "Master Mixer"
    }
  };

  const APP_CONFIG = {
    snapDistance: 0.32,
    vrSnapDistance: 0.5,
    shelfY: 0.62,
    shelfZ: -0.74,
    shelfWidth: 1.44,
    shelfBallColumns: 5,
    shelfBallSpacingX: 0.16,
    shelfBallRowLift: 0.06,
    shelfBallRowDepth: 0.1,
    wheelRadius: 0.78,
    slotDepthOffset: 0.08,
    placedBallDepthOffset: 0.18,
    vrGrab: {
      holdOffset: { x: 0, y: -0.04, z: -0.52 },
    },
    desktopDrag: {
      minX: -1.25,
      maxX: 1.25,
      minY: 0.3,
      maxY: 2.12,
      minZ: -2.05,
      maxZ: -1.2,
      planePoint: { x: 0, y: 1.02, z: -1.55 },
      planeNormal: { x: 0, y: 0, z: 1 },
    },
  };

  const COLOR_LIST = [...COLOR_DATA.primary, ...COLOR_DATA.secondary, ...COLOR_DATA.tertiary, ...COLOR_DATA.base, ...TINT_VARIANTS].sort(function (left, right) {
    if (left.angle !== undefined && right.angle !== undefined) {
      return left.angle - right.angle;
    }
    return 0;
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
    if (config.targets) {
      return config.targets.map(getColorByHex).filter(Boolean);
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
    if (hex === "#8B7355") {
      return { name: "Waste", hex: "#8B7355", type: "Waste" };
    }
    return COLOR_BY_HEX[hex] ? cloneColor(COLOR_BY_HEX[hex]) : null;
  }

  function getMixingRecipe(hex1, hex2) {
    const key1 = hex1 + "," + hex2;
    const key2 = hex2 + "," + hex1;
    return MIXING_RECIPES[key1] || MIXING_RECIPES[key2] || null;
  }

  function getTintForColor(hex) {
    return TINT_BY_PARENT[hex] || null;
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
    if (!element) return false;
    let current = element;
    while (current && current !== document.body) {
      if (current.getAttribute && current.getAttribute("visible") === false) {
        return false;
      }
      current = current.parentElement;
    }
    return true;
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
  window.MIXING_RECIPES = MIXING_RECIPES;
  window.TINT_VARIANTS = TINT_VARIANTS;
  window.TINT_BY_PARENT = TINT_BY_PARENT;
  window.MIX_LEVEL_CONFIG = MIX_LEVEL_CONFIG;
  window.cloneColor = cloneColor;
  window.findClosestWithClass = findClosestWithClass;
  window.getAllColors = getAllColors;
  window.getColorByHex = getColorByHex;
  window.getColorsForLevel = getColorsForLevel;
  window.getMixingRecipe = getMixingRecipe;
  window.getTintForColor = getTintForColor;
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
