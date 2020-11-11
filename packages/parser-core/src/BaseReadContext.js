/**
  * @typedef {Object} BaseReadOption
  * @property {boolean} force
  *
  * @typedef {Object} BaseReadOptionType
  * @property {string} force
  */

class BaseReadContext {
  /**
   * @pblic
   * @type {BaseReadOption}
   */
  options;

  /**
   * @public
   * @type {import('./readEntries').ReadEntriesReturnType[]}
   */
  entries;

  /**
   * @public
   * @type {Array<import('./BaseBook').default>}
   */
  items;

  constructor() {
    this.items = undefined;
    this.entries = undefined;
    this.options = undefined;
  }
}
export default BaseReadContext;
