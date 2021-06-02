import fs from 'fs';

import { removeCacheFile } from './cacheFile';
import CryptoProvider from './CryptoProvider';
import Errors, { createError, mustOverride } from './errors';
import Logger from './Logger';
import mergeObjects from './mergeObjects';
import readEntries from './readEntries';
import {
  isArray,
  isExists,
  isFunc,
  isString,
} from './typecheck';
import validateOptions from './validateOptions';

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
const Action = Object.freeze({
  PARSE: 'parse',
  READ_ITEMS: 'readItems',
  UNZIP: 'unzip',
});

/**
  * @typedef {(step:number, totalStep:number, action:string)=>void} OnProgressCallBack
  *
  * @typedef {Object} Task
  * @property {Function} fun Action executor
  * @property {string} name Action name
*/

const privateProps = new WeakMap();

class Parser {
  /**
   * Get default values of parse options
   * @static
   * @return {BaseParserOption}
  */
  static get parseDefaultOptions() {
    return {
      unzipPath: undefined,
      overwrite: true,
    };
  }

  /**
   * Get types of parse options
   * @static
   * @return {BaseParserOptionType}
   */
  static get parseOptionTypes() {
    return {
      unzipPath: 'String|Undefined',
      overwrite: 'Boolean',
    };
  }

  /**
   * Get default values of read options
   * @static
   * @returns {BaseReadOption | void}
   */
  static get readDefaultOptions() {
    return {
      force: false,
    };
  }

  /**
   * Get types of read option
   * @static
   * @returns {BaseReadOptionType | void}
   */
  static get readOptionTypes() {
    return {
      force: 'Boolean',
    };
  }

  /**
   * Get file or directory
   * @returns {string}
   *
   */
  get input() { return privateProps.get(this).input; }

  /**
   * Get en/decrypto provider
   * @returns {CryptoProvider}
   */
  get cryptoProvider() { return privateProps.get(this).cryptoProvider; }

  /**
   * Get logger
   * @returns {Logger}
   */
  get logger() { return privateProps.get(this).logger; }

  /**
   * Get onProgress callback
   * @returns {OnProgressCallBack}
   */
  get onProgress() { return privateProps.get(this).onProgress || (() => { }); }

  /**
   * Set callback that tells progress of parse and readItems.
   * @param {OnProgressCallBack} onProgress
   * @example
   * parser.onProgress = (step, totalStep, action) => {
   *   console.log(`[${action}] ${step} / ${totalStep}`);
   * }
   * @see Parser.Action
   */
  set onProgress(onProgress) {
    if (!isFunc(onProgress)) {
      throw createError(Errors.EINVAL, 'onProgress', 'reason', 'must be function type');
    }
    privateProps.set(this, { ...privateProps.get(this), onProgress });
  }

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
  constructor(input, cryptoProvider, loggerOptions = {}) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw createError(Errors.ENOENT, input);
      }
      removeCacheFile(input);
    } else {
      throw createError(Errors.EINVAL, 'input', 'reason', 'must be String type');
    }
    if (isExists(cryptoProvider) && !(cryptoProvider instanceof CryptoProvider)) {
      throw createError(Errors.EINVAL, 'cryptoProvider', 'reason', 'must be CryptoProvider subclassing type');
    }
    const { namespace, logLevel } = loggerOptions;
    const logger = new Logger(namespace || Parser.name, logLevel);
    logger.debug(`Create new parser with input: '${input}', cryptoProvider: ${isExists(cryptoProvider) ? 'Y' : 'N'}.`);
    privateProps.set(this, { input, cryptoProvider, logger });
  }

  /**
   * @virtual
   * @protected
   * @returns {new ()=>BaseParseContext}
   */
  _getParseContextClass() {
    return mustOverride();
  }

  /**
   * @virtual
   * @protected
   * @returns {new ()=>BaseBook}
   */
  _getBookClass() {
    return mustOverride();
  }

  /**
   * @virtual
   * @protected
   * @returns {new ()=>BaseReadContext}
   */
  _getReadContextClass() {
    mustOverride();
  }

  /**
   * @virtual
   * @protected
   * @returns {new ()=>BaseItem}
   */
  _getReadItemClass() {
    mustOverride();
  }

  /**
   * @protected
   * @returns {Task[]} return before tasks
   */
  _parseBeforeTasks() {
    return [
      { fun: this._prepareParse, name: 'prepareParse' },
      { fun: this._unzipIfNeeded, name: 'unzipIfNeeded' },
    ];
  }

  /**
   * @protected
   * @returns {Task[]} return tasks
   */
  _parseTasks() {
    return [];
  }

  /**
   * @protected
   * @returns {Task[]} return after tasks
   */
  _parseAfterTasks() {
    return [
      { fun: this._createBook, name: 'createBook' },
    ];
  }

  /**
   * Parse the input
   * @async
   * @param {BaseParserOption} [options] parse options
   * @returns {Promise<BaseBook>} return Book
   * @see Parser.parseDefaultOptions
   * @see Parser.parseOptionTypes
  */
  async parse(options = {}) {
    const action = Action.PARSE;
    const tasks = [].concat(
      this._parseBeforeTasks(),
      this._parseTasks(),
      this._parseAfterTasks(),
    );
    let context = options;
    this.onProgress(0, tasks.length, action);
    await tasks.reduce((prevPromise, task, index) => {
      const result = prevPromise.then(async () => {
        const { fun, name } = task;
        const message = `${action} - ${name}`;
        context = await this.logger.measure(fun, this, [context], message);
      });
      this.onProgress(index + 1, tasks.length, action);
      return result;
    }, Promise.resolve());
    this.logger.result(action);
    return context;
  }

  /**
   * Validate parse options and get entries from input
   * @async
   * @param {BaseParserOption} [options] parse options
   * @returns {Promise<BaseParseContext>} return Context containing parse options, entries
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   */
  async _prepareParse(options = {}) {
    const { parseOptionTypes, parseDefaultOptions } = this.constructor;
    validateOptions(options, parseOptionTypes);
    const ParseContext = this._getParseContextClass();
    const context = new ParseContext();
    context.options = mergeObjects(parseDefaultOptions, options);
    context.entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    this.logger.debug(`Ready to parse with options: ${JSON.stringify(context.options)}.`);
    return context;
  }

  /**
   * Unzipping if zip source and unzipPath option specified
   * @async
   * @param {BaseParseContext} context intermediate result
   * @returns {Promise<BaseParseContext>} return Context (no change at this step)
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EEXIST} file or directory already exists
   */
  async _unzipIfNeeded(context) {
    const { options, entries } = context;
    const { unzipPath, overwrite } = options;
    if (!isString(entries.source) && isExists(unzipPath)) {
      await entries.source.extractAll(unzipPath, overwrite);
      privateProps.set(this, { ...privateProps.get(this), input: unzipPath });
      removeCacheFile(this.input);
      context.entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    }
    return context;
  }

  /**
   * Create new Book from context
   * @protected
   * @param {BaseParseContext} context intermediate result
   * @returns {Promise<BaseBook>} return Book
   */
  _createBook(context) {
    return new Promise(resolve => {
      const Book = this._getBookClass();
      resolve(new Book(context.rawBook));
    });
  }

  /**
   * @protected
   * @returns {Task[]} return before tasks
   */
  _readBeforeTasks() {
    return [
      { fun: this._prepareRead, name: 'prepareRead' },
    ];
  }

  /**
   * @protected
   * @returns {Task[]} return tasks
   */
  _readTasks() {
    return [
      { fun: this._read, name: 'read' },
    ];
  }

  /**
   * @protected
   * @returns {Task[]} return after tasks
   */
  _readAfterTasks() {
    return [];
  }

  /**
   * Reading contents of Item
   * @param {BaseItem} item target
   * @param {BaseReadOption} [options] read options
   * @returns {(string|Buffer)} reading result
   * @see Parser.readDefaultOptions
   * @see Parser.readOptionTypes
   */
  async readItem(item, options = {}) {
    const results = await this.readItems([item], options);
    return results[0];
  }

  /**
   * Reading contents of Items
   * @async
   * @param {BaseItem[]} items targets
   * @param {BaseReadOption} [options] read options
   * @returns {(string|Buffer)[]} reading results
   * @see Parser.readDefaultOptions
   * @see Parser.readOptionTypes
   */
  async readItems(items, options = {}) {
    const action = Action.READ_ITEMS;
    const tasks = [].concat(
      this._readBeforeTasks(),
      this._readTasks(),
      this._readAfterTasks(),
    );
    let context = [items, options];
    this.onProgress(0, tasks.length, action);
    await tasks.reduce((prevPromise, task, index) => {
      const result = prevPromise.then(async () => {
        const { fun, name } = task;
        const message = `${action}(${items.length}) - ${name}`;
        context = await this.logger.measure(fun, this, isArray(context) ? context : [context], message);
      });
      this.onProgress(index + 1, tasks.length, action);
      return result;
    }, Promise.resolve());
    this.logger.result(`${action}(${items.length})`);
    return context;
  }

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
  async _prepareRead(items, options = {}) {
    if (!options.force && items.find(item => !(item instanceof this._getReadItemClass()))) {
      throw createError(Errors.EINVAL, 'item', 'reason', 'must be Parser._getReadItemClass type');
    }
    const { readOptionTypes, readDefaultOptions } = this.constructor;
    validateOptions(options, readOptionTypes);
    const entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    const ReadContext = this._getReadContextClass();
    const context = new ReadContext();
    context.items = items;
    context.entries = entries;
    context.options = mergeObjects(readDefaultOptions, options);
    this.logger.debug(`Ready to read with options: ${JSON.stringify(context.options)}.`);
    return context;
  }

  /**
   * Contents is read using loader suitable for context
   * @async
   * @override
   * @param {ReadContext} context properties required for reading
   * @returns {Promise<Array<string|Buffer>>} reading results
   * @throws {Errors.ENOFILE} no such file
   * @see Parser.readDefaultOptions.force
   */
  // eslint-disable-next-line no-unused-vars
  async _read(context) {
    return mustOverride();
  }

  /**
   * @private
   * @returns {Task[]} return tasks
   */
  _unzipTasks() {
    return [
      { fun: this._prepareParse, name: 'prepareParse' },
      { fun: this._unzipIfNeeded, name: 'unzipIfNeeded' },
    ];
  }

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
  async unzip(unzipPath, overwrite = true) {
    const action = Action.UNZIP;
    const tasks = this._unzipTasks();
    let context = { unzipPath, overwrite };
    this.onProgress(0, tasks.length, action);
    await tasks.reduce((prevPromise, task, index) => {
      const result = prevPromise.then(async () => {
        const { fun, name } = task;
        const message = `${action} - ${name}`;
        context = await this.logger.measure(fun, this, [context], message);
      });
      this.onProgress(index + 1, tasks.length, action);
      return result;
    }, Promise.resolve());
    this.logger.result(action);
    return isString(this.input);
  }
}

Parser.Action = Action;

export default Parser;
