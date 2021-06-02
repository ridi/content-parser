export default DeadItem;
declare class DeadItem extends BaseEpubItem {
    /**
     * @typedef {Object} DeadItemExtra
     * @property {string} [reason]
     * @property {string} [ItemType]
     *
     * @typedef {import('./BaseEpubItem').BaseEpubItemParam & DeadItemExtra} DeadItemParam
     */
    /**
     *
     * @param {DeadItemParam} rawObj
     * @param {boolean} freeze
     */
    constructor(rawObj?: import("@ridi/parser-core/type/BaseItem").BaseItemParam & import("./BaseEpubItem").BaseEpubItemExtra & {
        reason?: string;
        ItemType?: string;
    }, freeze?: boolean);
    /**
     * @type {string}
     */
    reason: string;
    /**
     * @type {string}
     */
    ItemType: string;
}
declare namespace DeadItem {
    export { Reason };
}
import BaseEpubItem from "./BaseEpubItem";
declare const Reason: Readonly<{
    UNDEFINED: string;
    UNKNOWN: string;
    NOT_EXISTS: string;
    NOT_SPINE: string;
    NOT_NCX: string;
    NOT_SUPPORT_TYPE: string;
}>;
