import signal from 'signal-js';
import { State } from './State';
import Distance from './Distance';
import GaugeMeasurement from './GaugeMeasurement';

export default class Gauge {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {String} */
  static EVENT_MEASUREMENT = 'measurement';

  /** @type {Number} */
  static LIGHT_TIME_MAX = 1000 * 60 * 60;

  /** @type {State} */
  #state = State.INACTIVE;

  /** @type {Array.<GaugeMeasurement>} */
  #measurementData;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #lightTimeOn = 0;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #lightTimeOff = 0;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #timeStartActiveSynchronize;

  /** @type {Boolean} */
  #isSynchronized = false;

  /** @type {Number} */
  #synchronizationIndex = 0;

  /** @type {Distance} */
  #distance;

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
        break;
      case State.ACTIVE_SYNCHRONIZE:
        this.#measurementData = new Array();
        this.#lightTimeOn = Gauge.LIGHT_TIME_MAX;
        this.#lightTimeOff = Gauge.LIGHT_TIME_MAX;
        this.#timeStartActiveSynchronize = performance.now();
        this.#isSynchronized = false;
        this.#synchronizationIndex = 0;
        break;
      default:
        return;
    }
    // console.info('Gauge | set state | ' + this.#state + ' -> ' + value);
    this.#state = value;
  }

  /**
   * @returns {Boolean}
   */
  get isConnectedToDistance() {
    return this.#distance != null;
  }

  /**
   * @returns {Number} UNIT: milliseconds 
   */
  get lightTimeOn() {
    return this.#lightTimeOn;
  }

  /**
   * @returns {Number} UNIT: seconds 
   */
  get lightTimeOnInSeconds() {
    return this.lightTimeOn / 1000;
  }

  /**
   * @returns {Number} UNIT: milliseconds 
   */
  get lightTimeOff() {
    return this.#lightTimeOff;
  }

  /**
   * @returns {Number} UNIT: seconds 
   */
  get lightTimeOffInSeconds() {
    return this.lightTimeOff / 1000;
  }

  /**
   * @returns {Boolean}
   */
  get isSynchronized() {
    return this.#isSynchronized;
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
  _distanceLightListener(lightIsOn) {
    const measurement = new GaugeMeasurement(lightIsOn, performance.now() - this.#timeStartActiveSynchronize);
    const index = this.#measurementData.length;
    switch (this.#state) {
      case State.INACTIVE:
        return;
      case State.ACTIVE_SYNCHRONIZE:
      case State.ACTIVE_SEPARATION:
      case State.ACTIVE_MEASURE:
        if (index > 0) {
          const measurementLast = this.#measurementData[index - 1];
          if (this.#isSynchronized) {
            measurement.timeEmitter = measurementLast.timeEmitter + (lightIsOn ? this.#lightTimeOff : this.#lightTimeOn);
            measurement.timeDelay = measurement.timeGauge - measurement.timeEmitter;
          } else {
            if (measurement.isOn == measurementLast.isOn) {
              console.warn('Gauge | _distanceLightListener | sequence error');
              return;
            } else {
              let lightTime = measurement.timeGauge - measurementLast.timeGauge;
              let lightTimeHasChanged = false;
              if (lightIsOn) {
                if (lightTime < this.#lightTimeOff) {
                  this.#lightTimeOff = lightTime;
                  lightTimeHasChanged = true;
                }
              } else {
                if (lightTime < this.#lightTimeOn) {
                  this.#lightTimeOn = lightTime;
                  lightTimeHasChanged = true;
                }
              }
              if (lightTimeHasChanged) {
                this.#synchronizationIndex = index;
              } else {
                if (index - this.#synchronizationIndex > 6) {
                  this.#isSynchronized =
                    this.#lightTimeOn < Gauge.LIGHT_TIME_MAX && this.#lightTimeOff < Gauge.LIGHT_TIME_MAX;
                }
              }
            }
          }
        }
        break;
    }
    // console.log('Gauge | _distanceLightListener | ' + index + '\t | ' + (lightIsOn ? 'ON' : 'OFF') + '\t | E=' + measurement.timeEmitter + '\t | G=' + measurement.timeGauge + '\t | delay=' + measurement.timeDelay + '\t | timeOn=' + this.#lightTimeOn.toFixed(0) + ', timeOff=' + this.#lightTimeOff.toFixed(0));
    this.#measurementData.push(measurement);
    this.#signal.emit(Gauge.EVENT_MEASUREMENT, measurement);
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
