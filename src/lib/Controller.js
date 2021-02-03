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

  /** @type {Boolean} */
  #modeIsAutomatic = true;

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
  #activeTimeStart;

  /** @type {Number} */
  #measureAmountOfEmitterLightEvents;

  /** @type {Number} */
  #activeCheckIntervalId = -1;

  /** @type {Number} */
  #activeCheckTimeThreshold = -1;

  /** @type {Number} */
  #activeCheckTime = -1;

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
  #gaugeMeasuredLightTimeEvents = [];

  /** @type {Array.<{x: Number, y: Number}>} */
  #gaugeMeasuredSpeedOfLightEvents = [];

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
        this._activeCheckStop();
        if (this.#modeIsAutomatic) {
          this.#emitter.lightOnAmount = 1;
        }
        break;
      case State.ACTIVE:
        this._activeCheckStop();
        if (this.#modeIsAutomatic) {
          this.#emitter.lightOnAmount = Number.MAX_SAFE_INTEGER;
        }
        this.#activeCheckTime = -1;
        this.#activeCheckTimeThreshold = -1;
        this.#stateEvents = [];
        this.#emitterLightEvents = [];
        this.#distanceLengthEvents = [];
        this.#distanceLightDelayEvents = [];
        this.#gaugeLightEvents = [];
        this.#gaugeMeasuredLightTimeEvents = [];
        this.#gaugeMeasuredSpeedOfLightEvents = [];
        this.#activeTimeStart = performance.now();
        break;
      case State.ACTIVE_COLLECTING:
        if (this.#modeIsAutomatic) {
          this.#measureAmountOfEmitterLightEvents = 0;
          this._activeCheckStart();
        }
        break;
    }
    this.#gauge.state = value;
    this.#distance.state = value;
    this.#emitter.state = value;
    console.info('Controller | set state | ' + this.#state + ' -> ' + value);
    this.#stateEvents.push(this._generateStateEvent(this.#state));
    this.#stateEvents.push(this._generateStateEvent(value));
    this.#state = value;
    setTimeout(() => {
      this.#signal.emit(Controller.EVENT_STATE, this.#state);
      switch (this.#state) {
        case State.ACTIVE:
          this.state = (this.#modeIsAutomatic) ? State.ACTIVE_SYNCHRONIZE : State.ACTIVE_SEPARATION;
          break;
      }
    }, 0);
  }

  /**
   * @returns {Boolean}
   */
  get modeIsAutomatic() {
    return this.#modeIsAutomatic;
  }

  /**
   * @param {Boolean} value
   */
  set modeIsAutomatic(value) {
    this.#modeIsAutomatic = value;
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
  get gaugeMeasuredLightTimeEvents() {
    return this.#gaugeMeasuredLightTimeEvents;
  }

  /**
   * @returns {Array.<{x: Number, y: Number}>}
   */
  get gaugeMeasuredSpeedOfLightEvents() {
    return this.#gaugeMeasuredSpeedOfLightEvents;
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
      case State.ACTIVE_COLLECTING:
        if (this.#modeIsAutomatic) {
          this.#measureAmountOfEmitterLightEvents++;
          if (this.#measureAmountOfEmitterLightEvents == 10) {
            this.state = State.ACTIVE_MEASURE;
          }
        } else {
          if (this.#emitter.lightOnCounter == this.#emitter.lightOnAmount) {
            this.state = State.ACTIVE_MEASURE;
          }
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
   * @param {Number} lightEmitDelayCurrent
   */
  _distanceLengthListener(lengthCurrent, lightEmitDelayCurrent) {
    this.#distanceLengthEvents.push(this._generateDistanceLengthEvent(lengthCurrent));
    this.#distanceLightDelayEvents.push(this._generateLightTimeEvent(lightEmitDelayCurrent));
    switch (this.#state) {
      case State.ACTIVE_SEPARATION:
        if (this.#distance.isSeperated) {
          this.state = State.ACTIVE_COLLECTING;
        }
        break;
    }
  }

  /**
   * @param {GaugeMeasurement} measurement
   */
  _gaugeMeasurementListener(measurement) {
    this.#gaugeMeasuredLightTimeEvents.push(this._generateLightTimeEvent(measurement.timeDiff));
    if (this.#modeIsAutomatic) {
      switch (this.#state) {
        case State.ACTIVE_SYNCHRONIZE:
          if (this.#gauge.isSynchronized) {
            this.state = State.ACTIVE_SEPARATION;
          }
          break;
        case State.ACTIVE_SEPARATION:
        case State.ACTIVE_COLLECTING:
          this.#gaugeMeasuredSpeedOfLightEvents.push(this._generateSpeedOfLightEvent(measurement.speedOfLight));
          break;
        case State.ACTIVE_MEASURE:
          this.#gaugeMeasuredSpeedOfLightEvents.push(this._generateSpeedOfLightEvent(measurement.speedOfLight));
          this.#activeCheckTime = performance.now();
          break;
      }
    } else {
      this.#gaugeMeasuredSpeedOfLightEvents.push(this._generateSpeedOfLightEvent(measurement.speedOfLight));
    }
  }

  //--------------------------------------------------

  _activeCheckStop() {
    clearInterval(this.#activeCheckIntervalId);
    this.#activeCheckIntervalId = -1;
  }

  _activeCheckStart() {
    this.#activeCheckTimeThreshold = (this.#gauge.lightOnTime + this.#gauge.lightOffTime) * 2;
    this.#activeCheckIntervalId = setInterval(this._activeCheck.bind(this), this.#activeCheckTimeThreshold);
  }

  _activeCheck() {
    if (this.#activeCheckTime > 0) {
      const diff = performance.now() - this.#activeCheckTime;
      // console.log('Controller | _activeCheck | ' + diff + ' > ' + this.#activeCheckTimeThreshold);
      if (diff > this.#activeCheckTimeThreshold) {
        // console.log('Controller | _activeCheck | ' + diff + ' > ' + this.#activeCheckTimeThreshold);
        this.state = State.INACTIVE;
      }
    }
  }

  //--------------------------------------------------

  /**
   * @param {String|State} state
   */
  _generateStateEvent(state) {
    const event = {
      x: performance.now() - this.#activeTimeStart,
      y: 5
    };
    switch (state) {
      case State.ACTIVE:
        event.y = 4;
        break
      case State.ACTIVE_SYNCHRONIZE:
        event.y = 3;
        break;
      case State.ACTIVE_SEPARATION:
        event.y = 2;
        break;
      case State.ACTIVE_COLLECTING:
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
      x: performance.now() - this.#activeTimeStart,
      y: lightIsOn ? 0 : 1
    };
  }

  /**
   * @param {Number} length
   */
  _generateDistanceLengthEvent(length) {
    return {
      x: performance.now() - this.#activeTimeStart,
      y: length
    };
  }

  /**
   * @param {Number} time
   */
  _generateLightTimeEvent(time) {
    return {
      x: performance.now() - this.#activeTimeStart,
      y: time
    };
  }

  /**
   * @param {Number} speedOfLight
   */
  _generateSpeedOfLightEvent(speedOfLight) {
    return {
      x: performance.now() - this.#activeTimeStart,
      y: speedOfLight
    };
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
