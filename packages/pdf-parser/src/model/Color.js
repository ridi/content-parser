/**
 * @typedef {Object} ColorRawObject
 * @property {number} 0
 * @property {number} 1
 * @property {number} 2
 */
class Color {
  /**
   * @returns {number}
   */
  get intValue() {
    return (this.red << 16) + (this.green << 8) + this.blue; // eslint-disable-line no-bitwise
  }

  /**
   * @returns {string}
   */
  get hexString() {
    return `#${((1 << 24) + this.intValue).toString(16).slice(1)}`; // eslint-disable-line no-bitwise
  }

  /**
   * @returns {string}
   */
  get rgbString() {
    return `rgb(${this.red}, ${this.green}, ${this.blue})`;
  }

  /**
   *
   * @param {ColorRawObject} rawObj
   */
  constructor(rawObj = {}) {
    this.red = rawObj['0'] || 0;
    this.green = rawObj['1'] || 0;
    this.blue = rawObj['2'] || 0;
    Object.freeze(this);
  }

  /**
   * @returns {ColorRawObject}
   */
  toRaw() {
    return {
      0: this.red,
      1: this.green,
      2: this.blue,
    };
  }
}

export default Color;
