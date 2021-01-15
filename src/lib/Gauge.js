import signal from 'signal-js';
import { GaugeState } from './GaugeState';

export default class Gauge {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {Number} */
  static LIGHT_MAX_TIME = 1000 * 60 * 60;

  /** @type {GaugeState} */
  #state = GaugeState.INACTIVE;

  /** @type {LightEvent} */
  #lastLightIsOnEvent;

  /** @type {LightEvent} */
  #lastLightIsOffEvent;

  /** @type {Number} */
  #lightOnTime = 0;

  /** @type {Number} */
  #lightOffTime = 0;

  /** @type {Distance} */
  #distance;

  /** @type {signal} */
  #signal = new signal();

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @param {GaugeState} value
   */
  set state(value) {
    if (this.#state == value) {
      console.warn('Gauge | set state | new value equal old value');
      return;
    }
    switch (value) {
      case GaugeState.ACTIVE_SYNCHRONIZE:
        this.#lightOnTime = Gauge.LIGHT_MAX_TIME;
        this.#lightOffTime = Gauge.LIGHT_MAX_TIME;
        break;
      case GaugeState.INACTIVE:
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
  get lightOnTime() {
    return this.#lightOnTime;
  }

  /**
   * @returns {Number}
   */
  get lightOffTime() {
    return this.#lightOffTime;
  }

  /**
   * @returns {Boolean}
   */
  get isSynchronized() {
    return (this.#lightOnTime < Gauge.LIGHT_MAX_TIME && this.#lightOffTime < Gauge.LIGHT_MAX_TIME)
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
    this.#distance.connect(this._distanceListener.bind(this));
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
   * @param {LightEvent} lightEvent
   */
  _distanceListener(lightEvent) {
    // console.info('Gauge | _distanceListener | lightEvent=' + lightEvent);
    lightEvent.gaugeTime = performance.now();
    switch (this.#state) {
      case GaugeState.ACTIVE_SYNCHRONIZE:
        if (lightEvent.isOn && this.#lastLightIsOffEvent) {
          this.#lightOffTime = Math.min(this.#lightOffTime, lightEvent.gaugeTime - this.#lastLightIsOffEvent.gaugeTime);
        } else if (!lightEvent.isOn && this.#lastLightIsOnEvent) {
          this.#lightOnTime = Math.min(this.#lightOnTime, lightEvent.gaugeTime - this.#lastLightIsOnEvent.gaugeTime);
        }
        break;
      default:
        return;
    }
    if (lightEvent.isOn) {
      this.#lastLightIsOnEvent = lightEvent;
    } else {
      this.#lastLightIsOffEvent = lightEvent;
    }
    this.#signal.emit('light', lightEvent);
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
