import signal from 'signal-js';
import { State } from './State';
import Emitter from './Emitter';
import Distance from './Distance';
import Gauge from './Gauge';

export default class Controller {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {String} */
  static EVENT_STATE = 'state';

  /** @type {State} */
  #state = State.INACTIVE;

  /** @type {Emitter} */
  #emitter;

  /** @type {Distance} */
  #distance;

  /** @type {Gauge} */
  #gauge;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  #timeStartActiveSynchronize;

  /** @type {Number} */
  #measureAmountOfEmitterLightEvents;

  /** @type {Array.<{x: Number, y: Number}>} */
  #stateEvents = [];

  /** @type {Array.<{x: Number, y: Number}>} */
  #emitterLightEvents = [];

  /** @type {Array.<{x: Number, y: Number}>} */
  #distanceLengthEvents = [];

  /** @type {Array.<{x: Number, y: Number}>} */
  #distanceLightDelayEvents = [];

  /** @type {Array.<{x: Number, y: Number}>} */
  #gaugeLightEvents = [];

  /** @type {Array.<{x: Number, y: Number}>} */
  #gaugeMeasuredLightDelayEvents = [];

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
      case State.ACTIVE_SYNCHRONIZE:
        this.#stateEvents = [];
        this.#emitterLightEvents = [];
        this.#distanceLengthEvents = [];
        this.#distanceLightDelayEvents = [];
        this.#gaugeLightEvents = [];
        this.#gaugeMeasuredLightDelayEvents = [];
        this.#timeStartActiveSynchronize = performance.now();
        break;
      case State.ACTIVE_MEASURE:
        this.#measureAmountOfEmitterLightEvents = 0;
        break;
    }
    this.#gauge.state = value;
    this.#distance.state = value;
    this.#emitter.state = value;
    console.info('Controller | set state | ' + this.#state + ' -> ' + value);
    this.#stateEvents.push(this._generateStateEvent(this.#state));
    this.#stateEvents.push(this._generateStateEvent(value));
    this.#state = value;
    setTimeout(() => this.#signal.emit(Controller.EVENT_STATE, this.#state), 0);
  }

  /**
   * @returns {Array.<{x: Number, y: Number}>}
   */
  get stateEvents() {
    return this.#stateEvents;
  }

  /**
   * @returns {Array.<{x: Number, y: Number}>}
   */
  get emitterLightEvents() {
    return this.#emitterLightEvents;
  }

  /**
   * @returns {Array.<{x: Number, y: Number}>}
   */
  get distanceLengthEvents() {
    return this.#distanceLengthEvents;
  }

  /**
   * @returns {Array.<{x: Number, y: Number}>}
   */
  get distanceLightDelayEvents() {
    return this.#distanceLightDelayEvents;
  }

  /**
   * @returns {Array.<{x: Number, y: Number}>}
   */
  get gaugeLightEvents() {
    return this.#gaugeLightEvents;
  }

  /**
   * @returns {Array.<{x: Number, y: Number}>}
   */
  get gaugeMeasuredLightDelayEvents() {
    return this.#gaugeMeasuredLightDelayEvents;
  }

  //--------------------------------------------------

  /**
   * @param {Emitter} emitter
   * @param {Distance} distance
   * @param {Gauge} gauge
   */
  connectElements(emitter, distance, gauge) {
    this.#emitter = emitter;
    this.#distance = distance;
    this.#gauge = gauge;

    this.#distance.connectToEmmitter(this.#emitter);
    this.#gauge.connectToDistance(this.#distance);

    this.#emitter.connect(Emitter.EVENT_LIGHT, this._emitterLightListener.bind(this));
    this.#distance.connect(Distance.EVENT_LIGHT, this._distanceLightListener.bind(this));
    this.#distance.connect(Distance.EVENT_LENGTH, this._distanceLengthListener.bind(this));
    this.#gauge.connect(Gauge.EVENT_MEASUREMENT, this._gaugeMeasurementListener.bind(this));
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
    this.#emitterLightEvents.push(this._generateLightEvent(!lightIsOn));
    this.#emitterLightEvents.push(this._generateLightEvent(lightIsOn));
    switch (this.#state) {
      case State.ACTIVE_MEASURE:
        this.#measureAmountOfEmitterLightEvents++;
        if (this.#measureAmountOfEmitterLightEvents == 5) {
          this.#emitter.state = State.INACTIVE;
        }
        break;
    }
  }

  /**
   * @param {Boolean} lightIsOn
   */
  _distanceLightListener(lightIsOn) {
    this.#gaugeLightEvents.push(this._generateLightEvent(!lightIsOn));
    this.#gaugeLightEvents.push(this._generateLightEvent(lightIsOn));
  }

  /**
   * @param {Number} lengthCurrent
   * @param {Number} lengthTarget
   * @param {Number} lengthRatio
   */
  _distanceLengthListener(lengthCurrent, lengthTarget, lightEmitDelayCurrent) {
    this.#distanceLengthEvents.push(this._generateDistanceLengthEvent(lengthCurrent));
    this.#distanceLightDelayEvents.push(this._generateLightDelayEvent(lightEmitDelayCurrent));
    switch (this.#state) {
      case State.ACTIVE_SEPARATION:
        if (lengthCurrent == lengthTarget) {
          this.state = State.ACTIVE_MEASURE;
        }
        break;
    }
  }

  /**
   * @param {GaugeMeasurement} measurement
   */
  _gaugeMeasurementListener(measurement) {
    this.#gaugeMeasuredLightDelayEvents.push(this._generateLightDelayEvent(measurement.timeDelay));
    switch (this.#state) {
      case State.ACTIVE_SYNCHRONIZE:
        if (this.#gauge.isSynchronized) {
          this.state = State.ACTIVE_SEPARATION;
        }
        break;
      case State.ACTIVE_SEPARATION:
      case State.ACTIVE_MEASURE:
        // this.state = State.INACTIVE;
        break;
    }
  }

  //--------------------------------------------------

  /**
   * @param {String|State} state
   */
  _generateStateEvent(state) {
    const event = {
      x: performance.now() - this.#timeStartActiveSynchronize,
      y: 3
    };
    switch (state) {
      case State.ACTIVE_SYNCHRONIZE:
        event.y = 2;
        break;
      case State.ACTIVE_SEPARATION:
        event.y = 1;
        break;
      case State.ACTIVE_MEASURE:
        event.y = 0;
        break;
    }
    return event;
  }

  //--------------------------------------------------

  /**
   * @param {Boolean} lightIsOn
   */
  _generateLightEvent(lightIsOn) {
    return {
      x: performance.now() - this.#timeStartActiveSynchronize,
      y: lightIsOn ? 0 : 1
    };
  }

  /**
   * @param {Number} length
   */
  _generateDistanceLengthEvent(length) {
    return {
      x: performance.now() - this.#timeStartActiveSynchronize,
      y: length
    };
  }

  /**
   * @param {Number} lightDelay
   */
  _generateLightDelayEvent(lightDelay) {
    return {
      x: performance.now() - this.#timeStartActiveSynchronize,
      y: lightDelay
    };
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
