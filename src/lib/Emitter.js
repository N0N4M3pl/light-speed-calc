import signal from 'signal-js';
import { State } from './State';

export default class Emitter {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {String} */
  static EVENT_LIGHT = 'light';

  /** @type {State} */
  #state = State.INACTIVE;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #lightTimeOn = 1000;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #lightTimeOff = 1000;

  /** @type {Number} */
  #lightOnOffTimeoutId = -1;

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
        clearTimeout(this.#lightOnOffTimeoutId);
        this.#lightOnOffTimeoutId = -1;
        break;
      case State.ACTIVE_SYNCHRONIZE:
        if (this.#lightOnOffTimeoutId < 0) {
          this._lightOn();
        }
        break;
    }
    // console.info('Emitter | set state | ' + this.#state + ' -> ' + value);
    this.#state = value;
  }

  /**
   * @returns {Number} UNIT: milliseconds
   */
  get lightTimeOn() {
    return this.#lightTimeOn;
  }

  /**
   * @param {Number} value UNIT: milliseconds
   */
  set lightTimeOn(value) {
    this.#lightTimeOn = Math.max(value, 0);
  }

  /**
   * @returns {Number} UNIT: seconds
   */
  get lightTimeOnInSeconds() {
    return this.lightTimeOn / 1000;
  }

  /**
   * @param {Number} value UNIT: seconds
   */
  set lightTimeOnInSeconds(value) {
    this.lightTimeOn = value * 1000;
  }

  /**
   * @returns {Number} UNIT: milliseconds
   */
  get lightTimeOff() {
    return this.#lightTimeOff;
  }

  /**
   * @param {Number} value UNIT: milliseconds
   */
  set lightTimeOff(value) {
    this.#lightTimeOff = Math.max(value, 0);
  }

  /**
   * @returns {Number} UNIT: seconds
   */
  get lightTimeOffInSeconds() {
    return this.lightTimeOff / 1000;
  }

  /**
   *  
   * @param {Number} value UNIT: seconds
   */
  set lightTimeOffInSeconds(value) {
    this.lightTimeOff = value * 1000;
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
    this.#lightOnOffTimeoutId = setTimeout(this._lightOff.bind(this), this.#lightTimeOn);
    this.#signal.emit(Emitter.EVENT_LIGHT, true);
  }

  _lightOff() {
    this.#lightOnOffTimeoutId = setTimeout(this._lightOn.bind(this), this.#lightTimeOff);
    this.#signal.emit(Emitter.EVENT_LIGHT, false);
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
