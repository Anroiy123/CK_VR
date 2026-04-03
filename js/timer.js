(function () {
  const Timer = {
    intervalId: null,
    remaining: 0,

    start: function start(seconds) {
      this.stop();
      this.remaining = seconds;
      this.updateDisplay();

      this.intervalId = setInterval(function () {
        this.remaining -= 1;
        if (this.remaining <= 10 && window.SoundManager) {
          SoundManager.play("tick");
        }

        this.updateDisplay();

        if (this.remaining <= 0) {
          this.stop();
          if (window.GameManager) {
            GameManager.onTimeUp();
          }
        }
      }.bind(this), 1000);
    },

    stop: function stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    updateDisplay: function updateDisplay() {
      if (window.UIManager) {
        UIManager.updateTimer(this.remaining, this.remaining > 0 && this.remaining <= 10);
      }
    },

    clearDisplay: function clearDisplay() {
      this.stop();
      if (window.UIManager) {
        UIManager.updateTimer("--", false);
      }
    },
  };

  window.Timer = Timer;
})();
