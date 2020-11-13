export default InlineCssItem;
export type InlineCssItemExtra = {
    style?: string;
};
export type InlineCssItemParam = import("@ridi/parser-core/type/BaseItem").BaseItemParam & import("./BaseEpubItem").BaseEpubItemExtra & import("./CssItem").CssItemExtra & InlineCssItemExtra;
/**
 * @typedef {Object} InlineCssItemExtra
 * @property {string} [style]
 *
 * @typedef {import('./CssItem').CssItemParam & InlineCssItemExtra} InlineCssItemParam
 */
declare class InlineCssItem extends CssItem {
    /**
     *
     * @param {InlineCssItemParam} rawObj
     * @param {boolean} freeze
     */
    constructor(rawObj?: InlineCssItemParam, freeze?: boolean);
    /**
     * @type {string}
     */
    style: string;
}
import CssItem from "./CssItem";
