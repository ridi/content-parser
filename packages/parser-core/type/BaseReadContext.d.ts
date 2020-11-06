export default BaseReadContext;
export type BaseReadOption = {
    force: boolean;
};
export type BaseReadOptionType = {
    /**
     * /
     *
     * /**
     */
    force: string;
};
/**
  * @typedef {Object} BaseReadOption
  * @property {boolean} force
  *
  * @typedef {Object} BaseReadOptionType
  * @property {string} force
* /

/**
 * @class
 */
declare abstract class BaseReadContext {
    /**
     * @public
     * @type {BaseReadOption}
     */
    public options: BaseReadOption;
    /**
     * @public
     * @type {import('./readEntries').ReadEntriesReturnType>}
     */
    public entries: import('./readEntries').ReadEntriesReturnType;
    /**
     * @public
     * @type {Array<BaseBook>}
     */
    public items: Array<BaseBook>;
}
import BaseBook from "./BaseBook";
