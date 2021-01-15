export default class LightEvent {

  //--------------------------------------------------
  //--------------------------------------------------

  /** @type {Boolean} */
  isOn;

  /** @type {Number} */
  index;

  /** @type {Number} */
  emitterTime;

  /** @type {Number} */
  distanceLength;

  /** @type {Number} */
  distanceTime;

  /** @type {Number} */
  gaugeTime;

  //--------------------------------------------------
  //--------------------------------------------------

  /**
   * @param {Boolean} isOn 
   * @param {Number} index 
   * @param {Number} emitterTime 
   */
  constructor(isOn, index, emitterTime) {
    this.isOn = isOn;
    this.index = index;
    this.emitterTime = emitterTime;
  }

  //--------------------------------------------------

  /**
   * @returns {String}
   */
  toString() {
    return 'LightEvent{isOn=' + this.isOn + ', index=' + this.index + ', distanceLength=' + this.distanceLength + '}';
  }

  //--------------------------------------------------
  //--------------------------------------------------
  //--------------------------------------------------
}