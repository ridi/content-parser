export default BaseParseContext;
export type BaseParserOption = {
    /**
     * If specified, unzip to that path.
     */
    unzipPath: string;
    /**
     * If true, overwrite to unzipPath when unzip. (only using if unzipPath specified.)
     */
    overwrite: boolean;
};
export type BaseParserOptionType = {
    unzipPath: string;
    /**
     * /
     *
     * /**
     */
    overwrite: string;
};
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
declare class BaseParseContext {
    /**
     * @public
     * @type {BaseParserOption}
     */
    public options: BaseParserOption;
    /**
     * @public
     * @type {import('./readEntries').ReadEntriesReturnType>}
     */
    public entries: import('./readEntries').ReadEntriesReturnType;
    /**
     * @typedef {Object<string, import('./BaseBook').default>} RawBookObject
     */
    /**
     * @public
     * @type {RawBookObject}
     */
    public rawBook: {
        [x: string]: import("./BaseBook").default;
    };
}
