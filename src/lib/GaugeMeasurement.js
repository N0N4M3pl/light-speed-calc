export default class GaugeMeasurement {
  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {Boolean} */
  isOn;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  timeGauge;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  timeEmitter;

  /**
   * UNIT: milliseconds 
   * @type {Number}
   */
  timeDelay;

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @param {Boolean} isOn
   * @param {Number} timeGauge UNIT: milliseconds 
   */
  constructor(isOn, timeGauge) {
    this.isOn = isOn;
    this.timeGauge = timeGauge;
    this.timeEmitter = timeGauge;
    this.timeDelay = 0;
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
