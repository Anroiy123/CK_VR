(function () {
  const FreePlayManager = {
    active: false,

    init: function init() {
      return true;
    },

    start: function start() {
      this.active = true;
      GameManager.stopActiveRun();
      GameManager.state = "FREE_PLAY";
      GameManager.mode = "freeplay";
      GameManager.currentLevel = 3;
      GameManager.resetBoard();

      const wheel = document.getElementById("color-wheel").components["color-wheel"];
      wheel.prepareFreePlay();

      GameManager.spawnBalls(getAllColors(), "freeplay");
      UIManager.showFreePlay();
      UIManager.updateHUD("Free Play", "12 colors", "Explore the full wheel");
      Timer.clearDisplay();
      SoundManager.startBGM();
    },

    reset: function reset() {
      if (!this.active) {
        return;
      }
      this.start();
    },

    stop: function stop() {
      this.active = false;
    },
  };

  window.FreePlayManager = FreePlayManager;
})();
