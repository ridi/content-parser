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
     * Get default values of read options
     */
    static get readDefaultOptions(): {
        base64: boolean;
        force: boolean;
    };
    /**
     * Get types of read option
     */
    static get readOptionTypes(): {
        base64: string;
        force: string;
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
