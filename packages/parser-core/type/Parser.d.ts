export default Parser;
declare class Parser {
    /**
     * Get default values of parse options
     */
    static get parseDefaultOptions(): {
        unzipPath: any;
        overwrite: boolean;
    };
    /**
     * Get types of parse options
     */
    static get parseOptionTypes(): {
        unzipPath: string;
        overwrite: string;
    };
    /**
     * Get default values of read options
     */
    static get readDefaultOptions(): {
        force: boolean;
    };
    /**
     * Get types of read option
     */
    static get readOptionTypes(): {
        force: string;
    };
    /**
     * Create new Parser
     * @param {string} input file or directory
     * @param {?CryptoProvider} cryptoProvider en/decrypto provider
     * @param {?object} loggerOptions logger options
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.EINVAL} invalid input
     * @example
     * class FooParser extends Parser {
     *   ...
     * }
     * new FooParser('./foo/bar.zip' or './foo/bar');
     */
    constructor(input: string, cryptoProvider: CryptoProvider | null, loggerOptions?: object | null);
    /**
     * Get file or directory
     */
    get input(): any;
    /**
     * Get en/decrypto provider
     */
    get cryptoProvider(): any;
    /**
     * Get logger
     */
    get logger(): any;
    /**
     * Set callback that tells progress of parse and readItems.
     * @param {function} onProgress
     * @example
     * parser.onProgress = (step, totalStep, action) => {
     *   console.log(`[${action}] ${step} / ${totalStep}`);
     * }
     * @see Parser.Action
     */
    set onProgress(arg: Function);
    /**
     * Get onProgress callback
     */
    get onProgress(): Function;
    /**
     * @returns {ParseContext}
     */
    _getParseContextClass(): any;
    /**
     * @returns {Book}
     */
    _getBookClass(): any;
    /**
     * @returns {ReadContext}
     */
    _getReadContextClass(): any;
    /**
     * @returns {Item}
     */
    _getReadItemClass(): any;
    /**
     * @typedef ParseTask
     * @property {function} fun Action executor
     * @property {string} name Action name
     */
    /**
     * @returns {ParseTask[]} return before tasks
     */
    _parseBeforeTasks(): {
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
     * @returns {ParseTask[]} return tasks
     */
    _parseTasks(): {
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
     * @returns {ParseTask[]} return after tasks
     */
    _parseAfterTasks(): {
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
     * Parsing
     * @param {?object} options parse options
     * @returns {Promise.<Book>} return Book
     * @see Parser.parseDefaultOptions
     * @see Parser.parseOptionTypes
     */
    parse(options?: object | null): Promise<any>;
    /**
     * Validate parse options and get entries from input
     * @param {?object} options parse options
     * @returns {Promise.<ParseContext>} return Context containing parse options, entries
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     * @see Parser.parseDefaultOptions
     * @see Parser.parseOptionTypes
     */
    _prepareParse(options?: object | null): Promise<any>;
    /**
     * Unzipping if zip source and unzipPath option specified
     * @param {ParseContext} context intermediate result
     * @returns {Promise.<ParseContext>} return Context (no change at this step)
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.EEXIST} file or directory already exists
     * @see Parser.parseDefaultOptions.unzipPath
     * @see Parser.parseDefaultOptions.overwrite
     */
    _unzipIfNeeded(context: any): Promise<any>;
    /**
     * Create new Book from context
     * @param {ParseContext} context intermediate result
     * @returns {Promise.<Book>} return Book
     */
    _createBook(context: any): Promise<any>;
    /**
     * @typedef ReadTask
     * @property {function} fun Action executor
     * @property {string} name Action name
     */
    /**
     * @returns {ReadTask[]} return before tasks
     */
    _readBeforeTasks(): {
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
     * @returns {ReadTask[]} return tasks
     */
    _readTasks(): {
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
     * @returns {ReadTask[]} return after tasks
     */
    _readAfterTasks(): {
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
     * @param {?object} options read options
     * @returns {(string|Buffer)} reading result
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    readItem(item: any, options?: object | null): (string | Buffer);
    /**
     * Reading contents of Items
     * @param {Item[]} items targets
     * @param {?object} options read options
     * @returns {(string|Buffer)[]} reading results
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    readItems(items: any[], options?: object | null): (string | Buffer)[];
    /**
     * Validate read options and get entries from input
     * @param {Item[]} items targets
     * @param {?object} options read options
     * @returns {Promise.<ReadContext>} returns Context containing target items, read options, entries
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     * @see Parser.readDefaultOptions
     * @see Parser.readOptionTypes
     */
    _prepareRead(items: any[], options?: object | null): Promise<any>;
    /**
     * Contents is read using loader suitable for context
     * @param {ReadContext} context properties required for reading
     * @returns {(string|Buffer)[]} reading results
     * @throws {Errors.ENOFILE} no such file
     * @see Parser.readDefaultOptions.force
     */
    _read(context: any): (string | Buffer)[];
    /**
     * @typedef UnzipTask
     * @property {function} fun Action executor
     * @property {string} name Action name
     */
    /**
     * @returns {UnzipTask[]} return tasks
     */
    _unzipTasks(): {
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
     * @param {string} unzipPath
     * @param {boolean} overwrite
     * @returns {boolean} success
     * @throws {Errors.EINVAL} invalid options or value type
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.ENOFILE} no such file
     */
    unzip(unzipPath: string, overwrite?: boolean): boolean;
}
declare namespace Parser {
    export { Action };
}
import CryptoProvider from "./CryptoProvider";
declare const Action: Readonly<{
    PARSE: string;
    READ_ITEMS: string;
    UNZIP: string;
}>;
