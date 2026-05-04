(function () {
  const UIManager = {
    panels: {},
    refs: {},
    world: {},
    statusTimer: null,

    init: function init() {
      this.panels = {
        menu: document.getElementById("menu-panel"),
        leaderboard: document.getElementById("leaderboard-panel"),
        victory: document.getElementById("victory-panel"),
        gameover: document.getElementById("gameover-panel"),
        freeplay: document.getElementById("freeplay-panel"),
        status: document.getElementById("status-panel"),
        hud: document.getElementById("diegetic-hud"),
        timer: document.getElementById("hud-timer-row"),
        skipLevel: document.getElementById("skip-level-button"),
      };

      this.refs = {
        hudLevel: document.getElementById("hud-level"),
        hudProgress: document.getElementById("hud-progress"),
        hudMode: document.getElementById("hud-mode"),
        timerText: document.getElementById("timer-text"),
        victoryTime: document.getElementById("victory-time"),
        victoryMode: document.getElementById("victory-mode"),
        gameoverLevel: document.getElementById("gameover-level"),
        gameoverMode: document.getElementById("gameover-mode"),
        statusText: document.getElementById("status-text"),
        shelfCounter: document.getElementById("hud-shelf-counter"),
      };

      this.world = {
        wheel: document.getElementById("color-wheel"),
        shelf: document.getElementById("shelf"),
        balls: document.getElementById("balls-container"),
        mixingStation: document.getElementById("mixing-station"),
      };

      const scene = document.querySelector("a-scene");
      scene.addEventListener("start-easy", this.startEasy.bind(this));
      scene.addEventListener("start-hard", this.startHard.bind(this));
      scene.addEventListener("start-mix-easy", this.startMixEasy.bind(this));
      scene.addEventListener("start-mix-hard", this.startMixHard.bind(this));
      scene.addEventListener("start-freeplay", this.startFreePlay.bind(this));
      scene.addEventListener(
        "show-leaderboard",
        this.showLeaderboard.bind(this),
      );
      scene.addEventListener("back-menu", this.backToMenu.bind(this));
      scene.addEventListener("replay", this.replay.bind(this));
      scene.addEventListener("retry-level", this.retryLevel.bind(this));
      scene.addEventListener("reset-freeplay", this.resetFreePlay.bind(this));
      scene.addEventListener("skip-level", this.skipLevel.bind(this));

      this.showMenu();
    },

    startEasy: function startEasy() {
      GameManager.startGame("easy");
    },

    startHard: function startHard() {
      GameManager.startGame("hard");
    },

    startMixEasy: function startMixEasy() {
      GameManager.startMixingGame("mix-easy");
    },

    startMixHard: function startMixHard() {
      GameManager.startMixingGame("mix-hard");
    },

    startFreePlay: function startFreePlay() {
      FreePlayManager.start();
    },

    showLeaderboard: function showLeaderboard() {
      Leaderboard.renderToPanel();
      this.hideAll();
      this.setGameplayWorldVisible(false);
      this.setVisible("leaderboard", true);
    },

    replay: function replay() {
      if (window.GameManager && GameManager.isMixingMode && GameManager.isMixingMode()) {
        GameManager.startMixingGame(GameManager.mode);
        return;
      }
      GameManager.startGame(
        GameManager.mode === "freeplay" ? "easy" : GameManager.mode,
      );
    },

    retryLevel: function retryLevel() {
      GameManager.retryCurrentLevel();
    },

    resetFreePlay: function resetFreePlay() {
      FreePlayManager.reset();
    },

    skipLevel: function skipLevel() {
      GameManager.skipLevel();
    },

    backToMenu: function backToMenu() {
      GameManager.backToMenu();
    },

    hideAll: function hideAll() {
      Object.keys(this.panels).forEach(
        function (name) {
          this.setVisible(name, false);
        }.bind(this),
      );
    },

    setVisible: function setVisible(name, visible) {
      if (this.panels[name]) {
        this.panels[name].setAttribute("visible", visible);
        this.setPanelInteractivity(this.panels[name], visible);
      }
    },

    setPanelInteractivity: function setPanelInteractivity(panelEl, enabled) {
      if (!panelEl || !panelEl.querySelectorAll) {
        return;
      }

      const interactiveEls = panelEl.querySelectorAll(
        ".interactive, [data-ui-interactive='1']",
      );
      Array.prototype.forEach.call(interactiveEls, function (el) {
        if (!el.dataset.uiInteractive) {
          el.dataset.uiInteractive = "1";
        }
        if (enabled) {
          el.classList.add("interactive");
        } else {
          el.classList.remove("interactive");
        }
      });

      const buttonRoots = panelEl.querySelectorAll(
        ".vr-button-root, [data-ui-button-root='1']",
      );
      Array.prototype.forEach.call(buttonRoots, function (el) {
        if (!el.dataset.uiButtonRoot) {
          el.dataset.uiButtonRoot = "1";
        }
        if (enabled) {
          el.classList.add("vr-button-root");
        } else {
          el.classList.remove("vr-button-root");
        }
      });
    },

    setWorldVisible: function setWorldVisible(name, visible) {
      if (this.world[name]) {
        this.world[name].setAttribute("visible", visible);
      }
    },

    setGameplayWorldInteractivity: function setGameplayWorldInteractivity(enabled) {
      const worldEntities = [this.world.wheel, this.world.shelf, this.world.balls, this.world.mixingStation];
      worldEntities.forEach(function (worldEntity) {
        if (!worldEntity) {
          return;
        }
        const interactiveEls = worldEntity.querySelectorAll(".interactive");
        Array.prototype.forEach.call(interactiveEls, function (el) {
          if (enabled) {
            el.classList.add("interactive");
          } else {
            el.classList.remove("interactive");
          }
        });
      });
    },

    setGameplayWorldVisible: function setGameplayWorldVisible(visible) {
      this.setWorldVisible("wheel", visible);
      this.setWorldVisible("shelf", visible);
      this.setWorldVisible("balls", visible);
      const isMix = window.GameManager && GameManager.isMixingMode && GameManager.isMixingMode();
      this.setWorldVisible("mixingStation", visible && isMix);
      if (!visible && this.refs.shelfCounter) {
        this.refs.shelfCounter.setAttribute("visible", false);
      }
      this.setGameplayWorldInteractivity(visible);
    },

    showMenu: function showMenu() {
      this.hideAll();
      this.setGameplayWorldVisible(false);
      this.setVisible("menu", true);
      this.setVisible("timer", false);
      this.updateTimer("--", false);
    },

    showGameHUD: function showGameHUD(mode) {
      this.hideAll();
      this.setGameplayWorldVisible(true);
      this.setVisible("hud", true);
      this.setVisible("timer", mode === "hard" || mode === "mix-hard");
      this.setVisible("skipLevel", mode === "easy" || mode === "mix-easy");
    },

    showFreePlay: function showFreePlay() {
      this.hideAll();
      this.setGameplayWorldVisible(true);
      this.setVisible("hud", true);
      this.setVisible("freeplay", true);
      this.setVisible("timer", false);
    },

    showVictory: function showVictory(totalTime, mode) {
      this.hideAll();
      this.setGameplayWorldVisible(false);
      this.refs.victoryTime.setAttribute(
        "value",
        "Total Time: " + totalTime.toFixed(1) + "s",
      );
      this.refs.victoryMode.setAttribute(
        "value",
        "Mode: " + mode.toUpperCase(),
      );
      this.setVisible("victory", true);
    },

    showGameOver: function showGameOver(level, mode) {
      this.hideAll();
      this.setGameplayWorldVisible(false);
      this.refs.gameoverLevel.setAttribute("value", "Level: " + level);
      this.refs.gameoverMode.setAttribute(
        "value",
        "Mode: " + mode.toUpperCase(),
      );
      this.setVisible("gameover", true);
    },

    updateHUD: function updateHUD(levelLabel, progressLabel, modeLabel) {
      this.refs.hudLevel.setAttribute("value", String(levelLabel));
      this.refs.hudProgress.setAttribute("value", String(progressLabel));
      if (modeLabel && this.refs.hudMode) {
        this.refs.hudMode.setAttribute("value", String(modeLabel));
      }
    },

    updateTimer: function updateTimer(value, urgent) {
      const displayValue = value === "--" ? "--" : String(value);
      this.refs.timerText.setAttribute("value", displayValue);
      this.refs.timerText.setAttribute("color", urgent ? "#ff1744" : "#91f7ff");
    },

    updateShelfCounter: function updateShelfCounter(count) {
      if (!this.refs.shelfCounter) return;
      const isMixMode = window.GameManager && GameManager.isMixingMode && GameManager.isMixingMode();
      this.refs.shelfCounter.setAttribute("visible", !!isMixMode);
      if (!isMixMode) return;
      this.refs.shelfCounter.setAttribute("value", "Slots: " + count + "/10");
      if (count >= 9) {
        this.refs.shelfCounter.setAttribute("color", "#e03131");
      } else if (count >= 8) {
        this.refs.shelfCounter.setAttribute("color", "#ffd43b");
      } else {
        this.refs.shelfCounter.setAttribute("color", "#51cf66");
      }
    },

    showTransientMessage: function showTransientMessage(message, duration) {
      if (this.statusTimer) {
        clearTimeout(this.statusTimer);
      }

      this.refs.statusText.setAttribute("value", message);
      this.setVisible("status", true);
      this.statusTimer = setTimeout(
        function () {
          this.setVisible("status", false);
        }.bind(this),
        duration || 2200,
      );
    },
  };

  window.UIManager = UIManager;
})();
