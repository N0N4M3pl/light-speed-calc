import signal from 'signal-js';
import { State } from './State';

export default class Distance {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {String} */
  static EVENT_LIGHT = 'light';

  /** @type {String} */
  static EVENT_LENGTH = 'length';

  /** @type {State} */
  #state = State.INACTIVE;

  /** @type {Number} */
  #speedOfLight = 299792458;

  /** @type {Number} */
  #lengthCurrent = 0;

  /** @type {Number} */
  #lengthTarget = 299792458;

  /** @type {Number} */
  #lengthChangeSpeed = 1000000;

  /** @type {Number} */
  #lengthChangeAcceleration = 1000000;

  /** @type {Emmiter} */
  #emitter;

  /** @type {signal} */
  #signal = new signal();

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @param {State} value
   */
  set state(value) {
    if (this.#state == value) {
      console.warn('Distance | set state | new value equal old value');
      return;
    }
    switch (value) {
      case State.ACTIVE_SYNCHRONIZE:
        this.#lengthCurrent = 0;
        break;
      case State.ACTIVE_MEASURE:
        this.#lengthCurrent = 0;
        break;
      case State.INACTIVE:
        break;
      default:
        return;
    }
    this.#state = value;
    console.info('Distance | set state | state=' + this.#state);
  }

  /**
   * @returns {Boolean}
   */
  get isConnectedToEmmiter() {
    return this.#emitter != null;
  }

  /**
   * @returns {Number}
   */
  get speedOfLight() {
    return this.#speedOfLight;
  }

  /**
   * @returns {Number}
   */
  set speedOfLight(value) {
    this.#speedOfLight = Math.max(value, 0);
  }

  /**
   * @returns {Number}
   */
  get lengthCurrent() {
    return this.#lengthCurrent;
  }

  /**
   * @returns {Number}
   */
  get lengthTarget() {
    return this.#lengthTarget;
  }

  /**
   * @param {Number} value
   */
  set lengthTarget(value) {
    this.#lengthTarget = Math.max(value, this.#lengthCurrent, 0);
  }

  /**
   * @returns {Number}
   */
  get lengthChangeSpeed() {
    return this.#lengthChangeSpeed;
  }

  /**
   * @param {Number} value
   */
  set lengthChangeSpeed(value) {
    this.#lengthChangeSpeed = Math.max(value, 0);
  }

  /**
   * @returns {Number}
   */
  get lengthChangeAcceleration() {
    return this.#lengthChangeAcceleration;
  }

  /**
   * @param {Number} value
   */
  set lengthChangeAcceleration(value) {
    this.#lengthChangeAcceleration = Math.max(value, 0);
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
      case State.ACTIVE_SYNCHRONIZE:
        this.#signal.emit(Distance.EVENT_LIGHT, lightIsOn);
        break;
      case State.ACTIVE_MEASURE:
        if (this.#lengthCurrent < this.#lengthTarget) {
          this.#lengthCurrent = Math.min(this.#lengthCurrent + this.#lengthChangeSpeed, this.#lengthTarget);
          this.#lengthChangeSpeed += this.#lengthChangeAcceleration;
          this.#signal.emit(Distance.EVENT_LENGTH, this.#lengthCurrent, this.#lengthTarget);
          let delay = this.#lengthCurrent / this.#speedOfLight;
          setTimeout(() => {
            this.#signal.emit(Distance.EVENT_LIGHT, lightIsOn);
          }, delay);
        }
        break;
      default:
        return;
    }
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
