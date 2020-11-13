export default BaseItem;
export type BaseItemParam = {
    size: number;
};
/**
 * @typedef {Object} BaseItemParam
 * @property {number} size
*/
declare class BaseItem {
    /**
     * @param {BaseItemParam} rawObj
     */
    constructor(rawObj: BaseItemParam);
    /**
     * @public
     * @type {number}
     */
    public size: number;
    /**
     * @public
     * @virtual
     * @returns {string}
     */
    public toRaw(): string;
}
