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
  #lightOnTime = 1000;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #lightOffTime = 1000;

  /** @type {Number} */
  #lightOnAmount = 1;

  /** @type {Number} */
  #lightOnCounter = 0;

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
        this._lightOnOffStop();
        break;
      case State.ACTIVE:
        this.#lightOnCounter = 0;
        break;
      case State.ACTIVE_SYNCHRONIZE:
      case State.ACTIVE_SEPARATION:
        if (this.#lightOnOffTimeoutId < 0) {
          this._lightOn();
        }
        break;
      case State.ACTIVE_MEASURE:
        this._lightOnOffStop();
        break;
    }
    // console.info('Emitter | set state | ' + this.#state + ' -> ' + value);
    this.#state = value;
  }

  /**
   * @returns {Number} UNIT: milliseconds
   */
  get lightOnTime() {
    return this.#lightOnTime;
  }

  /**
   * @param {Number} value UNIT: milliseconds
   */
  set lightOnTime(value) {
    this.#lightOnTime = Math.max(value, 1);
  }

  /**
   * @returns {Number} UNIT: seconds
   */
  get lightOnTimeInSeconds() {
    return this.lightOnTime / 1000;
  }

  /**
   * @param {Number} value UNIT: seconds
   */
  set lightOnTimeInSeconds(value) {
    this.lightOnTime = value * 1000;
  }

  /**
   * @returns {Number} UNIT: milliseconds
   */
  get lightOffTime() {
    return this.#lightOffTime;
  }

  /**
   * @param {Number} value UNIT: milliseconds
   */
  set lightOffTime(value) {
    this.#lightOffTime = Math.max(value, 1);
  }

  /**
   * @returns {Number} UNIT: seconds
   */
  get lightOffTimeInSeconds() {
    return this.lightOffTime / 1000;
  }

  /**
   *  
   * @param {Number} value UNIT: seconds
   */
  set lightOffTimeInSeconds(value) {
    this.lightOffTime = value * 1000;
  }

  /**
   * @returns {Number}
   */
  get lightOnAmount() {
    return this.#lightOnAmount;
  }

  /**
   *  
   * @param {Number} value
   */
  set lightOnAmount(value) {
    this.#lightOnAmount = Math.max(value, 1);
  }

  /**
   * @returns {Number}
   */
  get lightOnCounter() {
    return this.#lightOnCounter;
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
    this.#lightOnOffTimeoutId = setTimeout(this._lightOff.bind(this), this.#lightOnTime);
    this.#signal.emit(Emitter.EVENT_LIGHT, true);
    this.#lightOnCounter++;
  }

  _lightOff() {
    this.#lightOnOffTimeoutId = setTimeout(this._lightOn.bind(this), this.#lightOffTime);
    this.#signal.emit(Emitter.EVENT_LIGHT, false);
    if (this.#lightOnCounter == this.#lightOnAmount) {
      this._lightOnOffStop();
    }
  }

  _lightOnOffStop() {
    clearTimeout(this.#lightOnOffTimeoutId);
    this.#lightOnOffTimeoutId = -1;
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
