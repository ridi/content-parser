export default Color;
export type ColorRawObject = {
    /**
     * 0
     */
    "": number;
};
/**
 * @typedef {Object} ColorRawObject
 * @property {number} 0
 * @property {number} 1
 * @property {number} 2
 */
declare class Color {
    /**
     *
     * @param {ColorRawObject} rawObj
     */
    constructor(rawObj?: ColorRawObject);
    /**
     * @returns {number}
     */
    get intValue(): number;
    /**
     * @returns {string}
     */
    get hexString(): string;
    /**
     * @returns {string}
     */
    get rgbString(): string;
    red: any;
    green: any;
    blue: any;
    /**
     * @returns {ColorRawObject}
     */
    toRaw(): ColorRawObject;
}
