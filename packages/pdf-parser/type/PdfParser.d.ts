export default PdfParser;
declare class PdfParser extends Parser {
    /**
     * Get default values of parse options
     */
    static get parseDefaultOptions(): {
        fakeWorker: boolean;
        unzipPath: string;
        overwrite: boolean;
    };
    /**
     * Get types of parse options
     */
    static get parseOptionTypes(): {
        fakeWorker: string;
        unzipPath: string;
        overwrite: string;
    };
    static get readDefaultOptions(): void;
    static get readOptionTypes(): void;
    /**
     * Create new PdfParser
     * @param {string} input file
     * @param {import('@ridi/parser-core/type/CryptoProvider').default} [cryptoProvider] en/decrypto provider
     * @param {string} [logLevel] logging level
     * @throws {Errors.ENOENT} no such file
     * @throws {Errors.EINVAL} invalid input
     * @example new PdfParser('./foo/bar.pdf');
     */
    constructor(input: string, cryptoProvider?: import('@ridi/parser-core/type/CryptoProvider').default, logLevel?: string);
    /**
     * @param {object} that
     * @param {function} fun
     * @param {*[]} args
     * @returns {*}
     */
    _execute(that: object, fun: Function, args?: any[]): any;
    /**
     * @typedef {import('@ridi/parser-core/type/Parser').BaseReadContext} BaseReadContext
     */
    /**
     * load pdf document and get number of pages
     * @param {BaseReadContext} context intermediate result
     * @returns {Promise<BaseReadContext>} return Context containing document and page count
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _loadDocuemnt(context: import("@ridi/parser-core/type/BaseReadContext").default): Promise<import("@ridi/parser-core/type/BaseReadContext").default>;
    /**
     * Metadata parsing in Document
     * @param {PdfParseContext} context intermediate result
     * @returns {Promise<PdfParseContext>} return Context containing metadata
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _parseMetadata(context: PdfParseContext): Promise<PdfParseContext>;
    /**
     * Outline parsing in Document
     * @param {PdfParseContext} context intermediate result
     * @returns {Promise<PdfParseContext>} return Context containing outline
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _parseOutline(context: PdfParseContext): Promise<PdfParseContext>;
    /**
     * Permission parsing in Document
     * @param {PdfParseContext} context intermediate result
     * @returns {Promise<PdfParseContext>} return Context containing permissions
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _parsePermission(context: PdfParseContext): Promise<PdfParseContext>;
    /**
     * Destory fake worker.
     * @param {PdfParseContext} context intermediate result
     * @returns {Promise<PdfParseContext>} return Context containing permissions
     */
    _destoryWorkerIfNeeded(context: PdfParseContext): Promise<PdfParseContext>;
    /**
     * Returns PDF file as Buffer
     * @returns {Buffer}
     */
    read(): Buffer;
}
import { Parser } from "@ridi/parser-core";
import PdfParseContext from "./model/PdfParseContext";
