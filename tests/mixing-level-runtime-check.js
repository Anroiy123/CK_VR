const fs = require('fs');
const path = require('path');
const vm = require('vm');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

(function run() {
  const context = buildContext();
  vm.createContext(context);
  loadScripts(context);

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

  wheelDef.prepareMixingLevel.call(wheelInstance, 4);
  assert(capturedVisibleColors, 'prepareMixingLevel should pass visible colors to updateVisibleSlots');
  assert(capturedVisibleColors.length === 13, 'Level 4 should reveal 13 target slots');
  assert(wheelInstance.tintRingEl.attributes.visible === false, 'Tint ring should stay hidden for tint level');
  assert(wheelInstance.centerRingEl.attributes.visible === false, 'Center ring should stay hidden when white is targeted');

  capturedVisibleColors = null;
  wheelDef.prepareMixingLevel.call(wheelInstance, 2);
  assert(capturedVisibleColors.length === 3, 'Level 2 should reveal only the three secondary targets');
  assert(wheelInstance.tintRingEl.attributes.visible === false, 'Tint ring should be hidden when no tint targets are present');
  assert(wheelInstance.centerRingEl.attributes.visible === false, 'Center ring should be hidden when white is not targeted');

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
  context.GameManager.mode = 'mix-easy';
  context.GameManager.runStartedAt = 0;
  context.GameManager.victory = function () {
    victoryCalls += 1;
  };
  context.GameManager.initMixingLevel = function (level) {
    nextLevelRequested = level;
  };

  context.GameManager.currentLevel = 5;
  context.GameManager.levelComplete();
  assert(victoryCalls === 1, 'Completing mixing level 5 should trigger victory');
  assert(nextLevelRequested === null, 'Completing mixing level 5 should not queue another mixing level');

  victoryCalls = 0;
  nextLevelRequested = null;
  context.__scheduledHandler = null;
  context.GameManager.currentLevel = 4;
  context.GameManager.levelComplete();
  assert(victoryCalls === 0, 'Completing mixing level 4 should not trigger victory');
  assert(typeof context.__scheduledHandler === 'function', 'Completing mixing level 4 should schedule the next mixing level');
  context.__scheduledHandler();
  assert(nextLevelRequested === 5, 'Completing mixing level 4 should advance to mixing level 5');

  victoryCalls = 0;
  nextLevelRequested = null;
  context.__scheduledHandler = null;
  context.GameManager.state = 'PLAYING';
  context.GameManager.currentLevel = 5;
  context.GameManager.skipLevel();
  assert(victoryCalls === 1, 'Skipping mixing level 5 should trigger victory');
  assert(nextLevelRequested === null, 'Skipping mixing level 5 should not queue another mixing level');

  console.log('PASS mixing runtime behavior matches five-level progression');
})();
