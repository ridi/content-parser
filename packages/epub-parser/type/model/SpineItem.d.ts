export default SpineItem;
declare class SpineItem extends BaseEpubItem {
    constructor(rawObj?: {}, freeze?: boolean);
    /**
     * @type{()=>void}
     */
    first: () => void;
    /**
     * @type{()=>void}
     */
    prev: () => void;
    /**
     * @type{()=>void}
     */
    next: () => void;
    /**
     * @type {number}
     */
    index: number;
    /**
     * @type {boolean}
     */
    isLinear: boolean;
    /**
     * @type {stting}
     */
    styles: any;
}
import BaseEpubItem from "./BaseEpubItem";
