export default EpubParseContext;
declare class EpubParseContext extends BaseParseContext {
    /**
     * @type {string}
     */
    opfPath: string;
    /**
     * @type {string}
     */
    basePath: string;
    /**
     * @type {boolean}
     */
    foundCover: boolean;
}
import { BaseParseContext } from "@ridi/parser-core";
