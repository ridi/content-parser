export default NcxItem;
export type NcxItemExtra = {
    navPoints: NavPoint;
};
export type NcxItemParam = import("@ridi/parser-core/type/BaseItem").BaseItemParam & import("./BaseEpubItem").BaseEpubItemExtra & NcxItemExtra;
/**
 * @typedef {Object} NcxItemExtra
 * @property {NavPoint} navPoints
 *
 * @typedef {import('./BaseEpubItem').BaseEpubItemParam & NcxItemExtra} NcxItemParam
 */
declare class NcxItem extends BaseEpubItem {
    /**
     *
     * @param {NcxItemParam} rawObj
     * @param {boolean} freeze
     */
    constructor(rawObj?: NcxItemParam, freeze?: boolean);
    /**
     * @type {NavPoint[]}
     */
    navPoints: NavPoint[];
}
import NavPoint from "./NavPoint";
import BaseEpubItem from "./BaseEpubItem";
