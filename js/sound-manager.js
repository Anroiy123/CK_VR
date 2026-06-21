(function () {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  const EFFECT_DEFINITIONS = {
    click: {
      volume: 0.09,
      wave: "triangle",
      notes: [
        { frequency: 520, start: 0, duration: 0.045 },
        { frequency: 760, start: 0.035, duration: 0.055 },
      ],
    },
    grab: {
      volume: 0.075,
      wave: "sine",
      notes: [
        { frequency: 290, start: 0, duration: 0.06 },
        { frequency: 390, start: 0.045, duration: 0.08 },
      ],
    },
    correct: {
      volume: 0.12,
      wave: "sine",
      notes: [
        { frequency: 523.25, start: 0, duration: 0.08 },
        { frequency: 659.25, start: 0.07, duration: 0.09 },
        { frequency: 783.99, start: 0.15, duration: 0.13 },
      ],
    },
    wrong: {
      volume: 0.085,
      wave: "sawtooth",
      notes: [
        { frequency: 220, start: 0, duration: 0.11 },
        { frequency: 155.56, start: 0.08, duration: 0.18 },
      ],
    },
    levelup: {
      volume: 0.14,
      wave: "triangle",
      notes: [
        { frequency: 392, start: 0, duration: 0.09 },
        { frequency: 523.25, start: 0.08, duration: 0.11 },
        { frequency: 659.25, start: 0.18, duration: 0.13 },
        { frequency: 783.99, start: 0.3, duration: 0.2 },
      ],
    },
    victory: {
      volume: 0.15,
      wave: "triangle",
      notes: [
        { frequency: 523.25, start: 0, duration: 0.11 },
        { frequency: 659.25, start: 0.1, duration: 0.12 },
        { frequency: 783.99, start: 0.21, duration: 0.13 },
        { frequency: 1046.5, start: 0.34, duration: 0.35 },
      ],
    },
    tick: {
      volume: 0.055,
      wave: "square",
      notes: [{ frequency: 880, start: 0, duration: 0.035 }],
    },
  };

  const SoundManager = {
    audioContext: null,
    masterGain: null,
    effectsGain: null,
    backgroundMusic: null,
    bgmEnabled: false,
    ready: false,

    init: function init() {
      this.backgroundMusic = new Audio(
        "assets/audio/Wii Shop Bossa Nova Cover.mp3",
      );
      this.backgroundMusic.loop = true;
      this.backgroundMusic.preload = "auto";
      this.backgroundMusic.volume = 0.1;
      this.ready = true;
      this.bindUnlockListeners();
    },

    bindUnlockListeners: function bindUnlockListeners() {
      var self = this;
      var unlock = function unlock() {
        self.ensureAudioGraph();
        self.resumeContext();
        if (self.bgmEnabled) {
          self.playBackgroundMusic();
        }
        document.removeEventListener("click", unlock);
        document.removeEventListener("keydown", unlock);
        document.removeEventListener("touchstart", unlock);
      };

      document.addEventListener("click", unlock);
      document.addEventListener("keydown", unlock);
      document.addEventListener("touchstart", unlock);
    },

    ensureAudioGraph: function ensureAudioGraph() {
      if (!AudioContextCtor) {
        return false;
      }

      if (this.audioContext) {
        return true;
      }

      this.audioContext = new AudioContextCtor();
      this.masterGain = this.audioContext.createGain();
      this.effectsGain = this.audioContext.createGain();

      this.masterGain.gain.value = 0.82;
      this.effectsGain.gain.value = 0.62;

      this.effectsGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      return true;
    },

    resumeContext: function resumeContext() {
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
    },

    play: function play(name) {
      var definition = EFFECT_DEFINITIONS[name];
      if (!definition || !this.ensureAudioGraph()) {
        return;
      }

      this.resumeContext();
      this.playEffect(definition);
    },

    startBGM: function startBGM() {
      this.bgmEnabled = true;
      this.playBackgroundMusic();
    },

    stopBGM: function stopBGM() {
      this.bgmEnabled = false;
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
      }
    },

    playBackgroundMusic: function playBackgroundMusic() {
      if (!this.backgroundMusic || !this.bgmEnabled) {
        return;
      }

      var playPromise = this.backgroundMusic.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    },

    playEffect: function playEffect(definition) {
      var context = this.audioContext;
      var baseTime = context.currentTime;
      var destination = this.effectsGain;

      definition.notes.forEach(function (note) {
        var oscillator = context.createOscillator();
        var gain = context.createGain();
        var startAt = baseTime + note.start;
        var endAt = startAt + note.duration;

        oscillator.type = definition.wave;
        oscillator.frequency.setValueAtTime(note.frequency, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(
          definition.volume,
          startAt + 0.012,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

        oscillator.connect(gain);
        gain.connect(destination);
        oscillator.start(startAt);
        oscillator.stop(endAt + 0.025);
      });
    },
  };

  window.SoundManager = SoundManager;
})();
