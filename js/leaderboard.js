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
      ["easy", "hard"].forEach(function (mode) {
        const element = document.getElementById("lb-" + mode + "-scores");
        if (!element) {
          return;
        }

        const scores = this.getScores(mode);
        const lines = scores.length
          ? scores.slice(0, 5).map(function (score, index) {
              return index + 1 + ". " + score.time.toFixed(1) + "s";
            })
          : ["---"];

        element.setAttribute("value", mode.toUpperCase() + "\n" + lines.join("\n"));
      }.bind(this));
    },
  };

  window.Leaderboard = Leaderboard;
})();
