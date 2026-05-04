const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadColorData() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'color-data.js'), 'utf8');
  const context = {
    window: {},
    THREE: {
      Vector3: function Vector3(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.clone = function clone() {
          return new context.THREE.Vector3(this.x, this.y, this.z);
        };
      },
    },
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
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

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

(function run() {
  const data = loadColorData();
  const expectedLevels = [1, 2, 3, 4, 5];
  const actualLevels = Object.keys(data.MIX_LEVEL_CONFIG).map(Number).sort(function (left, right) {
    return left - right;
  });

  assertArrayEqual(actualLevels, expectedLevels, 'Mixing mode must define exactly five levels');

  assertArrayEqual(
    data.MIX_LEVEL_CONFIG[1].targets.slice().sort(),
    ['#0000FF', '#FF0000', '#FFFF00'].sort(),
    'Level 1 must target only primary colors'
  );

  assertArrayEqual(
    data.MIX_LEVEL_CONFIG[2].targets.slice().sort(),
    ['#00FF00', '#8000FF', '#FF8000'].sort(),
    'Level 2 must target only secondary colors'
  );

  assertArrayEqual(
    data.MIX_LEVEL_CONFIG[3].targets.slice().sort(),
    ['#0040FF', '#00FF80', '#80FF00', '#FF0080', '#FF4000', '#FFBF00'].sort(),
    'Level 3 must target only tertiary colors'
  );

  assertArrayEqual(
    data.MIX_LEVEL_CONFIG[4].targets.slice().sort(),
    ['#8080FF', '#80A0FF', '#80FF80', '#80FFC0', '#C080FF', '#C0FF80', '#FF8080', '#FF80C0', '#FFC080', '#FFDF80', '#FFFF80', '#FFA080', '#FFFFFF'].sort(),
    'Level 4 must target all tint colors plus white center'
  );

  assertArrayEqual(
    data.MIX_LEVEL_CONFIG[5].targets.slice().sort(),
    [
      '#0000FF', '#00FF00', '#0040FF', '#00FF80', '#80A0FF',
      '#80FF00', '#8000FF', '#8080FF', '#80FF80', '#80FFC0',
      '#C080FF', '#C0FF80', '#FF0000', '#FF0080', '#FF4000',
      '#FF8000', '#FF8080', '#FF80C0', '#FFBF00', '#FFC080',
      '#FFDF80', '#FFFF00', '#FFFF80', '#FFFFFF', '#FFA080'
    ].sort(),
    'Level 5 must target the full board plus white center'
  );

  assert(data.MIX_LEVEL_CONFIG[4].targets.length === 13, 'Level 4 must have 13 targets');
  assert(data.MIX_LEVEL_CONFIG[5].targets.length === 25, 'Level 5 must have 25 targets');

  console.log('PASS mixing level config matches five-level curriculum');
})();
