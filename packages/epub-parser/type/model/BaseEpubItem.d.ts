export default BaseEpubItem;
export type BaseEpubItemExtra = {
    id?: string;
    href?: string;
    mediaType?: string;
};
export type BaseEpubItemParam = import("@ridi/parser-core/type/BaseItem").BaseItemParam & BaseEpubItemExtra;
/**
 * @typedef {Object} BaseEpubItemExtra
 * @property {string} [id]
 * @property {string} [href]
 * @property {string} [mediaType]
 *
 * @typedef {import('@ridi/parser-core/type/BaseItem').BaseItemParam & BaseEpubItemExtra} BaseEpubItemParam
*/
declare class BaseEpubItem extends BaseItem {
    /**
     *
     * @param {BaseEpubItemParam} rawObj
     * @param {boolean} freeze
    */
    constructor(rawObj?: BaseEpubItemParam, freeze?: boolean);
    /**
     * @returns {boolean}
    */
    get isFileExists(): boolean;
    /**
     * @abstract
    */
    get defaultEncoding(): any;
    /**
     * @type {string}
    */
    id: string;
    /**
     * @type {string}
    */
    href: string;
    /**
     * @type {string}
    */
    mediaType: string;
}
import { BaseItem } from "@ridi/parser-core";
