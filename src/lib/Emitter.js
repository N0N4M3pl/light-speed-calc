import signal from 'signal-js';
import { State } from './State';

export default class Emitter {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {String} */
  static EVENT_LIGHT = 'light';

  /** @type {State} */
  #state = State.INACTIVE;

  /** @type {Number} */
  #lightTimeOn = 1000;

  /** @type {Number} */
  #lightTimeOff = 1000;

  /** @type {Number} */
  #lightOnOffTimeoutId;

  /** @type {signal} */
  #signal = new signal();

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @param {Number} lightTimeOn
   * @param {Number} lightTimeOff
   */
  constructor(lightTimeOn, lightTimeOff) {
    this.#lightTimeOn = lightTimeOn || 1000;
    this.#lightTimeOff = lightTimeOff || 1000;
  }

  //--------------------------------------------------

  /**
   * @param {State} value
   */
  set state(value) {
    if (this.#state == value) {
      console.warn('Gauge | set state | new value equal old value');
      return;
    }
    switch (value) {
      case State.ACTIVE_SYNCHRONIZE:
      case State.ACTIVE_MEASURE:
        if (this.#lightOnOffTimeoutId > 0) {
          console.warn('Emitter | set state | timer is working');
          return;
        }
        this._lightOn();
        break;
      case State.INACTIVE:
        clearTimeout(this.#lightOnOffTimeoutId);
        this.#lightOnOffTimeoutId = -1;
        break;
      default:
        return;
    }
    this.#state = value;
    console.info('Emitter | set state | state=' + this.#state);
  }

  /**
   * @returns {Number}
   */
  get lightTimeOn() {
    return this.#lightTimeOn;
  }

  /**
   * @param {Number} value
   */
  set lightTimeOn(value) {
    this.#lightTimeOn = Math.max(value, 0);
  }

  /**
   * @returns {Number}
   */
  get lightTimeOff() {
    return this.#lightTimeOff;
  }

  /**
   * @param {Number} value
   */
  set lightTimeOff(value) {
    this.#lightTimeOff = Math.max(value, 0);
  }

  //--------------------------------------------------

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

  _lightOn() {
    this.#signal.emit(Emitter.EVENT_LIGHT, true);
    this.#lightOnOffTimeoutId = setTimeout(this._lightOff.bind(this), this.#lightTimeOn);
  }

  _lightOff() {
    this.#signal.emit(Emitter.EVENT_LIGHT, false);
    this.#lightOnOffTimeoutId = setTimeout(this._lightOn.bind(this), this.#lightTimeOff);
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
