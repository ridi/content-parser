export default PdfParser;
declare class PdfParser {
    /**
     * Get default values of parse options
     */
    static get parseDefaultOptions(): {
        fakeWorker: boolean;
    };
    /**
     * Get types of parse options
     */
    static get parseOptionTypes(): {
        fakeWorker: string;
    };
    static get readDefaultOptions(): void;
    static get readOptionTypes(): void;
    /**
     * Create new PdfParser
     * @param {string} input file
     * @param {?CryptoProvider} cryptoProvider en/decrypto provider
     * @param {?string} logLevel logging level
     * @throws {Errors.ENOENT} no such file
     * @throws {Errors.EINVAL} invalid input
     * @example new PdfParser('./foo/bar.pdf');
     */
    constructor(input: string, cryptoProvider: any, logLevel: string | null);
    /**
     * @returns {ParseContext}
     */
    _getParseContextClass(): ParseContext;
    /**
     * @returns {Book}
     */
    _getBookClass(): Book;
    _getReadContextClass(): void;
    _getReadItemClass(): void;
    /**
     * @returns {ParseTask[]} return tasks
     */
    _parseTasks(): any[];
    /**
     * @returns {ParseTask[]} return after tasks
     */
    _parseAfterTasks(): any[];
    /**
     * @param {object} that
     * @param {function} fun
     * @param {*[]} args
     * @returns {*}
     */
    _execute(that: object, fun: Function, args?: any[]): any;
    /**
     * load pdf document and get number of pages
     * @param {ReadContext} context intermediate result
     * @returns {Promise.<ReadContext>} return Context containing document and page count
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _loadDocuemnt(context: any): Promise<any>;
    /**
     * Metadata parsing in Document
     * @param {ParseContext} context intermediate result
     * @returns {Promise.<ParseContext>} return Context containing metadata
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _parseMetadata(context: ParseContext): Promise<ParseContext>;
    /**
     * Outline parsing in Document
     * @param {ParseContext} context intermediate result
     * @returns {Promise.<ParseContext>} return Context containing outline
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _parseOutline(context: ParseContext): Promise<ParseContext>;
    /**
     * Permission parsing in Document
     * @param {ParseContext} context intermediate result
     * @returns {Promise.<ParseContext>} return Context containing permissions
     * @throws {Errors.EPDFJS} pdfjs error
     */
    _parsePermission(context: ParseContext): Promise<ParseContext>;
    /**
     * Destory fake worker.
     * @param {ParseContext} context intermediate result
     * @returns {Promise.<ParseContext>} return Context containing permissions
     */
    _destoryWorkerIfNeeded(context: ParseContext): Promise<ParseContext>;
    /**
     * Returns PDF file as Buffer
     * @returns {Buffer}
     */
    read(): Buffer;
    _read(): void;
    unzip(): void;
}
import ParseContext from "./model/ParseContext";
import Book from "./model/Book";
