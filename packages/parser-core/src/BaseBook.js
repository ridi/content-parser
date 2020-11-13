import { mustOverride } from './errors';

/**
 * @abstract
 * @class
 */
class BaseBook {
  /**
   * @virtual
   * @returns {string}
   */
  toRaw() {
    mustOverride();
  }
}
export default BaseBook;
