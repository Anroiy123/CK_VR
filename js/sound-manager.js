(function () {
  const SOUND_DEFINITIONS = {
    bgm: { src: "assets/sounds/bgm.mp3", loop: true, volume: 0.24 },
    correct: { src: "assets/sounds/correct.mp3", volume: 0.7 },
    wrong: { src: "assets/sounds/wrong.mp3", volume: 0.5 },
    grab: { src: "assets/sounds/grab.mp3", volume: 0.42 },
    levelup: { src: "assets/sounds/levelup.mp3", volume: 0.78 },
    victory: { src: "assets/sounds/victory.mp3", volume: 0.82 },
    tick: { src: "assets/sounds/tick.mp3", volume: 0.28 },
    click: { src: "assets/sounds/click.mp3", volume: 0.4 },
  };

  const SoundManager = {
    sounds: {},
    disabled: {},
    ready: false,
    audioContext: null,

    init: function init() {
      this.ready = true;
      // Resume AudioContext on first user gesture so fallback tones work immediately
      var self = this;
      function resumeOnGesture() {
        if (self.audioContext && self.audioContext.state === 'suspended') {
          self.audioContext.resume();
        }
        document.removeEventListener('click', resumeOnGesture);
        document.removeEventListener('keydown', resumeOnGesture);
        document.removeEventListener('touchstart', resumeOnGesture);
      }
      document.addEventListener('click', resumeOnGesture);
      document.addEventListener('keydown', resumeOnGesture);
      document.addEventListener('touchstart', resumeOnGesture);
    },

    ensureSound: function ensureSound(name) {
      if (this.disabled[name] || this.sounds[name] || !window.Howl) {
        return this.sounds[name] || null;
      }

      const definition = SOUND_DEFINITIONS[name];
      if (!definition) {
        return null;
      }

      const howl = new Howl({
        src: [definition.src],
        loop: Boolean(definition.loop),
        volume: definition.volume,
        preload: false,
        onloaderror: function () {
          SoundManager.disabled[name] = true;
        },
        onplayerror: function () {
          SoundManager.disabled[name] = true;
          SoundManager.playToneFallback(name);
        },
      });

      this.sounds[name] = howl;
      return howl;
    },

    play: function play(name) {
      const sound = this.ensureSound(name);
      if (!sound || this.disabled[name]) {
        this.playToneFallback(name);
        return;
      }

      try {
        sound.play();
      } catch (error) {
        this.disabled[name] = true;
        this.playToneFallback(name);
      }
    },

    startBGM: function startBGM() {
      const sound = this.ensureSound("bgm");
      if (!sound || this.disabled.bgm) {
        return;
      }
      if (sound.playing()) {
        return;
      }
      try {
        sound.play();
      } catch (error) {
        this.disabled.bgm = true;
      }
    },

    stopBGM: function stopBGM() {
      const bgm = this.sounds.bgm;
      if (bgm) {
        bgm.stop();
      }
    },

    playToneFallback: function playToneFallback(name) {
      if (name === "bgm" || !window.AudioContext) {
        return;
      }

      const frequencies = {
        click: 540,
        grab: 380,
        correct: 760,
        wrong: 180,
        levelup: 640,
        victory: 920,
        tick: 440,
      };

      const frequency = frequencies[name];
      if (!frequency) {
        return;
      }

      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.type = name === "wrong" ? "sawtooth" : "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.04;
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.18);
      oscillator.stop(this.audioContext.currentTime + 0.18);
    },
  };

  window.SoundManager = SoundManager;
})();
