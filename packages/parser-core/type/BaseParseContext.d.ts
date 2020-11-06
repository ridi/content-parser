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
export type ParserOptionType = {
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
  * @typedef {Object} ParserOptionType
  * @property {string} unzipPath
  * @property {string} overwrite
* /

/**
 * @class
 */
declare abstract class BaseParseContext {
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
     * @typedef {Object<string, BaseBook>} RawBookObject
     */
    /**
     * @public
     * @type {RawBookObject}
     */
    public rawBook: {
        [x: string]: BaseBook;
    };
}
import BaseBook from "./BaseBook";
