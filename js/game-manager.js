(function () {
  function getShelfBallPosition(index, totalCount) {
    const isDenseLayout = totalCount > 12;
    const maxColumns = isDenseLayout ? 7 : APP_CONFIG.shelfBallColumns;
    const spacingX = isDenseLayout ? 0.2 : APP_CONFIG.shelfBallSpacingX;
    const rowDepth = isDenseLayout ? 0.16 : APP_CONFIG.shelfBallRowDepth;
    const rowLift = isDenseLayout ? 0 : APP_CONFIG.shelfBallRowLift;
    const baseZ = isDenseLayout ? APP_CONFIG.shelfZ + 0.08 : APP_CONFIG.shelfZ;
    const columnCount = Math.max(
      1,
      Math.min(maxColumns, totalCount),
    );
    const rowCount = Math.max(1, Math.ceil(totalCount / columnCount));
    const rowIndex = Math.floor(index / columnCount);
    const columnIndex = index % columnCount;
    const columnsInRow =
      rowIndex === rowCount - 1
        ? totalCount - rowIndex * columnCount
        : columnCount;
    const rowSpan =
      spacingX * Math.max(0, columnsInRow - 1);
    const x =
      columnsInRow === 1
        ? 0
        : -rowSpan / 2 + spacingX * columnIndex;
    const rowCenterOffset = (rowCount - 1) / 2;
    const z =
      baseZ +
      (rowCenterOffset - rowIndex) * rowDepth;
    const y = APP_CONFIG.shelfY + rowIndex * rowLift;

    return { x: x, y: y, z: z };
  }

  function getMixingShelfSlotPosition(slotIndex) {
    const capacity = 10;
    const safeIndex = Math.max(0, Math.min(capacity - 1, Number(slotIndex) || 0));
    const columns = 5;
    const rowIndex = Math.floor(safeIndex / columns);
    const columnIndex = safeIndex % columns;
    const spacingX = 0.21;
    const rowDepth = 0.22;
    const rowLift = 0.015;
    const backRowXOffset = 0.035;
    const centerOffset = (columns - 1) / 2;

    return {
      x: (columnIndex - centerOffset) * spacingX + rowIndex * backRowXOffset,
      y: APP_CONFIG.shelfY + rowIndex * rowLift,
      z: APP_CONFIG.shelfZ + 0.05 - rowIndex * rowDepth,
    };
  }

  function getFinalNormalLevel() {
    return Object.keys(LEVEL_CONFIG).reduce(function (maxLevel, levelKey) {
      return Math.max(maxLevel, Number(levelKey));
    }, 0);
  }

  const GameManager = {
    state: "MENU",
    mode: "easy",

    isMixingMode: function isMixingMode(mode) {
      const modeName = mode || this.mode;
      return modeName === "mix-easy" || modeName === "mix-hard";
    },
    currentLevel: 1,
    placedCount: 0,
    totalForLevel: 0,
    runStartedAt: 0,
    transitionTimer: null,

    init: function init() {
      this.resetMixingShelfReservations();
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

    startMixingGame: function startMixingGame(mixMode) {
      if (window.FreePlayManager) FreePlayManager.stop();
      this.stopActiveRun();
      this.mode = mixMode === "mix-easy" ? "mix-easy" : "mix-hard";
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
      wheel.resetSlots();
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
      this.resetMixingShelfReservations();

      const config = MIX_LEVEL_CONFIG[level];
      if (!config) return;

      this.totalForLevel = config.targets.length;
      this.clearAllBalls();

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

      const wheel = this.wheelEl.components["color-wheel"];
      if (wheel) {
        wheel.resetSlots();
        wheel.prepareMixingLevel(level);
      }

      const initialColors = [
        getColorByHex("#FF0000"),
        getColorByHex("#FFFF00"),
        getColorByHex("#0000FF"),
        getColorByHex("#FFFFFF"),
      ].filter(Boolean);

      this.spawnBalls(initialColors, "mix");

      this.mixingShelfUsed = this.countMixingShelfOccupancy();

      if (window.UIManager) {
        UIManager.showGameHUD(this.mode);
        UIManager.updateHUD("Level " + level, "0/" + this.totalForLevel, this.mode === "mix-easy" ? "MIX EASY" : "MIX HARD");
        if (UIManager.updateShelfCounter) UIManager.updateShelfCounter(this.mixingShelfUsed);
      }

      if (window.Timer) {
        if (this.mode === "mix-hard") {
          Timer.start(config.timer);
        } else {
          Timer.stop();
          Timer.clearDisplay();
        }
      }
    },

    resetMixingShelfReservations: function resetMixingShelfReservations() {
      this.mixingShelfCapacity = 10;
      this.mixingShelfUsed = 0;
      this.mixingShelfSlots = [];
      for (var i = 0; i < this.mixingShelfCapacity; i += 1) {
        this.mixingShelfSlots.push({
          reserved: false,
          occupied: false,
          ballId: null,
        });
      }
      this.mixBallIdCounter = 0;
    },

    ensureMixingShelfState: function ensureMixingShelfState() {
      if (!this.mixingShelfSlots || !this.mixingShelfSlots.length) {
        this.resetMixingShelfReservations();
      }
    },

    createMixBallId: function createMixBallId() {
      this.mixBallIdCounter = (this.mixBallIdCounter || 0) + 1;
      return "mix-ball-" + this.mixBallIdCounter;
    },

    reserveMixingShelfSlot: function reserveMixingShelfSlot(ballId, preferredIndex) {
      this.ensureMixingShelfState();
      const slots = this.mixingShelfSlots;
      const hasPreferred =
        typeof preferredIndex === "number" &&
        preferredIndex >= 0 &&
        preferredIndex < this.mixingShelfCapacity;
      if (hasPreferred && !slots[preferredIndex].reserved) {
        slots[preferredIndex].reserved = true;
        slots[preferredIndex].ballId = ballId || null;
        return preferredIndex;
      }
      for (var i = 0; i < this.mixingShelfCapacity; i += 1) {
        if (!slots[i].reserved) {
          slots[i].reserved = true;
          slots[i].ballId = ballId || null;
          return i;
        }
      }
      return -1;
    },

    getShelfPositionForSlotIndex: function getShelfPositionForSlotIndex(slotIndex) {
      return getMixingShelfSlotPosition(slotIndex);
    },

    markMixingShelfOccupied: function markMixingShelfOccupied(slotIndex, ballId) {
      this.ensureMixingShelfState();
      if (typeof slotIndex !== "number" || slotIndex < 0 || slotIndex >= this.mixingShelfCapacity) {
        return false;
      }
      const slot = this.mixingShelfSlots[slotIndex];
      if (!slot.reserved) {
        slot.reserved = true;
      }
      if (ballId) {
        slot.ballId = ballId;
      }
      if (!slot.occupied) {
        slot.occupied = true;
        this.mixingShelfUsed += 1;
        this.updateShelfCounterUI();
      }
      if (this.mixingShelfUsed >= this.mixingShelfCapacity) {
        this.checkMixingGameOver();
      }
      return true;
    },

    markMixingShelfOffShelf: function markMixingShelfOffShelf(slotIndex, ballId) {
      this.ensureMixingShelfState();
      if (typeof slotIndex !== "number" || slotIndex < 0 || slotIndex >= this.mixingShelfCapacity) {
        return false;
      }
      const slot = this.mixingShelfSlots[slotIndex];
      if (ballId && slot.ballId && slot.ballId !== ballId) {
        return false;
      }
      if (slot.occupied) {
        slot.occupied = false;
        this.mixingShelfUsed = Math.max(0, this.mixingShelfUsed - 1);
        this.updateShelfCounterUI();
      }
      return true;
    },

    releaseMixingShelfSlot: function releaseMixingShelfSlot(slotIndex, ballId) {
      this.ensureMixingShelfState();
      if (typeof slotIndex !== "number" || slotIndex < 0 || slotIndex >= this.mixingShelfCapacity) {
        return false;
      }
      const slot = this.mixingShelfSlots[slotIndex];
      if (ballId && slot.ballId && slot.ballId !== ballId) {
        return false;
      }
      if (slot.occupied) {
        slot.occupied = false;
        this.mixingShelfUsed = Math.max(0, this.mixingShelfUsed - 1);
      }
      slot.reserved = false;
      slot.ballId = null;
      this.updateShelfCounterUI();
      return true;
    },

    updateShelfCounterUI: function updateShelfCounterUI() {
      if (window.UIManager && UIManager.updateShelfCounter) {
        UIManager.updateShelfCounter(this.mixingShelfUsed || 0);
      }
    },

    countMixingShelfOccupancy: function countMixingShelfOccupancy() {
      this.ensureMixingShelfState();
      return this.mixingShelfSlots.reduce(function (count, slot) {
        return count + (slot.occupied ? 1 : 0);
      }, 0);
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

          if (modeTag === "mix") {
            this.ensureMixingShelfState();
            const ballId = this.createMixBallId();
            const slotIndex = this.reserveMixingShelfSlot(ballId, index);
            const reservedPos = this.getShelfPositionForSlotIndex(slotIndex);
            ball.dataset.ballId = ballId;
            ball.dataset.stableBallId = ballId;
            ball.dataset.shelfSlotIndex = String(slotIndex);
            position.x = reservedPos.x;
            position.y = reservedPos.y;
            position.z = reservedPos.z;
          }

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
          if (modeTag === "mix") {
            ball.dataset.onShelf = "true";
            this.markMixingShelfOccupied(Number(ball.dataset.shelfSlotIndex), ball.dataset.ballId);
          }
          this.ballsContainer.appendChild(ball);
        }.bind(this),
      );
    },

    onColorPlaced: function onColorPlaced() {
      if (this.state !== "PLAYING") {
        return;
      }

      this.placedCount += 1;
      if (window.UIManager) {
        UIManager.updateHUD(
          "Level " + this.currentLevel,
          this.placedCount + "/" + this.totalForLevel,
          this.mode === "mix-easy" ? "MIX EASY" : this.mode === "mix-hard" ? "MIX HARD" : this.mode.toUpperCase(),
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
      if (this.sceneEl) {
        this.sceneEl.emit("level-complete-celebration", {
          level: this.currentLevel,
          mode: this.mode,
          finalLevel: false,
        });
      }

      if (this.isMixingMode()) {
        if (this.currentLevel >= 5) {
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

      if (this.currentLevel >= getFinalNormalLevel()) {
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
      if (this.sceneEl) {
        this.sceneEl.emit("level-complete-celebration", {
          level: this.currentLevel,
          mode: this.mode,
          finalLevel: true,
        });
      }
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
      if (this.isMixingMode()) {
        this.initMixingLevel(this.currentLevel);
      } else {
        this.initLevel(this.currentLevel);
      }
    },

    skipLevel: function skipLevel() {
      if ((this.mode !== "easy" && this.mode !== "mix-easy") || this.state !== "PLAYING") {
        return;
      }

      if (this.mode === "easy") {
        if (this.currentLevel >= getFinalNormalLevel()) {
          const totalTime = (performance.now() - this.runStartedAt) / 1000;
          this.victory(totalTime);
          return;
        }

        if (window.SoundManager) SoundManager.play("levelup");
        if (window.UIManager) {
          UIManager.showGameHUD(this.mode);
          UIManager.showTransientMessage("Skipped to Level " + (this.currentLevel + 1), 1500);
        }

        this.clearLevelPlacements(this.currentLevel);
        this.clearLooseBalls();

        setTimeout(
          function () {
            this.initLevel(this.currentLevel + 1);
          }.bind(this),
          1600,
        );
      } else if (this.mode === "mix-easy") {
        if (this.currentLevel >= 5) {
          const totalTime = (performance.now() - this.runStartedAt) / 1000;
          this.victory(totalTime);
          return;
        }

        if (window.SoundManager) SoundManager.play("levelup");
        if (window.UIManager) {
          UIManager.showGameHUD(this.mode);
          UIManager.showTransientMessage("Skipped to Level " + (this.currentLevel + 1), 1500);
        }

        this.clearLevelPlacements(this.currentLevel);
        this.clearLooseBalls();

        setTimeout(
          function () {
            this.initMixingLevel(this.currentLevel + 1);
          }.bind(this),
          1600,
        );
      }
    },

    clearLevelPlacements: function clearLevelPlacements(level) {
      let levelHexes;
      if (this.isMixingMode()) {
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
      if (this.isMixingMode()) {
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
      this.resetMixingShelfReservations();
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
