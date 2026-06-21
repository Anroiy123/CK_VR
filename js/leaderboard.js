(function () {
  const Leaderboard = {
    storagePrefix: "vr-color-circle",

    getScores: function getScores(mode) {
      try {
        return JSON.parse(localStorage.getItem(this.storagePrefix + "-" + mode) || "[]");
      } catch (error) {
        return [];
      }
    },

    submit: function submit(time, mode) {
      if (mode === "freeplay") {
        return;
      }
      const scores = this.getScores(mode);
      scores.push({ time: Number(time), date: new Date().toISOString() });
      scores.sort(function (left, right) {
        return left.time - right.time;
      });

      try {
        localStorage.setItem(this.storagePrefix + "-" + mode, JSON.stringify(scores.slice(0, 10)));
      } catch (error) {
        return;
      }
    },

    renderToPanel: function renderToPanel() {
      var modeConfigs = [
        { mode: "easy",     elId: "lb-easy-scores",     label: "EASY" },
        { mode: "hard",     elId: "lb-hard-scores",     label: "HARD" },
        { mode: "mix-easy", elId: "lb-mix-easy-scores", label: "MIX EASY" },
        { mode: "mix-hard", elId: "lb-mix-hard-scores", label: "MIX HARD" },
      ];

      modeConfigs.forEach(function (cfg) {
        var element = document.getElementById(cfg.elId);
        if (!element) {
          return;
        }

        var scores = this.getScores(cfg.mode);
        var lines = scores.length
          ? scores.slice(0, 5).map(function (score, index) {
              return index + 1 + ". " + score.time.toFixed(1) + "s";
            })
          : ["---"];

        element.setAttribute("value", cfg.label + "\n" + lines.join("\n"));
      }.bind(this));
    },
  };

  window.Leaderboard = Leaderboard;
})();
