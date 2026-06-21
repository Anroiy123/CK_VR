const fs = require('fs');
const path = require('path');
const vm = require('vm');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertArrayEqual(actual, expected, message) {
  assert(actual.length === expected.length, message + ' (length mismatch: ' + actual.length + ' !== ' + expected.length + ')');
  expected.forEach(function (value, index) {
    assert(actual[index] === value, message + ' (index ' + index + ': ' + actual[index] + ' !== ' + value + ')');
  });
}

function createElement(tagName) {
  return {
    tagName: tagName,
    children: [],
    attributes: {},
    dataset: {},
    classList: {
      add: function () {},
      remove: function () {},
      contains: function () { return false; },
    },
    object3D: {
      position: { set: function () {}, copy: function () {} },
      rotation: { set: function () {} },
      attach: function () {},
      getWorldPosition: function (target) { return target; },
      worldToLocal: function (target) { return target; },
    },
    appendChild: function (child) {
      this.children.push(child);
      child.parentElement = this;
      return child;
    },
    setAttribute: function (name, value) {
      this.attributes[name] = value;
      if (name === 'visible') {
        this.visible = value;
      }
    },
    getAttribute: function (name) {
      return this.attributes[name];
    },
    querySelector: function () {
      return createElement('stub');
    },
    querySelectorAll: function () {
      return [];
    },
  };
}

function buildContext() {
  const root = createElement('root');
  const colorWheelEl = createElement('a-entity');
  colorWheelEl.components = {};
  root.appendChild(colorWheelEl);

  const documentStub = {
    body: root,
    createElement: createElement,
    addEventListener: function () {},
    querySelector: function (selector) {
      if (selector === 'a-scene') {
        return { hasLoaded: true, addEventListener: function () {} };
      }
      if (selector === '#color-wheel' || selector === 'a-entity#color-wheel') {
        return colorWheelEl;
      }
      return null;
    },
    getElementById: function (id) {
      if (id === 'color-wheel') {
        return colorWheelEl;
      }
      return null;
    },
    querySelectorAll: function () {
      return [];
    },
  };

  const AFRAME = {
    components: {},
    registerComponent: function (name, definition) {
      this.components[name] = definition;
    },
  };

  const context = {
    window: {},
    document: documentStub,
    AFRAME: AFRAME,
    console: console,
    Math: Math,
    Object: Object,
    Array: Array,
    Number: Number,
    String: String,
    Boolean: Boolean,
    RegExp: RegExp,
    Date: Date,
    JSON: JSON,
    Set: Set,
    performance: {
      now: function () {
        return 1000;
      },
    },
    setTimeout: function (handler) {
      context.__scheduledHandler = handler;
      return 1;
    },
    clearTimeout: function () {},
    THREE: {
      Vector3: function Vector3(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.set = function (nextX, nextY, nextZ) {
          this.x = nextX;
          this.y = nextY;
          this.z = nextZ;
        };
        this.copy = function (other) {
          this.x = other.x;
          this.y = other.y;
          this.z = other.z;
        };
        this.clone = function () {
          return new context.THREE.Vector3(this.x, this.y, this.z);
        };
      },
    },
  };
  context.window = context;
  context.document = documentStub;
  return context;
}

function loadScripts(context) {
  ['color-data.js', 'color-wheel.js', 'game-manager.js'].forEach(function (file) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
    vm.runInContext(source, context, { filename: file });
  });
}

function levelHexes(context, level) {
  return context.getColorsForLevel(level).map(function (color) {
    return color.hex;
  }).sort();
}

(function run() {
  const context = buildContext();
  vm.createContext(context);
  loadScripts(context);

  assertArrayEqual(Object.keys(context.LEVEL_CONFIG).map(Number).sort(), [1, 2, 3, 4, 5], 'Normal mode must define exactly five levels');
  assertArrayEqual(levelHexes(context, 1), ['#0000FF', '#FF0000', '#FFFF00', '#FFFFFF'].sort(), 'Level 1 must include primary colors plus white');
  assertArrayEqual(levelHexes(context, 2), ['#00C800', '#B000E8', '#FF8A00'].sort(), 'Level 2 must include secondary colors');
  assertArrayEqual(levelHexes(context, 3), ['#00A8A8', '#6A00FF', '#8FEA00', '#D0008A', '#FF4D00', '#FFC400'].sort(), 'Level 3 must include tertiary colors');
  assertArrayEqual(levelHexes(context, 4), ['#8080FF', '#A878E8', '#80E480', '#80D4D4', '#D880F4', '#C7F580', '#FF8080', '#E880C5', '#FFC580', '#FFE280', '#FFFF80', '#FFA680'].sort(), 'Level 4 must include all tint colors');
  assert(context.getColorsForLevel(5).length === 25, 'Level 5 must include 25 targets');

  const wheelDef = context.AFRAME.components['color-wheel'];
  assert(wheelDef, 'Expected color-wheel component to be registered');

  let capturedVisibleColors = null;
  const wheelInstance = {
    tintRingEl: createElement('a-torus'),
    centerRingEl: createElement('a-torus'),
    updateVisibleSlots: function (colors) {
      capturedVisibleColors = colors;
    },
  };

  wheelDef.prepareGameLevel.call(wheelInstance, 1);
  assert(capturedVisibleColors.length === 4, 'Level 1 should reveal 4 normal targets');
  assert(wheelInstance.tintRingEl.attributes.visible === false, 'Tint ring should be hidden on Level 1');
  assert(wheelInstance.centerRingEl.attributes.visible === false, 'Center ring should stay hidden on Level 1');

  wheelDef.prepareGameLevel.call(wheelInstance, 4);
  assert(capturedVisibleColors.length === 12, 'Level 4 should reveal 12 tint targets');
  assert(wheelInstance.tintRingEl.attributes.visible === false, 'Tint ring should stay hidden on Level 4');
  assert(wheelInstance.centerRingEl.attributes.visible === false, 'Center ring should be hidden on Level 4');

  wheelDef.prepareGameLevel.call(wheelInstance, 5);
  assert(capturedVisibleColors.length === 25, 'Level 5 should reveal 25 normal targets');
  assert(wheelInstance.tintRingEl.attributes.visible === false, 'Tint ring should stay hidden on Level 5');
  assert(wheelInstance.centerRingEl.attributes.visible === false, 'Center ring should stay hidden on Level 5');

  context.UIManager = {
    showGameHUD: function () {},
    showTransientMessage: function () {},
    updateHUD: function () {},
    updateShelfCounter: function () {},
    showVictory: function () {},
    showGameOver: function () {},
  };
  context.Timer = {
    start: function () {},
    stop: function () {},
    clearDisplay: function () {},
  };
  context.SoundManager = {
    play: function () {},
  };
  context.Leaderboard = {
    submit: function () {},
  };

  let victoryCalls = 0;
  let nextLevelRequested = null;
  context.GameManager.mode = 'easy';
  context.GameManager.runStartedAt = 0;
  context.GameManager.victory = function () {
    victoryCalls += 1;
  };
  context.GameManager.initLevel = function (level) {
    nextLevelRequested = level;
  };

  context.GameManager.currentLevel = 5;
  context.GameManager.levelComplete();
  assert(victoryCalls === 1, 'Completing normal level 5 should trigger victory');
  assert(nextLevelRequested === null, 'Completing normal level 5 should not queue another normal level');

  victoryCalls = 0;
  nextLevelRequested = null;
  context.__scheduledHandler = null;
  context.GameManager.currentLevel = 4;
  context.GameManager.levelComplete();
  assert(victoryCalls === 0, 'Completing normal level 4 should not trigger victory');
  assert(typeof context.__scheduledHandler === 'function', 'Completing normal level 4 should schedule the next normal level');
  context.__scheduledHandler();
  assert(nextLevelRequested === 5, 'Completing normal level 4 should advance to normal level 5');

  victoryCalls = 0;
  nextLevelRequested = null;
  context.__scheduledHandler = null;
  context.GameManager.state = 'PLAYING';
  context.GameManager.currentLevel = 5;
  context.GameManager.skipLevel();
  assert(victoryCalls === 1, 'Skipping normal level 5 should trigger victory');
  assert(nextLevelRequested === null, 'Skipping normal level 5 should not queue another normal level');

  console.log('PASS normal mode config and runtime behavior matches five-level progression');
})();
