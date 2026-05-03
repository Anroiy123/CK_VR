(function () {
  function getShelfBallPosition(index, totalCount) {
    const columnCount = Math.max(
      1,
      Math.min(APP_CONFIG.shelfBallColumns, totalCount),
    );
    const rowCount = Math.max(1, Math.ceil(totalCount / columnCount));
    const rowIndex = Math.floor(index / columnCount);
    const columnIndex = index % columnCount;
    const columnsInRow =
      rowIndex === rowCount - 1
        ? totalCount - rowIndex * columnCount
        : columnCount;
    const rowSpan =
      APP_CONFIG.shelfBallSpacingX * Math.max(0, columnsInRow - 1);
    const x =
      columnsInRow === 1
        ? 0
        : -rowSpan / 2 + APP_CONFIG.shelfBallSpacingX * columnIndex;
    const rowCenterOffset = (rowCount - 1) / 2;
    const z =
      APP_CONFIG.shelfZ +
      (rowCenterOffset - rowIndex) * APP_CONFIG.shelfBallRowDepth;
    const y = APP_CONFIG.shelfY + rowIndex * APP_CONFIG.shelfBallRowLift;

    return { x: x, y: y, z: z };
  }

  const GameManager = {
    state: "MENU",
    mode: "easy",
    currentLevel: 1,
    placedCount: 0,
    totalForLevel: 0,
    runStartedAt: 0,
    transitionTimer: null,

    init: function init() {
      this.sceneEl = document.querySelector("a-scene");
      this.wheelEl = document.getElementById("color-wheel");
      this.ballsContainer = document.getElementById("balls-container");

      this.sceneEl.addEventListener(
        "color-placed",
        function (event) {
          if (event.detail.mode !== "game") {
            return;
          }
          this.onColorPlaced();
        }.bind(this),
      );

      this.backToMenu(true);
    },

    startGame: function startGame(mode) {
      if (window.FreePlayManager) FreePlayManager.stop();
      this.stopActiveRun();
      this.mode = mode;
      this.state = "PLAYING";
      this.currentLevel = 1;
      this.runStartedAt = performance.now();
      this.resetBoard();
      if (window.SoundManager) SoundManager.startBGM();
      this.initLevel(1);
    },

    startMixingGame: function startMixingGame() {
      if (window.FreePlayManager) FreePlayManager.stop();
      this.stopActiveRun();
      this.mode = "mix";
      this.state = "PLAYING";
      this.currentLevel = 1;
      this.runStartedAt = performance.now();
      this.resetBoard();
      if (window.SoundManager) SoundManager.startBGM();
      this.initMixingLevel(1);
    },

    stopActiveRun: function stopActiveRun() {
      Timer.stop();
      if (this.transitionTimer) {
        clearTimeout(this.transitionTimer);
        this.transitionTimer = null;
      }
    },

    resetBoard: function resetBoard() {
      this.clearAllBalls();
      const wheel = this.wheelEl.components["color-wheel"];
      if (wheel) {
        wheel.resetSlots();
      }
      this.placedCount = 0;
      this.totalForLevel = 0;
    },

    initLevel: function initLevel(level) {
      this.state = "PLAYING";
      this.currentLevel = level;
      this.placedCount = 0;

      const levelColors = getColorsForLevel(level);
      this.totalForLevel = levelColors.length;

      this.clearLooseBalls();

      const wheel = this.wheelEl.components["color-wheel"];
      wheel.prepareGameLevel(level);

      this.spawnBalls(levelColors, "game");

      UIManager.showGameHUD(this.mode);
      UIManager.updateHUD(
        "Level " + level,
        "0/" + this.totalForLevel,
        this.mode.toUpperCase(),
      );

      if (this.mode === "hard") {
        Timer.start(LEVEL_CONFIG[level].timer);
      } else {
        Timer.clearDisplay();
      }
    },

    initMixingLevel: function initMixingLevel(level) {
      this.state = "PLAYING";
      this.currentLevel = level;
      this.placedCount = 0;
      this.mixingShelfUsed = 4;

      const config = MIX_LEVEL_CONFIG[level];
      if (!config) return;

      this.totalForLevel = config.targets.length;
      this.clearLooseBalls();

      const wheel = this.wheelEl.components["color-wheel"];
      if (wheel) wheel.prepareMixingLevel(level);

      const initialColors = [
        getColorByHex("#FF0000"),
        getColorByHex("#FFFF00"),
        getColorByHex("#0000FF"),
        getColorByHex("#FFFFFF"),
      ].filter(Boolean);

      this.spawnBalls(initialColors, "mix");

      if (window.UIManager) {
        UIManager.showGameHUD(this.mode);
        UIManager.updateHUD("Level " + level, "0/" + this.totalForLevel, "MIXING");
        if (UIManager.updateShelfCounter) UIManager.updateShelfCounter(this.mixingShelfUsed);
        if (UIManager.updateHintPanel) UIManager.updateHintPanel(level);
      }

      if (window.Timer) {
        Timer.start(config.timer);
      }
    },

    getNextShelfPosition: function getNextShelfPosition() {
      const index = this.mixingShelfUsed || 0;
      return getShelfBallPosition(index, 10);
    },

    incrementShelfCounter: function incrementShelfCounter() {
      this.mixingShelfUsed = (this.mixingShelfUsed || 0) + 1;
      if (window.UIManager && UIManager.updateShelfCounter) {
        UIManager.updateShelfCounter(this.mixingShelfUsed);
      }
      if (this.mixingShelfUsed >= 10) {
        this.checkMixingGameOver();
      }
    },

    checkMixingGameOver: function checkMixingGameOver() {
      if (this.mixingShelfUsed >= 10 && this.placedCount < this.totalForLevel) {
        if (window.UIManager) UIManager.showTransientMessage("Shelf Full! Game Over in 3s...", 3000);
        setTimeout(function () {
          if (this.state === "PLAYING") this.onTimeUp();
        }.bind(this), 3000);
      }
    },

    spawnBalls: function spawnBalls(colors, modeTag) {
      const shuffledColors = shuffleColors(colors);

      shuffledColors.forEach(
        function (color, index) {
          const ball = document.createElement("a-entity");
          const position = getShelfBallPosition(index, shuffledColors.length);

          ball.setAttribute("position", vec3ToString(toVector3(position)));
          ball.setAttribute("color-ball", {
            colorHex: color.hex,
            colorName: color.name,
            targetAngle: color.angle,
            originalPosition: position,
          });
          ball.setAttribute("snap-to-slot", {
            snapDistance: APP_CONFIG.snapDistance,
          });
          ball.setAttribute("ball-respawn", { minY: -1, checkInterval: 500 });
          ball.dataset.modeTag = modeTag;
          this.ballsContainer.appendChild(ball);
        }.bind(this),
      );
    },

    onColorPlaced: function onColorPlaced() {
      if (this.state !== "PLAYING") {
        return;
      }

      if (this.mode === "mix") {
        this.mixingShelfUsed = Math.max(0, (this.mixingShelfUsed || 0) - 1);
        if (window.UIManager && UIManager.updateShelfCounter) {
          UIManager.updateShelfCounter(this.mixingShelfUsed);
        }
      }

      this.placedCount += 1;
      if (window.UIManager) {
        UIManager.updateHUD(
          "Level " + this.currentLevel,
          this.placedCount + "/" + this.totalForLevel,
          this.mode === "mix" ? "MIXING" : this.mode.toUpperCase(),
        );
      }

      if (this.placedCount < this.totalForLevel) {
        return;
      }

      this.levelComplete();
    },

    levelComplete: function levelComplete() {
      this.state = "LEVEL_COMPLETE";
      if (window.Timer) Timer.stop();
      if (window.SoundManager) SoundManager.play("levelup");

      if (this.mode === "mix") {
        if (this.currentLevel >= 6) {
          const totalTime = (performance.now() - this.runStartedAt) / 1000;
          this.victory(totalTime);
          return;
        }
        if (window.UIManager) {
          UIManager.showGameHUD(this.mode);
          UIManager.showTransientMessage("Level " + this.currentLevel + " Complete", 2300);
        }
        this.transitionTimer = setTimeout(function () {
          this.initMixingLevel(this.currentLevel + 1);
        }.bind(this), 2400);
        return;
      }

      if (this.currentLevel >= 3) {
        const totalTime = (performance.now() - this.runStartedAt) / 1000;
        this.victory(totalTime);
        return;
      }

      if (window.UIManager) {
        UIManager.showGameHUD(this.mode);
        UIManager.showTransientMessage(
          "Level " + this.currentLevel + " Complete",
          2300,
        );
      }
      this.transitionTimer = setTimeout(
        function () {
          this.initLevel(this.currentLevel + 1);
        }.bind(this),
        2400,
      );
    },

    victory: function victory(totalTime) {
      this.state = "VICTORY";
      Timer.stop();
      Leaderboard.submit(totalTime, this.mode);
      UIManager.showVictory(totalTime, this.mode);
      SoundManager.play("victory");
    },

    onTimeUp: function onTimeUp() {
      if (this.state !== "PLAYING") {
        return;
      }
      this.state = "TIME_UP";
      UIManager.showGameOver(this.currentLevel, this.mode);
    },

    retryCurrentLevel: function retryCurrentLevel() {
      if (this.state !== "TIME_UP" && this.state !== "PLAYING") {
        return;
      }

      this.clearLevelPlacements(this.currentLevel);
      this.clearLooseBalls();
      if (this.mode === "mix") {
        this.initMixingLevel(this.currentLevel);
      } else {
        this.initLevel(this.currentLevel);
      }
    },

    clearLevelPlacements: function clearLevelPlacements(level) {
      let levelHexes;
      if (this.mode === "mix") {
        const config = MIX_LEVEL_CONFIG[level];
        levelHexes = new Set(config ? config.targets : []);
      } else {
        levelHexes = new Set(
          getColorsForLevel(level).map(function (color) {
            return color.hex;
          }),
        );
      }

      document.querySelectorAll(".color-ball-entity").forEach(function (ball) {
        const ballData = ball.getAttribute("color-ball");
        if (!ballData || !levelHexes.has(ballData.colorHex)) {
          return;
        }
        ball.remove();
      });

      const wheel = this.wheelEl.components["color-wheel"];
      if (this.mode === "mix") {
        const config = MIX_LEVEL_CONFIG[level];
        if (config) {
          config.targets.forEach(function (hex) {
            wheel.clearColor(hex, false);
          });
        }
      } else {
        getColorsForLevel(level).forEach(function (color) {
          wheel.clearColor(color.hex, false);
        });
      }
    },

    clearLooseBalls: function clearLooseBalls() {
      while (this.ballsContainer.firstChild) {
        this.ballsContainer.removeChild(this.ballsContainer.firstChild);
      }
    },

    clearAllBalls: function clearAllBalls() {
      document.querySelectorAll(".color-ball-entity").forEach(function (ball) {
        ball.remove();
      });
    },

    backToMenu: function backToMenu(silent) {
      this.stopActiveRun();
      if (window.FreePlayManager) FreePlayManager.stop();
      this.state = "MENU";
      this.mode = "easy";
      this.currentLevel = 1;
      this.mixingShelfUsed = 0;
      this.resetBoard();
      
      const station = document.querySelector('[mixing-station]');
      if (station && station.components['mixing-station']) {
        const comp = station.components['mixing-station'];
        if (comp.heldBallEl && comp.heldBallEl.parentNode) comp.heldBallEl.parentNode.removeChild(comp.heldBallEl);
        if (comp.resultBallEl && comp.resultBallEl.parentNode) comp.resultBallEl.parentNode.removeChild(comp.resultBallEl);
        comp.state = 'EMPTY';
        comp.heldBallEl = null;
        comp.resultBallEl = null;
        comp.setIndicatorState('empty');
      }

      if (window.UIManager) {
        UIManager.showMenu();
        if (UIManager.updateShelfCounter) UIManager.updateShelfCounter(0);
        if (UIManager.updateHintPanel) UIManager.updateHintPanel(0);
      }
      if (window.Leaderboard) Leaderboard.renderToPanel();
      if (!silent && window.SoundManager) {
        SoundManager.stopBGM();
      }
    },
  };

  function bootstrap() {
    SoundManager.init();
    ParticlePool.init();
    Leaderboard.renderToPanel();
    FreePlayManager.init();
    UIManager.init();
    GameManager.init();
  }

  window.GameManager = GameManager;

  document.addEventListener("DOMContentLoaded", function () {
    onSceneReady(bootstrap);
  });
})();
