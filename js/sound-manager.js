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
      notes: [
        { frequency: 880, start: 0, duration: 0.035 },
      ],
    },
  };

  const MUSIC_PATTERN = [
    { bass: 130.81, chord: [261.63, 329.63, 392.0] },
    { bass: 174.61, chord: [349.23, 440.0, 523.25] },
    { bass: 196.0, chord: [392.0, 493.88, 587.33] },
    { bass: 164.81, chord: [329.63, 392.0, 493.88] },
  ];

  const SoundManager = {
    audioContext: null,
    masterGain: null,
    musicGain: null,
    effectsGain: null,
    bgmTimer: null,
    bgmStep: 0,
    bgmEnabled: false,
    ready: false,

    init: function init() {
      this.ready = true;
      this.bindUnlockListeners();
    },

    bindUnlockListeners: function bindUnlockListeners() {
      var self = this;
      var unlock = function unlock() {
        self.ensureAudioGraph();
        self.resumeContext();
        if (self.bgmEnabled && !self.bgmTimer) {
          self.startProceduralBGM();
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
      this.musicGain = this.audioContext.createGain();
      this.effectsGain = this.audioContext.createGain();

      this.masterGain.gain.value = 0.82;
      this.musicGain.gain.value = 0.18;
      this.effectsGain.gain.value = 0.62;

      this.musicGain.connect(this.masterGain);
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
      if (!this.ensureAudioGraph()) {
        return;
      }

      this.resumeContext();
      if (!this.bgmTimer) {
        this.startProceduralBGM();
      }
    },

    stopBGM: function stopBGM() {
      this.bgmEnabled = false;
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
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
        gain.gain.exponentialRampToValueAtTime(definition.volume, startAt + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

        oscillator.connect(gain);
        gain.connect(destination);
        oscillator.start(startAt);
        oscillator.stop(endAt + 0.025);
      });
    },

    startProceduralBGM: function startProceduralBGM() {
      var self = this;
      this.playMusicStep();
      this.bgmTimer = setInterval(function () {
        self.playMusicStep();
      }, 1800);
    },

    playMusicStep: function playMusicStep() {
      if (!this.bgmEnabled || !this.audioContext || !this.musicGain) {
        return;
      }

      var context = this.audioContext;
      var step = MUSIC_PATTERN[this.bgmStep % MUSIC_PATTERN.length];
      var startAt = context.currentTime + 0.02;

      this.playMusicNote(step.bass, startAt, 1.55, "sine", 0.18);
      step.chord.forEach(
        function (frequency, index) {
          this.playMusicNote(frequency, startAt + index * 0.04, 1.35, "triangle", 0.055);
        }.bind(this),
      );

      this.bgmStep += 1;
    },

    playMusicNote: function playMusicNote(frequency, startAt, duration, wave, volume) {
      var context = this.audioContext;
      var oscillator = context.createOscillator();
      var gain = context.createGain();
      var endAt = startAt + duration;

      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.connect(gain);
      gain.connect(this.musicGain);
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.05);
    },
  };

  window.SoundManager = SoundManager;
})();
