export default Meta;
export type MetaParam = {
    name?: string;
    content?: string;
};
/**
 * @typedef {Object} MetaParam
 * @property {string} [name]
 * @property {string} [content]
 */
declare class Meta {
    /**
     * @param {MetaParam} rawObj
     */
    constructor(rawObj?: MetaParam);
    /**
     * @type {string}
     */
    name: string;
    /**
     * @type {string}
     */
    content: string;
    toRaw(): {
        name: string;
        content: string;
    };
}
