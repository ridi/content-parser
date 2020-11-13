export default ImageItem;
export type ImageItemExtra = {
    isCover?: boolean;
};
export type ImageItemParam = import("@ridi/parser-core/type/BaseItem").BaseItemParam & import("./BaseEpubItem").BaseEpubItemExtra & ImageItemExtra;
/**
 * @typedef {Object} ImageItemExtra
 * @property {boolean} [isCover]
 *
 * @typedef {import('./BaseEpubItem').BaseEpubItemParam & ImageItemExtra} ImageItemParam
 */
declare class ImageItem extends BaseEpubItem {
    /**
     *
     * @param {ImageItemParam} rawObj
     * @param {boolean} freeze
     */
    constructor(rawObj?: ImageItemParam, freeze?: boolean);
    /**
     * @type {boolean}
     */
    isCover: boolean;
}
import BaseEpubItem from "./BaseEpubItem";
