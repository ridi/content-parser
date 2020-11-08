export default ComicItem;
export type ComicItemProperties = {
    index?: number;
    path?: string;
    width?: number;
    height?: number;
};
/**
 * @typedef {Object} ComicItemProperties
 * @property {number} [index]
 * @property {string} [path]
 * @property {number} [width]
 * @property {number} [height]
 */
declare class ComicItem extends BaseItem {
    /**
     *
     * @param {ComicItemProperties} rawObj
     * @param {boolean} freeze
     */
    constructor(rawObj?: ComicItemProperties, freeze?: boolean);
    /**
     * @type {number}
     */
    index: number;
    /**
     * @type {string}
     */
    path: string;
    /**
     * @type {number}
     */
    width: number;
    /**
       * @type {number}
     */
    height: number;
    /**
     * @return {string}
     */
    get mimeType(): string;
}
import { BaseItem } from "@ridi/parser-core";
