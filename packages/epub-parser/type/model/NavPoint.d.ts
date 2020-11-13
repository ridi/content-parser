export default NavPoint;
export type NavPointParam = {
    id: string;
    navLabel: {
        text: string;
    };
    content: {
        src: string;
    };
    depth: number;
    children: NavPoint;
    spine: string;
};
/**
 * @typedef {Object} NavPointParam
 * @property {string} id
 * @property {{text:string}} navLabel
 * @property {{src: string}} content
 * @property {number} depth
 * @property {NavPoint} children
 * @property {string} spine
 */
declare class NavPoint {
    constructor(rawObj?: {}, freeze?: boolean);
    /**
     * @type {string}
     */
    id: string;
    /**
     * @type {string}
     */
    label: string;
    /**
     * @type {string}
     */
    src: string;
    /**
     * @type {string}
     */
    anchor: string;
    /**
     * @type {number}
     */
    depth: number;
    /**
     * @type {NavPoint}
     */
    children: NavPoint;
    /**
     * @type {string}
     */
    spine: string;
    toRaw(): {
        id: string;
        navLabel: {
            text: string;
        };
        content: {
            src: string;
        };
        children: any;
    };
}
