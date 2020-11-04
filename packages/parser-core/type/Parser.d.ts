export default Parser;
export type ActionEnum = {
    /**
     * "parse"
     */
    PARSER: string;
    /**
     * "readItems"
     */
    READ_ITEMS: string;
    /**
     * "unzip"
     */
    UNZIP: string;
};
/**
 * *
 */
export type Action = string;
declare class Parser {
    /**
     * @typedef {Object} ParserOption
     * @property {string|undefined} unzipPath If specified, unzip to that path.
     * @property {boolean} overwrite If true, overwrite to unzipPath when unzip. (only using if unzipPath specified.)
      *
      * @typedef {Object} ParserOptionType
      * @property {string} unzipPath
      * @property {string} overwrite
      *
      * @typedef {Object} ReadOption
      * @property {boolean} force If true, ignore any exceptions that occur within parser.
      *
      * @typedef {Object} ReadOptionType
      * @property {string} force
      *
      * @typedef {(step:number, totalStep:number, action:string)=>void} OnProgressCallBack
      *
      * @typedef Task
      * @property {Function} fun Action executor
      * @property {string} name Action name
    */
    /**
     * Get default values of parse options
     * @static
     * @return {ParserOption}
    */
    static get parseDefaultOptions(): {
        /**
         * If specified, unzip to that path.
         */
        unzipPath: string | undefined;
        /**
         * If true, overwrite to unzipPath when unzip. (only using if unzipPath specified.)
         */
        overwrite: boolean;
    };
    /**
     * Get types of parse options
     * @static
     * @return {ParserOptionType}
     */
    static get parseOptionTypes(): {
        unzipPath: string;
        overwrite: string;
    };
    /**
     * Get default values of read options
     * @static
     * @returns {ReadOption}
     */
    static get readDefaultOptions(): {
        /**
         * If true, ignore any exceptions that occur within parser.
         */
        force: boolean;
    };
    /**
     * Get types of read option
     * @static
     * @returns {ReadOptionType}
     */
    static get readOptionTypes(): {
        force: string;
    };
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
     * @typedef {Object} ParseContext
     * @property {ReturnType<readEntries>} entries
     * @property {Object} options
     * @property {Object[]} rawBook
     */
    /**
     * @override
     * @private
     * @returns {ParseContext}
     */
    private _getParseContextClass;
    /**
     * @override
     * @prviate
     * @returns {Book}
     */
    _getBookClass(): any;
    /**
     * @override
     * @private
     * @returns {ReadContext}
     */
    private _getReadContextClass;
    /**
     * @override
     * @private
     * @returns {Item}
     */
    private _getReadItemClass;
    /**
     * @private
     * @returns {Task[]} return before tasks
     */
    private _parseBeforeTasks;
    /**
     * @private
     * @returns {Task[]} return tasks
     */
    private _parseTasks;
    /**
     * @private
     * @returns {Task[]} return after tasks
     */
    private _parseAfterTasks;
    /**
     * Parse the input
     * @async
     * @param {T} [options] parse options
     * @returns {Promise<S>} return Book
     * @see Parser.parseDefaultOptions
     * @see Parser.parseOptionTypes
     * @template T,S
     */
    parse<T, S>(options?: T): Promise<S>;
    /**
     * @typedef {Object} IContextBasic
     * @property {T & S} options
     * @property {ReturnType<readEntries>} entries
     * @template T,S
     */
    /**
     * Validate parse options and get entries from input
     * @async
     * @param {T} [options] parse options
     * @returns {Promise<T & IContextBasic<ParserOption,S>} return Context containing parse options, entries
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     * @see Parser.parseDefaultOptions
     * @see Parser.parseOptionTypes
     * @template T Parser specified context interface
     * @template S Additional Option template
     */
    _prepareParse<T_1, S_1>(options?: T_1): Promise<T_1 & {
        options: {
            /**
             * If specified, unzip to that path.
             */
            unzipPath: string | undefined;
            /**
             * If true, overwrite to unzipPath when unzip. (only using if unzipPath specified.)
             */
            overwrite: boolean;
        } & S_1;
        entries: ReturnType<typeof readEntries>;
    }>;
    /**
     * Unzipping if zip source and unzipPath option specified
     * @async
     * @param {ParseContext} context intermediate result
     * @returns {Promise.<ParseContext>} return Context (no change at this step)
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.EEXIST} file or directory already exists
     * @see Parser.parseDefaultOptions.unzipPath
     * @see Parser.parseDefaultOptions.overwrite
     */
    _unzipIfNeeded(context: {
        entries: ReturnType<typeof readEntries>;
        options: any;
        rawBook: any[];
    }): Promise<{
        entries: ReturnType<typeof readEntries>;
        options: any;
        rawBook: any[];
    }>;
    /**
     * Create new Book from context
     * @protected
     * @param {ParseContext} context intermediate result
     * @returns {Promise<Book>} return Book
     */
    protected _createBook(context: {
        entries: ReturnType<typeof readEntries>;
        options: any;
        rawBook: any[];
    }): Promise<any>;
    /**
     * @protected
     * @returns {Task[]} return before tasks
     */
    protected _readBeforeTasks(): {
        /**
         * Action executor
         */
        fun: Function;
        /**
         * Action name
         */
        name: string;
    }[];
    /**
     * @protected
     * @returns {Task[]} return tasks
     */
    protected _readTasks(): {
        /**
         * Action executor
         */
        fun: Function;
        /**
         * Action name
         */
        name: string;
    }[];
    /**
     * @protected
     * @returns {Task[]} return after tasks
     */
    protected _readAfterTasks(): {
        /**
         * Action executor
         */
        fun: Function;
        /**
         * Action name
         */
        name: string;
    }[];
    /**
     * Reading contents of Item
     * @param {Item} item target
     * @param {object} [options] read options
     * @returns {(string|Buffer)} reading result
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    readItem(item: any, options?: object): (string | Buffer);
    /**
     * Reading contents of Items
     * @async
     * @param {Item[]} items targets
     * @param {Object} [options] read options
     * @returns {(string|Buffer)[]} reading results
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    readItems(items: any[], options?: any): (string | Buffer)[];
    /**
     * Validate read options and get entries from input
     * @async
     * @param {Item[]} items targets
     * @param {Object} [options] read options
     * @returns {Promise<ReadContext>} returns Context containing target items, read options, entries
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    _prepareRead(items: any[], options?: any): Promise<any>;
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
import readEntries from "./readEntries";
/**
 * @typedef {Object} ActionEnum
 * @property {string} PARSER "parse"
 * @property {string} READ_ITEMS "readItems"
 * @property {string} UNZIP "unzip"
 */
/**
 * @readonly
 * @enum {string}
 * @type {ActionEnum}
 */
declare const Action: ActionEnum;
