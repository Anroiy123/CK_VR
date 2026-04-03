(function () {
  function getShelfBallPosition(index, totalCount) {
    const columnCount = Math.max(1, Math.min(APP_CONFIG.shelfBallColumns, totalCount));
    const rowCount = Math.max(1, Math.ceil(totalCount / columnCount));
    const rowIndex = Math.floor(index / columnCount);
    const columnIndex = index % columnCount;
    const columnsInRow = rowIndex === rowCount - 1
      ? totalCount - rowIndex * columnCount
      : columnCount;
    const rowSpan = APP_CONFIG.shelfBallSpacingX * Math.max(0, columnsInRow - 1);
    const x = columnsInRow === 1
      ? 0
      : -rowSpan / 2 + APP_CONFIG.shelfBallSpacingX * columnIndex;
    const rowCenterOffset = (rowCount - 1) / 2;
    const z = APP_CONFIG.shelfZ + (rowCenterOffset - rowIndex) * APP_CONFIG.shelfBallRowDepth;
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

      this.sceneEl.addEventListener("color-placed", function (event) {
        if (event.detail.mode !== "game") {
          return;
        }
        this.onColorPlaced();
      }.bind(this));

      this.backToMenu(true);
    },

    startGame: function startGame(mode) {
      FreePlayManager.stop();
      this.stopActiveRun();
      this.mode = mode;
      this.state = "PLAYING";
      this.currentLevel = 1;
      this.runStartedAt = performance.now();
      this.resetBoard();
      SoundManager.startBGM();
      this.initLevel(1);
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
      UIManager.updateHUD("Level " + level + ": " + LEVEL_CONFIG[level].label, "0/" + this.totalForLevel, this.mode.toUpperCase());

      if (this.mode === "hard") {
        Timer.start(LEVEL_CONFIG[level].timer);
      } else {
        Timer.clearDisplay();
      }
    },

    spawnBalls: function spawnBalls(colors, modeTag) {
      const shuffledColors = shuffleColors(colors);

      shuffledColors.forEach(function (color, index) {
        const ball = document.createElement("a-entity");
        const position = getShelfBallPosition(index, shuffledColors.length);

        ball.setAttribute("position", vec3ToString(toVector3(position)));
        ball.setAttribute("color-ball", {
          colorHex: color.hex,
          colorName: color.name,
          targetAngle: color.angle,
          originalPosition: position,
        });
        ball.setAttribute("snap-to-slot", { snapDistance: APP_CONFIG.snapDistance });
        ball.setAttribute("ball-respawn", { minY: -1, checkInterval: 500 });
        ball.dataset.modeTag = modeTag;
        this.ballsContainer.appendChild(ball);
      }.bind(this));
    },

    onColorPlaced: function onColorPlaced() {
      if (this.state !== "PLAYING") {
        return;
      }

      this.placedCount += 1;
      UIManager.updateHUD("Level " + this.currentLevel + ": " + LEVEL_CONFIG[this.currentLevel].label, this.placedCount + "/" + this.totalForLevel, this.mode.toUpperCase());

      if (this.placedCount < this.totalForLevel) {
        return;
      }

      this.levelComplete();
    },

    levelComplete: function levelComplete() {
      this.state = "LEVEL_COMPLETE";
      Timer.stop();
      SoundManager.play("levelup");

      if (this.currentLevel >= 3) {
        const totalTime = (performance.now() - this.runStartedAt) / 1000;
        this.victory(totalTime);
        return;
      }

      UIManager.showGameHUD(this.mode);
      UIManager.showTransientMessage("Level " + this.currentLevel + " Complete", 2300);
      this.transitionTimer = setTimeout(function () {
        this.initLevel(this.currentLevel + 1);
      }.bind(this), 2400);
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
      this.initLevel(this.currentLevel);
    },

    clearLevelPlacements: function clearLevelPlacements(level) {
      const levelHexes = new Set(getColorsForLevel(level).map(function (color) {
        return color.hex;
      }));

      document.querySelectorAll(".color-ball-entity").forEach(function (ball) {
        const ballData = ball.getAttribute("color-ball");
        if (!ballData || !levelHexes.has(ballData.colorHex)) {
          return;
        }
        ball.remove();
      });

      const wheel = this.wheelEl.components["color-wheel"];
      getColorsForLevel(level).forEach(function (color) {
        wheel.clearColor(color.hex, false);
      });
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
      FreePlayManager.stop();
      this.state = "MENU";
      this.mode = "easy";
      this.currentLevel = 1;
      this.resetBoard();
      UIManager.showMenu();
      Leaderboard.renderToPanel();
      if (!silent) {
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
