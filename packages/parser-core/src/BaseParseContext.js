/**
  * @typedef {Object} BaseParserOption
  * @property {string} unzipPath If specified, unzip to that path.
  * @property {boolean} overwrite If true, overwrite to unzipPath when unzip. (only using if unzipPath specified.)
  *
  * @typedef {Object} BaseParserOptionType
  * @property {string} unzipPath
  * @property {string} overwrite
* /

/**
 * @class
 */
class BaseParseContext {
    /**
     * @public
     * @type {BaseParserOption}
     */
    options;

    /**
     * @public
     * @type {import('./readEntries').ReadEntriesReturnType>}
     */
    entries;

    /**
     * @typedef {Object<string, import('./BaseBook').default>} RawBookObject
     */
    /**
     * @public
     * @type {RawBookObject}
     */
    rawBook;

    constructor() {
      this.options = undefined;
      this.entries = undefined;
      this.rawBook = undefined;
    }
}
export default BaseParseContext;
