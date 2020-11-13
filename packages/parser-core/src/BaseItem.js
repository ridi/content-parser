import { mustOverride } from './errors';

/**
 * @typedef {Object} BaseItemParam
 * @property {number} size
*/

class BaseItem {
  /**
   * @public
   * @type {number}
   */
  size;

  /**
   * @param {BaseItemParam} rawObj
   */
  constructor(rawObj) {
    this.size = rawObj.size;
  }

  /**
   * @public
   * @virtual
   * @returns {string}
   */
  toRaw() {
    mustOverride();
  }
}
export default BaseItem;
