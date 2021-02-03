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
  timeDiff;

  /**
   * UNIT: meters 
   * @type {Number}
   */
  distance;
  
  /**
   * UNIT: meters / milliseconds 
   * @type {Number}
   */
  speedOfLight;

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
    this.timeDiff = 0;
    this.distance = 0;
    this.speedOfLight = 0;
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}
