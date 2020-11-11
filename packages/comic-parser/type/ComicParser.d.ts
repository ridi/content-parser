export default ComicParser;
declare class ComicParser extends Parser {
    /**
     * Get default values of parse options
     */
    static get parseDefaultOptions(): {
        ext: string[];
        parseImageSize: boolean;
        unzipPath: string;
        overwrite: boolean;
    };
    /**
     * Get types of parse options
     */
    static get parseOptionTypes(): {
        ext: string;
        parseImageSize: string;
        unzipPath: string;
        overwrite: string;
    };
    /**
     * @typedef {Object} ComicReadOptionExtra
     * @property {boolean} base64
     *
     * @typedef {import('@ridi/parser-core/type/BaseReadContext').BaseReadOption & ComicReadOptionExtra} ComicReadOption
     */
    /**
     * Get default values of read options
     * @returns {ComicReadOption}
     */
    static get readDefaultOptions(): import("@ridi/parser-core/type/BaseReadContext").BaseReadOption & {
        base64: boolean;
    };
    /**
     * @typedef {Object} ComicReadOptionTypeExtra
     * @property {string} base64
     *
     * @typedef {import('@ridi/parser-core/type/BaseReadContext').BaseReadOptionType
     * & ComicReadOptionTypeExtra} ComicReadOptionType
     */
    /**
     * Get types of read option
     * @returns {ComicReadOptionType}
     */
    static get readOptionTypes(): import("@ridi/parser-core/type/BaseReadContext").BaseReadOptionType & {
        base64: string;
    };
    /**
     * Create new ComicParser
     * @param {string} input file or directory
     * @param {import('@ridi/parser-core').CryptoProvider} cryptoProvider en/decrypto provider
     * @param {import('@ridi/parser-core').LogLevel} logLevel logging level
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.EINVAL} invalid input
     * @example new ComicParser('./foo/bar.zip' or './foo/bar');
     */
    constructor(input: string, cryptoProvider: import('@ridi/parser-core').CryptoProvider, logLevel: import('@ridi/parser-core').LogLevel);
    /**
     * extracts only necessary metadata from entries and create item list
     * @param {ComicReadContext} context intermediate result
     * @returns {Promise<ComicReadContext>} return Context containing item list
     * @see ComicParser.parseDefaultOptions.ext
     * @see ComicParser.parseDefaultOptions.parseImageSize
     */
    _parse(context: ComicReadContext): Promise<ComicReadContext>;
    /**
     *
     * @typedef {Object} ImageMetaData
     * @property {number} width
     * @property {number} height
     */
    /**
     * parse image size from entry
     * @param {import('@ridi/parser-core/type/readEntries').EntryBasicInformation} entry image entry
     * @param {ComicParser.parseDefaultOptions} options parse options
     * @returns {Promise<ImageMetaData>} return image size
     */
    _parseImageSize(entry: import('@ridi/parser-core/type/readEntries').EntryBasicInformation, options: {
        ext: string[];
        parseImageSize: boolean;
        unzipPath: string;
        overwrite: boolean;
    }): Promise<{
        width: number;
        height: number;
    }>;
}
import { Parser } from "@ridi/parser-core";
import ComicReadContext from "./model/ComicReadContext";
