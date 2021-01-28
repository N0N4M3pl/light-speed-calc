import signal from 'signal-js';
import { State } from './State';
import Emitter from './Emitter';

export default class Distance {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {String} */
  static EVENT_LIGHT = 'light';

  /** @type {String} */
  static EVENT_LENGTH = 'length';

  /** @type {State} */
  #state = State.INACTIVE;

  /**
   * UNIT: meters / milliseconds 
   * @type {Number}
   */
  #speedOfLight = 299792.458;

  /**
   * UNIT: meters
   * @type {Number}
   */
  #lengthCurrent = 0;

  /**
   * UNIT: meters
   * @type {Number}
   */
  #lengthTarget = 299792458;

  /**
   * UNIT: meters / milliseconds 
   * @type {Number}
   */
  #lengthChangeSpeed = 1000;

  /** @type {Array.<Number>} */
  #lightEmitTimeoutIds;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #lightEmitDelayCurrent;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #timeStartActiveSeparation;

  /** @type {Emmiter} */
  #emitter;

  /** @type {signal} */
  #signal = new signal();

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @returns {State}
   */
  get state() {
    return this.#state;
  }

  /**
   * @param {State} value
   */
  set state(value) {
    if (this.#state == value) {
      return;
    }
    switch (value) {
      case State.INACTIVE:
        this._removeAllLightEmits();
        break;
      case State.ACTIVE_SYNCHRONIZE:
        this.#lengthCurrent = 0;
        this.#lightEmitTimeoutIds = [];
        this.#lightEmitDelayCurrent = 0;
        break;
      case State.ACTIVE_SEPARATION:
        // this.#lengthCurrent = 0;
        this.#timeStartActiveSeparation = performance.now();
        break;
    }
    // console.info('Distance | set state | ' + this.#state + ' -> ' + value);
    this.#state = value;
  }

  /**
   * @returns {Boolean}
   */
  get isConnectedToEmmiter() {
    return this.#emitter != null;
  }

  /**
   * @returns {Number} UNIT: meters / milliseconds 
   */
  get speedOfLight() {
    return this.#speedOfLight;
  }

  /**
   * @returns {Number} UNIT: meters / milliseconds 
   */
  set speedOfLight(value) {
    this.#speedOfLight = Math.max(value, 0.1);
  }

  /**
   * @returns {Number} UNIT: meters / seconds 
   */
  get speedOfLightInSeconds() {
    return this.speedOfLight * 1000;
  }

  /**
   * @param {Number} value UNIT: meters / seconds 
   */
  set speedOfLightInSeconds(value) {
    this.speedOfLight = value / 1000;
  }

  /**
   * @returns {Number} UNIT: meters
   */
  get lengthCurrent() {
    return this.#lengthCurrent;
  }

  /**
   * @returns {Number} UNIT: meters
   */
  get lengthTarget() {
    return this.#lengthTarget;
  }

  /**
   * @param {Number} value UNIT: meters
   */
  set lengthTarget(value) {
    this.#lengthTarget = Math.max(value, 1);
  }

  /**
   * @returns {Number} UNIT: meters / milliseconds
   */
  get lengthChangeSpeed() {
    return this.#lengthChangeSpeed;
  }

  /**
   * @param {Number} value UNIT: meters / milliseconds 
   */
  set lengthChangeSpeed(value) {
    this.#lengthChangeSpeed = Math.max(value, 0);
  }

  /**
   * @returns {Number} UNIT: meters / seconds
   */
  get lengthChangeSpeedInSeconds() {
    return this.lengthChangeSpeed * 1000;
  }

  /**
   * @param {Number} value UNIT: meters / seconds
   */
  set lengthChangeSpeedInSeconds(value) {
    this.lengthChangeSpeed = value / 1000;
  }

  //--------------------------------------------------

  /**
   * @param {Emmiter} emitter
   */
  connectToEmmitter(emitter) {
    if (this.isConnectedToEmmiter) {
      console.warn('Distance | connectToEmmitter | is already connected');
      return;
    }
    console.info('Distance | connectToEmmitter');
    this.#emitter = emitter;
    this.#emitter.connect(Emitter.EVENT_LIGHT, this._emitterLightListener.bind(this));
  }

  /**
   * @param {String} eventName
   * @param {Function} listener
   */
  connect(eventName, listener) {
    this.#signal.on(eventName, listener);
  }

  /**
   * @param {String} eventName
   * @param {Function} listener
   */
  disconnect(eventName, listener) {
    this.#signal.off(eventName, listener);
  }

  //--------------------------------------------------

  /**
   * @param {Boolean} lightIsOn
   */
  _emitterLightListener(lightIsOn) {
    switch (this.#state) {
      case State.ACTIVE_SYNCHRONIZE: {
        this.#signal.emit(Distance.EVENT_LIGHT, lightIsOn);
        break;
      }
      case State.ACTIVE_SEPARATION: {
        this._updateLengthCurrent();
        this._addLightEmit(lightIsOn, this.#lengthCurrent / this.#speedOfLight);
        break;
      }
      case State.ACTIVE_MEASURE: {
        this._addLightEmit(lightIsOn, this.#lengthTarget / this.#speedOfLight);
        break;
      }
    }
    this.#signal.emit(Distance.EVENT_LENGTH, this.#lengthCurrent, this.#lengthTarget, this.#lightEmitDelayCurrent);
  }

  /**
   * @param {Boolea} lightIsOn
   * @param {Number} delay
   */
  _addLightEmit(lightIsOn, delay) {
    const id = setTimeout(() => {
      this.#signal.emit(Distance.EVENT_LIGHT, lightIsOn);
      // this.#signal.emit(Distance.EVENT_LENGTH, this.#lengthCurrent,
      // this.#lengthTarget, this.#lightEmitDelayCurrent);
    }, delay);

    this.#lightEmitTimeoutIds.push(id);
    this.#lightEmitDelayCurrent = delay;
  }

  _removeAllLightEmits() {
    this.#lightEmitTimeoutIds.forEach(id => {
      clearTimeout(id);
    });
    this.#lightEmitTimeoutIds = [];
  }

  _updateLengthCurrent() {
    if (this.#lengthCurrent < this.#lengthTarget) {
      const time = performance.now() - this.#timeStartActiveSeparation;
      this.#lengthCurrent = Math.min(time * this.#lengthChangeSpeed, this.#lengthTarget);
    }
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
