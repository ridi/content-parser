export default ComicBook;
declare class ComicBook extends BaseBook {
    constructor(rawBook?: {});
    /**
     * @type {ComicItem[]}
     */
    items: ComicItem[];
}
import { BaseBook } from "@ridi/parser-core";
import ComicItem from "./ComicItem";
