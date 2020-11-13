export default CssItem;
export type CssItemExtra = {
    namespace?: string;
};
export type CssItemParam = import("@ridi/parser-core/type/BaseItem").BaseItemParam & import("./BaseEpubItem").BaseEpubItemExtra & CssItemExtra;
/**
 * @typedef {Object} CssItemExtra
 * @property {string} [namespace]
 *
 * @typedef {import('./BaseEpubItem').BaseEpubItemParam & CssItemExtra} CssItemParam
 */
declare class CssItem extends BaseEpubItem {
    /**
     *
     * @param {CssItemParam} rawObj
     * @param {boolean} freeze
     */
    constructor(rawObj?: CssItemParam, freeze?: boolean);
    /**
     * @type {string}
     */
    namespace: string;
}
import BaseEpubItem from "./BaseEpubItem";
