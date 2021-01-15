import signal from 'signal-js';

export default class Distance {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {Number} */
  #length = 0;

  /** @type {Emmiter} */
  #emitter;

  /** @type {signal} */
  #signal = new signal();

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @returns {Boolean}
   */
  get isConnectedToEmmiter() {
    return this.#emitter != null;
  }

  /**
   * @returns {Number}
   */
  get length() {
    return this.#length;
  }

  /**
   * @param {Number} value
   */
  set length(value) {
    this.#length = Math.max(value, 0);
  }

  //--------------------------------------------------

  /**
   * @param {Emmiter} emitter
   */
  connectToEmmitter(emitter) {
    if (this.isConnectedToEmmiter) {
      console.warn('Distance | connectToEmmitter | is already connected');
      return;
    }
    console.info('Distance | connectToEmmitter');
    this.#emitter = emitter;
    this.#emitter.connect(this._emitterListener.bind(this));
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
  _emitterListener(lightEvent) {
    // console.info('Distance | _emitterListener | lightEvent=' + lightEvent);
    lightEvent.distanceLength = this.#length;
    lightEvent.distanceTime = performance.now();
    this.#signal.emit('light', lightEvent);
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
