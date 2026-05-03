(function() {
  if (!window.AFRAME) return;

  const STATE_EMPTY = 'EMPTY';
  const STATE_HOLDING = 'HOLDING_BALL1';
  const STATE_RESULT = 'RESULT_READY';

  AFRAME.registerComponent('mixing-station', {
    schema: {
      inputPosition: { type: 'vec3', default: { x: 0, y: 0.25, z: 0 } },
      outputPosition: { type: 'vec3', default: { x: 0, y: 0.1, z: 0.2 } },
    },

    init: function() {
      this.state = STATE_EMPTY;
      this.heldBallEl = null; 
      this.resultBallEl = null; 

      this.buildGeometry();
      
      this.hitBox = document.createElement('a-cylinder');
      this.hitBox.setAttribute('radius', '0.35');
      this.hitBox.setAttribute('height', '0.5');
      this.hitBox.setAttribute('position', '0 0.25 0');
      this.hitBox.setAttribute('material', 'visible: false');
      this.hitBox.classList.add('mixing-station-hitbox', 'interactive');
      this.hitBox.dataset.station = 'true';
      this.el.appendChild(this.hitBox);

      this.pulseTime = 0;
      
      this.onBallDropped = this.onBallDropped.bind(this);
      this.el.sceneEl.addEventListener('ball-dropped-on-station', this.onBallDropped);
    },

    remove: function() {
      this.el.sceneEl.removeEventListener('ball-dropped-on-station', this.onBallDropped);
    },

    buildGeometry: function() {
      const base = document.createElement('a-cylinder');
      base.setAttribute('radius', '0.3');
      base.setAttribute('height', '0.05');
      base.setAttribute('material', 'color: #3b1b63; metalness: 0.8; roughness: 0.2');
      this.el.appendChild(base);

      const inputCup = document.createElement('a-cylinder');
      inputCup.setAttribute('radius', '0.15');
      inputCup.setAttribute('height', '0.1');
      inputCup.setAttribute('position', '0 0.05 0');
      inputCup.setAttribute('material', 'color: #582f8c; metalness: 0.7; roughness: 0.3');
      this.el.appendChild(inputCup);
      
      this.indicator = document.createElement('a-torus');
      this.indicator.setAttribute('radius', '0.15');
      this.indicator.setAttribute('radius-tubular', '0.01');
      this.indicator.setAttribute('position', '0 0.12 0');
      this.indicator.setAttribute('rotation', '90 0 0');
      this.setIndicatorState('empty');
      this.el.appendChild(this.indicator);
    },

    setIndicatorState: function(stateName) {
      if (!this.indicator) return;
      if (stateName === 'empty') {
        this.indicator.setAttribute('material', 'color: #4dabf7; emissive: #4dabf7; emissiveIntensity: 0.5');
      } else if (stateName === 'holding') {
        this.indicator.setAttribute('material', 'color: #339af0; emissive: #339af0; emissiveIntensity: 0.8');
      } else if (stateName === 'result') {
        this.indicator.setAttribute('material', 'color: #ffd43b; emissive: #ffd43b; emissiveIntensity: 1.0');
      } else if (stateName === 'waste') {
        this.indicator.setAttribute('material', 'color: #e03131; emissive: #e03131; emissiveIntensity: 0.8');
      }
    },

    tick: function(t, dt) {
      if (this.state === STATE_EMPTY) {
        this.pulseTime += dt * 0.002;
        const scale = 1.0 + Math.sin(this.pulseTime) * 0.05;
        this.indicator.setAttribute('scale', `${scale} ${scale} ${scale}`);
      } else {
        this.indicator.setAttribute('scale', '1 1 1');
      }
    },

    onBallDropped: function(event) {
      const ballEl = event.detail.ballEl;
      if (!ballEl) return;
      
      const ballData = ballEl.getAttribute('color-ball');
      if (!ballData) return;
      
      const colorHex = ballData.colorHex;
      const isWhite = colorHex === '#FFFFFF';
      const isWaste = ballData.isWaste === 'true' || ballData.isWaste === true;

      if (isWaste) {
        event.detail.callback('rejected');
        return;
      }

      if (this.state === STATE_EMPTY) {
        this.holdBall(ballEl);
        event.detail.callback('held');
        return;
      } 
      else if (this.state === STATE_HOLDING) {
        this.mixBalls(this.heldBallEl, ballEl);
        event.detail.callback('mixed');
        return;
      }
      else if (this.state === STATE_RESULT) {
        if (isWhite) {
          const resultBallData = this.resultBallEl.getAttribute('color-ball');
          const resultHex = resultBallData.colorHex;
          const tintHex = window.getTintForColor(resultHex);
          if (tintHex) {
            this.convertToTint(tintHex);
            event.detail.callback('mixed');
            return;
          } else {
            event.detail.callback('rejected');
            return;
          }
        } else {
          event.detail.callback('rejected');
          return;
        }
      }
      event.detail.callback('rejected');
    },

    holdBall: function(ballEl) {
      this.state = STATE_HOLDING;
      this.heldBallEl = ballEl;
      
      window.reparentObject3D(ballEl, this.el);
      ballEl.object3D.position.copy(window.toVector3(this.data.inputPosition));
      ballEl.object3D.rotation.set(0,0,0);
      
      ballEl.dataset.heldByStation = 'true';
      ballEl.dataset.locked = 'false'; // Can still be grabbed back
      ballEl.classList.add('interactive', 'grabbable');
      
      // Listen for when it gets grabbed again to cancel HOLDING
      this.onHeldBallGrabbed = this.onHeldBallGrabbed.bind(this);
      ballEl.addEventListener('grab-start', this.onHeldBallGrabbed);
      
      this.setIndicatorState('holding');
    },

    onHeldBallGrabbed: function(event) {
      if (this.state === STATE_HOLDING && this.heldBallEl === event.target) {
        this.heldBallEl.removeEventListener('grab-start', this.onHeldBallGrabbed);
        delete this.heldBallEl.dataset.heldByStation;
        this.heldBallEl = null;
        this.state = STATE_EMPTY;
        this.setIndicatorState('empty');
      }
    },

    mixBalls: function(ball1El, ball2El) {
      const hex1 = ball1El.getAttribute('color-ball').colorHex;
      const hex2 = ball2El.getAttribute('color-ball').colorHex;
      
      let resultHex = null;
      let isWaste = false;

      if (hex1 === '#FFFFFF' || hex2 === '#FFFFFF') {
        const otherHex = hex1 === '#FFFFFF' ? hex2 : hex1;
        if (otherHex === '#FFFFFF') {
          resultHex = '#FFFFFF';
          isWaste = false;
        } else {
          resultHex = window.getTintForColor(otherHex);
        }
      } else {
        resultHex = window.getMixingRecipe(hex1, hex2);
      }

      if (!resultHex) {
        resultHex = '#8B7355'; // Waste
        isWaste = true;
      }

      // Return sources to shelf so they can be reused
      if (ball1El.components && ball1El.components["snap-to-slot"]) {
        ball1El.components["snap-to-slot"].returnToShelf();
      } else if (ball1El.parentNode) {
        ball1El.parentNode.removeChild(ball1El);
      }
      
      this.heldBallEl = null;

      this.createResultBall(resultHex, isWaste);
    },

    createResultBall: function(hex, isWaste) {
      this.state = STATE_RESULT;
      
      if (isWaste) {
        this.setIndicatorState('waste');
        if (window.ParticlePool) window.ParticlePool.burst(window.getWorldPosition(this.el), '#e03131');
      } else {
        this.setIndicatorState('result');
        if (window.ParticlePool) window.ParticlePool.burst(window.getWorldPosition(this.el), '#ffd43b');
      }

      let shelfPosStr = "0 0 0";
      if (window.GameManager && window.GameManager.mode === 'mix') {
        const shelfPos = window.GameManager.getNextShelfPosition();
        shelfPosStr = `${shelfPos.x} ${shelfPos.y} ${shelfPos.z}`;
        window.GameManager.incrementShelfCounter();
      }

      const ballEl = document.createElement('a-entity');
      ballEl.setAttribute('color-ball', `colorHex: ${hex}; isWaste: ${isWaste}; originalPosition: ${shelfPosStr}`);
      ballEl.setAttribute('snap-to-slot', '');
      ballEl.dataset.isMixedResult = 'true';
      ballEl.classList.add('grabbable', 'interactive');
      
      this.el.appendChild(ballEl);
      ballEl.object3D.position.copy(window.toVector3(this.data.outputPosition));

      this.resultBallEl = ballEl;
      
      this.onResultBallGrabbed = this.onResultBallGrabbed.bind(this);
      ballEl.addEventListener('grab-start', this.onResultBallGrabbed);

      this.el.emit('mix-result', { ball: ballEl, isWaste: isWaste, hex: hex });
      
      if (window.SoundManager) {
        window.SoundManager.play(isWaste ? 'wrong' : 'correct');
      }
    },

    convertToTint: function(tintHex) {
      if (!this.resultBallEl) return;
      
      const oldData = this.resultBallEl.getAttribute('color-ball');
      const pos = oldData.originalPosition;
      const shelfPosStr = pos ? `${pos.x} ${pos.y} ${pos.z}` : "0 0 0";
      
      this.resultBallEl.setAttribute('color-ball', `colorHex: ${tintHex}; isWaste: false; originalPosition: ${shelfPosStr}`);
      
      if (window.ParticlePool) window.ParticlePool.burst(window.getWorldPosition(this.resultBallEl), '#ffd43b');
      
      this.el.emit('mix-result-tinted', { ball: this.resultBallEl, hex: tintHex });
      
      if (window.SoundManager) {
        window.SoundManager.play('correct');
      }
    },

    onResultBallGrabbed: function(event) {
      if (this.state === STATE_RESULT && this.resultBallEl === event.target) {
        this.resultBallEl.removeEventListener('grab-start', this.onResultBallGrabbed);
        this.state = STATE_EMPTY;
        this.resultBallEl = null;
        this.setIndicatorState('empty');
      }
    }
  });
})();
