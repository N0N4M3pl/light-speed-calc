import signal from 'signal-js';
import { EmitterState } from './EmitterState';
import LightEvent from './LightEvent';

export default class Emitter {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {EmitterState} */
  #state = EmitterState.INACTIVE;

  /** @type {Number} */
  #lightOnTime = 1000;

  /** @type {Number} */
  #lightOffTime = 1000;

  /** @type {Number} */
  #index;

  /** @type {Number} */
  #lightOnOffTimeoutId;

  /** @type {signal} */
  #signal = new signal();

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @param {Number} lightOnTime
   * @param {Number} lightOffTime
   */
  constructor(lightOnTime, lightOffTime) {
    this.#lightOnTime = lightOnTime || 1000;
    this.#lightOffTime = lightOffTime || 1000;
  }

  //--------------------------------------------------

  /**
   * @param {EmitterState} value
   */
  set state(value) {
    if (this.#state == value) {
      console.warn('Gauge | set state | new value equal old value');
      return;
    }
    switch (value) {
      case EmitterState.ACTIVE:
        if (this.#lightOnOffTimeoutId > 0) {
          console.warn('Emitter | set state | timer is working');
          return;
        }
        this.#index = 0;
        this._lightOn();
        break;
      case EmitterState.INACTIVE:
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
  get lightOnTime() {
    return this.#lightOnTime;
  }

  /**
   * @returns {Number}
   */
  get lightOffTime() {
    return this.#lightOffTime;
  }

  //--------------------------------------------------

  /**
   * @param {Function} listener
   */
  connect(listener) {
    this.#signal.on('light', listener);
  }

  /**
   * @param {Function} listener
   */
  disconnect(listener) {
    this.#signal.off('light', listener);
  }

  //--------------------------------------------------

  _lightOn() {
    this.#lightOnOffTimeoutId = setTimeout(this._lightOff.bind(this), this.#lightOnTime);
    this.#index++;
    const lightEvent = new LightEvent(true, this.#index, performance.now());
    this.#signal.emit('light', lightEvent);
  }

  _lightOff() {
    this.#lightOnOffTimeoutId = setTimeout(this._lightOn.bind(this), this.#lightOffTime);
    const lightEvent = new LightEvent(false, this.#index, performance.now());
    this.#signal.emit('light', lightEvent);
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
