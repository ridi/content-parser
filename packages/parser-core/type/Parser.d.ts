export default Parser;
export type BaseParseContext = import("./BaseParseContext").default;
export type BaseParserOption = {
    /**
     * If specified, unzip to that path.
     */
    unzipPath: string;
    /**
     * If true, overwrite to unzipPath when unzip. (only using if unzipPath specified.)
     */
    overwrite: boolean;
};
export type BaseParserOptionType = {
    unzipPath: string;
    /**
     * /
     *
     * /**
     */
    overwrite: string;
};
export type BaseBook = import("./BaseBook").default;
export type BaseItem = import("./BaseItem").default;
export type BaseReadContext = import("./BaseReadContext").default;
export type BaseReadOption = {
    force: boolean;
};
export type BaseReadOptionType = {
    /**
     * /
     *
     * /**
     */
    force: string;
};
export type ParserAction = string;
export type ActionEnum = {
    /**
     * "parse"
     */
    PARSER: ParserAction;
    /**
     * "readItems"
     */
    READ_ITEMS: ParserAction;
    /**
     * "unzip"
     */
    UNZIP: ParserAction;
};
export type OnProgressCallBack = (step: number, totalStep: number, action: string) => void;
export type Task = {
    /**
     * Action executor
     */
    fun: Function;
    /**
     * Action name
     */
    name: string;
};
declare class Parser {
    /**
     * Get default values of parse options
     * @static
     * @return {BaseParserOption}
    */
    static get parseDefaultOptions(): import("./BaseParseContext").BaseParserOption;
    /**
     * Get types of parse options
     * @static
     * @return {BaseParserOptionType}
     */
    static get parseOptionTypes(): import("./BaseParseContext").BaseParserOptionType;
    /**
     * Get default values of read options
     * @static
     * @returns {BaseReadOption}
     */
    static get readDefaultOptions(): import("./BaseReadContext").BaseReadOption;
    /**
     * Get types of read option
     * @static
     * @returns {BaseReadOptionType}
     */
    static get readOptionTypes(): import("./BaseReadContext").BaseReadOptionType;
    /**
     * Create new Parser
     * @param {string} input file or directory
     * @param {CryptoProvider} [cryptoProvider] en/decrypto provider
     * @param {import('./Logger').LoggerOptions} [loggerOptions] logger options
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.EINVAL} invalid input
     * @example
     * class FooParser extends Parser {
     *   ...
     * }
     * new FooParser('./foo/bar.zip' or './foo/bar');
     */
    constructor(input: string, cryptoProvider?: CryptoProvider, loggerOptions?: import('./Logger').LoggerOptions);
    /**
     * Get file or directory
     * @returns {string}
     *
     */
    get input(): string;
    /**
     * Get en/decrypto provider
     * @returns {CryptoProvider}
     */
    get cryptoProvider(): CryptoProvider;
    /**
     * Get logger
     * @returns {Logger}
     */
    get logger(): Logger;
    /**
     * Set callback that tells progress of parse and readItems.
     * @param {OnProgressCallBack} onProgress
     * @example
     * parser.onProgress = (step, totalStep, action) => {
     *   console.log(`[${action}] ${step} / ${totalStep}`);
     * }
     * @see Parser.Action
     */
    set onProgress(arg: (step: number, totalStep: number, action: string) => void);
    /**
     * Get onProgress callback
     * @returns {OnProgressCallBack}
     */
    get onProgress(): (step: number, totalStep: number, action: string) => void;
    /**
     * @virtual
     * @protected
     * @returns {new ()=>BaseParseContext}
     */
    protected _getParseContextClass(): new () => BaseParseContext;
    /**
     * @virtual
     * @protected
     * @returns {new ()=>BaseBook}
     */
    protected _getBookClass(): new () => BaseBook;
    /**
     * @virtual
     * @protected
     * @returns {new ()=>BaseReadContext}
     */
    protected _getReadContextClass(): new () => BaseReadContext;
    /**
     * @virtual
     * @protected
     * @returns {new ()=>BaseItem}
     */
    protected _getReadItemClass(): new () => BaseItem;
    /**
     * @protected
     * @returns {Task[]} return before tasks
     */
    protected _parseBeforeTasks(): Task[];
    /**
     * @protected
     * @returns {Task[]} return tasks
     */
    protected _parseTasks(): Task[];
    /**
     * @protected
     * @returns {Task[]} return after tasks
     */
    protected _parseAfterTasks(): Task[];
    /**
     * Parse the input
     * @async
     * @param {BaseParserOption} [options] parse options
     * @returns {Promise<BaseBook>} return Book
     * @see Parser.parseDefaultOptions
     * @see Parser.parseOptionTypes
    */
    parse(options?: BaseParserOption): Promise<BaseBook>;
    /**
     * Validate parse options and get entries from input
     * @async
     * @param {BaseParserOption} [options] parse options
     * @returns {Promise<BaseParseContext>} return Context containing parse options, entries
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     */
    _prepareParse(options?: BaseParserOption): Promise<BaseParseContext>;
    /**
     * Unzipping if zip source and unzipPath option specified
     * @async
     * @param {BaseParseContext} context intermediate result
     * @returns {Promise<BaseParseContext>} return Context (no change at this step)
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.EEXIST} file or directory already exists
     */
    _unzipIfNeeded(context: BaseParseContext): Promise<BaseParseContext>;
    /**
     * Create new Book from context
     * @protected
     * @param {BaseParseContext} context intermediate result
     * @returns {Promise<BaseBook>} return Book
     */
    protected _createBook(context: BaseParseContext): Promise<BaseBook>;
    /**
     * @protected
     * @returns {Task[]} return before tasks
     */
    protected _readBeforeTasks(): Task[];
    /**
     * @protected
     * @returns {Task[]} return tasks
     */
    protected _readTasks(): Task[];
    /**
     * @protected
     * @returns {Task[]} return after tasks
     */
    protected _readAfterTasks(): Task[];
    /**
     * Reading contents of Item
     * @param {BaseItem} item target
     * @param {BaseReadOption} [options] read options
     * @returns {(string|Buffer)} reading result
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    readItem(item: BaseItem, options?: BaseReadOption): (string | Buffer);
    /**
     * Reading contents of Items
     * @async
     * @param {BaseItem[]} items targets
     * @param {BaseReadOption} [options] read options
     * @returns {(string|Buffer)[]} reading results
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    readItems(items: BaseItem[], options?: BaseReadOption): (string | Buffer)[];
    /**
     * Validate read options and get entries from input
     * @async
     * @param {Item[]} items targets
     * @param {BaseReadOption} [options] read options
     * @returns {Promise<BaseReadContext>} returns Context containing target items, read options, entries
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     */
    _prepareRead(items: any[], options?: BaseReadOption): Promise<BaseReadContext>;
    /**
     * Contents is read using loader suitable for context
     * @async
     * @override
     * @param {ReadContext} context properties required for reading
     * @returns {Promise<Array<string|Buffer>>} reading results
     * @throws {Errors.ENOFILE} no such file
     * @see Parser.readDefaultOptions.force
     */
    _read(context: any): Promise<Array<string | Buffer>>;
    /**
     * @private
     * @returns {Task[]} return tasks
     */
    private _unzipTasks;
    /**
     * Unzip
     * @async
     * @param {string} unzipPath
     * @param {boolean} overwrite
     * @returns {Promise<boolean>} success
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     */
    unzip(unzipPath: string, overwrite?: boolean): Promise<boolean>;
}
declare namespace Parser {
    export { Action };
}
import CryptoProvider from "./CryptoProvider";
import Logger from "./Logger";
/**
 * @typedef {import('./BaseParseContext').default} BaseParseContext
 * @typedef {import('./BaseParseContext').BaseParserOption} BaseParserOption
 * @typedef {import('./BaseParseContext').BaseParserOptionType} BaseParserOptionType
 * @typedef {import('./BaseBook').default} BaseBook
 * @typedef {import('./BaseItem').default} BaseItem
 * @typedef {import('./BaseReadContext').default} BaseReadContext
 * @typedef {import('./BaseReadContext').BaseReadOption} BaseReadOption
 * @typedef {import('./BaseReadContext').BaseReadOptionType} BaseReadOptionType
 */
/**
 * @typedef {string} ParserAction
 *
 * @typedef {Object} ActionEnum
 * @property {ParserAction} PARSER "parse"
 * @property {ParserAction} READ_ITEMS "readItems"
 * @property {ParserAction} UNZIP "unzip"
 */
/**
 * @readonly
 * @type {ActionEnum}
 */
declare const Action: ActionEnum;
