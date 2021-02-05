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
  #lightOnTime = 0;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #lightOffTime = 0;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #activeTimeStart;

  /** @type {Boolean} */
  #isSynchronized = false;

  /** @type {Number} */
  #synchronizationIndex = 0;

  /**
   * UNIT: meters / milliseconds 
   * @type {Number}
   */
  #speedOfLight = 0;

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
      case State.ACTIVE_START:
        this.#measurementData = new Array();
        this.#isSynchronized = false;
        this.#speedOfLight = Number.MAX_SAFE_INTEGER;
        this.#activeTimeStart = performance.now();
        break;
      case State.ACTIVE_SYNCHRONIZE:
        this.#lightOnTime = Gauge.LIGHT_TIME_MAX;
        this.#lightOffTime = Gauge.LIGHT_TIME_MAX;
        this.#synchronizationIndex = 0;
        break;
      case State.ACTIVE_SEPARATION:
        this.#isSynchronized = true;
        break;
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
   * @returns {Boolean}
   */
  get isSynchronized() {
    return this.#isSynchronized;
  }

  /**
   * @returns {Number} UNIT: meters / milliseconds 
   */
  get speedOfLight() {
    return this.#speedOfLight;
  }

  /**
   * @returns {Number} UNIT: meters / seconds 
   */
  get speedOfLightInSeconds() {
    return this.speedOfLight * 1000;
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
    const measurement = new GaugeMeasurement(lightIsOn, performance.now() - this.#activeTimeStart);
    const index = this.#measurementData.length;
    switch (this.#state) {
      case State.INACTIVE:
      case State.ACTIVE_START:
      case State.ACTIVE_STOP:
        return;
      case State.ACTIVE_SYNCHRONIZE:
      case State.ACTIVE_SEPARATION:
      case State.ACTIVE_COLLECTING:
      case State.ACTIVE_MEASURE:
        if (index > 0) {
          const measurementLast = this.#measurementData[index - 1];
          if (this.#isSynchronized) {
            measurement.timeEmitter = measurementLast.timeEmitter + (lightIsOn ? this.#lightOffTime : this.#lightOnTime);
            measurement.timeDiff = measurement.timeGauge - measurement.timeEmitter;
            measurement.distance = this.#distance.lengthCurrent;
            measurement.speedOfLight = measurement.distance / measurement.timeDiff;
            this.#speedOfLight = Math.min(measurement.speedOfLight, this.#speedOfLight);
            console.log('Gauge | tE=' + measurement.timeEmitter.toFixed(5) + ',\ttG=' + measurement.timeGauge.toFixed(5) + ',\tdiff=' + measurement.timeDiff.toFixed(5) + ',\tdist=' + measurement.distance.toFixed(5) + ',\tspeed=' + measurement.speedOfLight.toFixed(5));
          } else {
            if (measurement.isOn != measurementLast.isOn) {
              let lightTime = measurement.timeGauge - measurementLast.timeGauge;
              let lightTimeHasChanged = false;
              if (lightIsOn) {
                if (lightTime < this.#lightOffTime) {
                  this.#lightOffTime = lightTime;
                  lightTimeHasChanged = true;
                }
              } else {
                if (lightTime < this.#lightOnTime) {
                  this.#lightOnTime = lightTime;
                  lightTimeHasChanged = true;
                }
              }
              if (lightTimeHasChanged) {
                this.#synchronizationIndex = index;
              } else {
                if (index - this.#synchronizationIndex > 6) {
                  this.#isSynchronized =
                    this.#lightOnTime < Gauge.LIGHT_TIME_MAX && this.#lightOffTime < Gauge.LIGHT_TIME_MAX;
                }
              }
            }
          }
        }
        break;
    }
    // console.log('Gauge | _distanceLightListener | ' + index + '\t | ' + (lightIsOn ? 'ON' : 'OFF') + '\t | E=' + measurement.timeEmitter + '\t | G=' + measurement.timeGauge + '\t | delay=' + measurement.timeDelay + '\t | timeOn=' + this.#lightOnTime.toFixed(0) + ', timeOff=' + this.#lightOffTime.toFixed(0));
    this.#measurementData.push(measurement);
    this.#signal.emit(Gauge.EVENT_MEASUREMENT, measurement);
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
