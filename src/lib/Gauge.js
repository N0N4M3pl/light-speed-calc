import signal from 'signal-js';
import Distance from './Distance';
import Measurement from './Measurement';
import { State } from './State';

export default class Gauge {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {Number} */
  static LIGHT_TIME_MAX = 1000 * 60 * 60;

  /** @type {State} */
  #state = State.INACTIVE;

  /** @type {Array.<Measurement>} */
  #measurementData;

  /** @type {Number} */
  #lightTimeOn = 0;

  /** @type {Number} */
  #lightTimeOff = 0;

  /** @type {Distance} */
  #distance;

  /** @type {signal} */
  #signal = new signal();

  //--------------------------------------------------
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
        this.#measurementData = new Array();
        this.#lightTimeOn = Gauge.LIGHT_TIME_MAX;
        this.#lightTimeOff = Gauge.LIGHT_TIME_MAX;
        break;
      case State.ACTIVE_MEASURE:
        break;
      case State.INACTIVE:
        break;
      default:
        return;
    }
    this.#state = value;
    console.info('Gauge | set state | state=' + this.#state);
  }

  /**
   * @returns {Boolean}
   */
  get isConnectedToDistance() {
    return this.#distance != null;
  }

  /**
   * @returns {Number}
   */
  get lightTimeOn() {
    return this.#lightTimeOn;
  }

  /**
   * @returns {Number}
   */
  get lightTimeOff() {
    return this.#lightTimeOff;
  }

  /**
   * @returns {Boolean}
   */
  get isSynchronized() {
    return this.#lightTimeOn < Gauge.LIGHT_TIME_MAX && this.#lightTimeOff < Gauge.LIGHT_TIME_MAX;
  }

  //--------------------------------------------------

  /**
   * @param {Distance} distance
   */
  connectToDistance(distance) {
    if (this.isConnectedToDistance) {
      console.warn('Gauge | connectToDistance | is already connected');
      return;
    }
    console.info('Gauge | connectToDistance');
    this.#distance = distance;
    this.#distance.connect(Distance.EVENT_LIGHT, this._distanceLightListener.bind(this));
    this.#distance.connect(Distance.EVENT_LENGTH, this._distanceLengthListener.bind(this));
  }

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

  /**
   * @param {Boolean} lightIsOn
   */
  _distanceLightListener(lightIsOn) {
    const measurement = new Measurement(lightIsOn, performance.now());
    const measurementDataLength = this.#measurementData.length;
    switch (this.#state) {
      case State.ACTIVE_SYNCHRONIZE:
        if (this.#measurementData.length != 0) {
          let measurementLast = this.#measurementData[measurementDataLength - 1];
          if (measurement.isOn == measurementLast.isOn) {
            console.warn('Gauge | _distanceLightListener | sequence error | lightIsOn=' + lightIsOn + ', measurementLast.isOn=' + measurementLast.isOn);
            return;
          } else {
            if (lightIsOn) {
              this.#lightTimeOff = Math.min(this.#lightTimeOff, measurement.time - measurementLast.time);
            } else {
              this.#lightTimeOn = Math.min(this.#lightTimeOn, measurement.time - measurementLast.time);
            }
          }
        }
        break;
      case State.ACTIVE_MEASURE:
        break;
      default:
        return;
    }
    this.#measurementData.push(measurement);
    this.#signal.emit('light', lightEvent);
  }

  /**
   * @param {Number} lengthCurrent 
   * @param {Number} lengthTarget 
   */
  _distanceLengthListener(lengthCurrent, lengthTarget) {
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
