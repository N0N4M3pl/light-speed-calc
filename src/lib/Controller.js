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
  #activeStopCheckIntervalId = -1;

  /** @type {Number} */
  #activeStopCheckTimeThreshold = -1;

  /** @type {Number} */
  #activeStopCheckTime = -1;

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
        this._activeStopCheckEnd();
        if (this.#modeIsAutomatic) {
          this.#emitter.lightOnAmount = 1;
        }
        break;
      case State.ACTIVE_START:
        this._activeStopCheckEnd();
        if (this.#modeIsAutomatic) {
          this.#emitter.lightOnAmount = Number.MAX_SAFE_INTEGER;
        }
        this.#activeStopCheckTime = -1;
        this.#activeStopCheckTimeThreshold = -1;
        this.#stateEvents = [];
        this.#emitterLightEvents = [];
        this.#distanceLengthEvents = [];
        this.#distanceLightDelayEvents = [];
        this.#gaugeLightEvents = [];
        this.#gaugeMeasuredLightDelayEvents = [];
        this.#gaugeMeasuredSpeedOfLightEvents = [];
        this.#activeTimeStart = performance.now();
        break;
      case State.ACTIVE_COLLECTING:
        if (this.#modeIsAutomatic) {
          this.#measureAmountOfEmitterLightEvents = 0;
          this._activeStopCheckBegin();
        }
        break;
      case State.ACTIVE_STOP:
        this._activeStopCheckEnd();
        if (this.#modeIsAutomatic) {
          this.#emitter.lightOnAmount = 1;
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
        case State.ACTIVE_START:
          this.state = (this.#modeIsAutomatic) ? State.ACTIVE_SYNCHRONIZE : State.ACTIVE_SEPARATION;
          break;
        case State.ACTIVE_STOP:
          this.state = State.INACTIVE;
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
  get gaugeMeasuredLightDelayEvents() {
    return this.#gaugeMeasuredLightDelayEvents;
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
          if (this.#measureAmountOfEmitterLightEvents == 3) {
            console.log('Controller | _emitterLightListener | set state to ACTIVE_MEASURE | this.#measureAmountOfEmitterLightEvents == 3');
            this.state = State.ACTIVE_MEASURE;
          }
        } else {
          if (this.#emitter.lightOnCounter == this.#emitter.lightOnAmount) {
            console.log('Controller | _emitterLightListener | set state to ACTIVE_MEASURE | this.#emitter.lightOnCounter == this.#emitter.lightOnAmount');
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
    this.#distanceLightDelayEvents.push(this._generateLightDelayEvent(lightEmitDelayCurrent));
    switch (this.#state) {
      case State.ACTIVE_SEPARATION:
        if (this.#distance.isSeperated) {
          console.log('Controller | _distanceLengthListener | set state to ACTIVE_COLLECTING | this.#distance.isSeperated');
          this.state = State.ACTIVE_COLLECTING;
        }
        break;
    }
  }

  /**
   * @param {GaugeMeasurement} measurement
   */
  _gaugeMeasurementListener(measurement) {
    this.#gaugeMeasuredLightDelayEvents.push(this._generateLightDelayEvent(measurement.timeDiff));
    if (this.#modeIsAutomatic) {
      switch (this.#state) {
        case State.ACTIVE_SYNCHRONIZE:
          if (this.#gauge.isSynchronized) {
            console.log('Controller | _gaugeMeasurementListener | set state to ACTIVE_SEPARATION | this.#gauge.isSynchronized');
            this.state = State.ACTIVE_SEPARATION;
          }
          break;
        // case State.ACTIVE_SEPARATION:
        case State.ACTIVE_COLLECTING:
          this.#gaugeMeasuredSpeedOfLightEvents.push(this._generateSpeedOfLightEvent(measurement.speedOfLight));
          break;
        case State.ACTIVE_MEASURE:
          this.#gaugeMeasuredSpeedOfLightEvents.push(this._generateSpeedOfLightEvent(measurement.speedOfLight));
          this.#activeStopCheckTime = performance.now();
          console.log('Controller | _gaugeMeasurementListener | this.#activeStopCheckTime=' + this.#activeStopCheckTime);
          break;
      }
    } else {
      this.#gaugeMeasuredSpeedOfLightEvents.push(this._generateSpeedOfLightEvent(measurement.speedOfLight));
    }
  }

  //--------------------------------------------------

  _activeStopCheckEnd() {
    clearInterval(this.#activeStopCheckIntervalId);
    this.#activeStopCheckIntervalId = -1;
  }

  _activeStopCheckBegin() {
    this.#activeStopCheckTimeThreshold = (this.#gauge.lightOnTime + this.#gauge.lightOffTime) * 2;
    console.log('Controller | _activeStopCheckBegin | this.#activeStopCheckTimeThreshold=' + this.#activeStopCheckTimeThreshold);
    this.#activeStopCheckIntervalId = setInterval(this._activeStopCheck.bind(this), this.#activeStopCheckTimeThreshold);
  }

  _activeStopCheck() {
    if (this.#activeStopCheckTime > 0) {
      const diff = performance.now() - this.#activeStopCheckTime;
      // console.log('Controller | _activeCheck | ' + diff + ' > ' + this.#activeCheckTimeThreshold);
      if (diff > this.#activeStopCheckTimeThreshold) {
        // console.log('Controller | _activeCheck | ' + diff + ' > ' + this.#activeCheckTimeThreshold);
        console.log('Controller | _activeStopCheck | set state to ACTIVE_STOP | diff > this.#activeStopCheckTimeThreshold | ' + diff + ' > ' + this.#activeStopCheckTimeThreshold);
        this.state = State.ACTIVE_STOP;
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
      y: 6
    };
    switch (state) {
      case State.ACTIVE_START:
        event.y -= 1;
        break
      case State.ACTIVE_SYNCHRONIZE:
        event.y -= 2;
        break;
      case State.ACTIVE_SEPARATION:
        event.y -= 3;
        break;
      case State.ACTIVE_COLLECTING:
        event.y -= 4;
        break;
      case State.ACTIVE_MEASURE:
        event.y -= 5;
        break;
      case State.ACTIVE_STOP:
        event.y -= 6;
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
   * @param {Number} delay
   */
  _generateLightDelayEvent(delay) {
    return {
      x: performance.now() - this.#activeTimeStart,
      y: delay
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
