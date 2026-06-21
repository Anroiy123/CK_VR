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
        vrHud: document.getElementById("vr-hud-panel"),
        timer: document.getElementById("hud-timer-row"),
        skipLevel: document.getElementById("skip-level-button"),
        backMenu: document.getElementById("back-menu-button"),
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
        progressBar: document.getElementById("hud-progress-bar"),
        vrHudLevel: document.getElementById("vr-hud-level"),
        vrHudProgress: document.getElementById("vr-hud-progress"),
        vrHudMode: document.getElementById("vr-hud-mode"),
        vrHudTimer: document.getElementById("vr-hud-timer"),
        vrHudShelf: document.getElementById("vr-hud-shelf"),
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
        this.setElementVisible(this.panels[name], visible);
        this.setPanelInteractivity(this.panels[name], visible);
      }
    },

    setElementVisible: function setElementVisible(el, visible) {
      if (!el) {
        return;
      }

      const isAFrameElement = el.tagName && el.tagName.toLowerCase().indexOf("a-") === 0;
      if ((el.dataset && el.dataset.uiSurface === "dom") || !isAFrameElement) {
        el.hidden = !visible;
        return;
      }

      el.setAttribute("visible", visible);
    },

    setTextValue: function setTextValue(el, value) {
      if (!el) {
        return;
      }

      const isAFrameElement = el.tagName && el.tagName.toLowerCase().indexOf("a-") === 0;
      if ((el.dataset && el.dataset.uiSurface === "dom") || !isAFrameElement) {
        el.textContent = String(value);
        return;
      }

      el.setAttribute("value", String(value));
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
        this.setElementVisible(this.refs.shelfCounter, false);
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
      this.setVisible("vrHud", true);
      this.setVisible("timer", mode === "hard" || mode === "mix-hard");
      this.setElementVisible(this.refs.vrHudTimer, mode === "hard" || mode === "mix-hard");
      this.setElementVisible(this.refs.vrHudShelf, mode === "mix-easy" || mode === "mix-hard");
      this.setVisible("skipLevel", mode === "easy" || mode === "mix-easy");
      this.setVisible("backMenu", true);
    },

    showFreePlay: function showFreePlay() {
      this.hideAll();
      this.setGameplayWorldVisible(true);
      this.setVisible("hud", true);
      this.setVisible("vrHud", true);
      this.setVisible("freeplay", true);
      this.setVisible("timer", false);
      this.setElementVisible(this.refs.vrHudTimer, false);
      this.setElementVisible(this.refs.vrHudShelf, false);
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
      this.setTextValue(this.refs.hudLevel, levelLabel);
      this.setTextValue(this.refs.hudProgress, progressLabel);
      this.setTextValue(this.refs.vrHudLevel, levelLabel);
      this.setTextValue(this.refs.vrHudProgress, progressLabel);
      this.updateProgressBar(progressLabel);
      if (modeLabel && this.refs.hudMode) {
        this.setTextValue(this.refs.hudMode, modeLabel);
        this.setTextValue(this.refs.vrHudMode, modeLabel);
      }
    },

    updateProgressBar: function updateProgressBar(progressLabel) {
      if (!this.refs.progressBar) {
        return;
      }

      const parts = String(progressLabel).split("/");
      const placed = Number(parts[0]);
      const total = Number(parts[1]);
      const percent = total > 0 ? Math.max(0, Math.min(100, (placed / total) * 100)) : 0;
      this.refs.progressBar.style.width = percent + "%";
    },

    updateTimer: function updateTimer(value, urgent) {
      const displayValue = value === "--" ? "--" : String(value);
      this.setTextValue(this.refs.timerText, displayValue);
      this.setTextValue(this.refs.vrHudTimer, displayValue === "--" ? "" : "TIME  " + displayValue);
      if (this.refs.timerText.classList) {
        this.refs.timerText.classList.toggle("is-urgent", !!urgent);
      } else {
        this.refs.timerText.setAttribute("color", urgent ? "#ff1744" : "#91f7ff");
      }
      if (this.refs.vrHudTimer) {
        this.refs.vrHudTimer.setAttribute("color", urgent ? "#ff8787" : "#ffd8a8");
      }
    },

    updateShelfCounter: function updateShelfCounter(count) {
      if (!this.refs.shelfCounter) return;
      const isMixMode = window.GameManager && GameManager.isMixingMode && GameManager.isMixingMode();
      this.setElementVisible(this.refs.shelfCounter, !!isMixMode);
      this.setElementVisible(this.refs.vrHudShelf, !!isMixMode);
      if (!isMixMode) return;
      this.setTextValue(this.refs.shelfCounter, "Slots: " + count + "/10");
      this.setTextValue(this.refs.vrHudShelf, "SLOTS  " + count + "/10");
      if (this.refs.shelfCounter.classList) {
        this.refs.shelfCounter.classList.toggle("is-warning", count >= 8 && count < 9);
        this.refs.shelfCounter.classList.toggle("is-danger", count >= 9);
      } else {
        this.refs.shelfCounter.setAttribute("color", count >= 9 ? "#e03131" : count >= 8 ? "#ffd43b" : "#51cf66");
      }
      if (this.refs.vrHudShelf) {
        this.refs.vrHudShelf.setAttribute("color", count >= 9 ? "#ff8787" : count >= 8 ? "#ffd43b" : "#d8f5a2");
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
