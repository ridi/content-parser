import fs from "fs";

import { removeCacheFile } from "./cacheFile";
import CryptoProvider from "./CryptoProvider";
import Errors, { createError, mustOverride } from "./errors";
import Logger, { LoggerOptions } from "./Logger";
import mergeObjects from "./mergeObjects";
import readEntries from "./readEntries";
import { isArray, isExists, isFunc, isString } from "./typecheck";
import validateOptions from "./validateOptions";
import BaseParseContext, {
  BaseParserOption,
  BaseParserOptionType,
} from "./BaseParseContext";
import BaseBook from "./BaseBook";
import BaseItem from "./BaseItem";
import BaseReadContext, {
  BaseReadOption,
  BaseReadOptionType,
} from "./BaseReadContext";

enum Action {
  PARSE = "parse",
  READ_ITEMS = "readItems",
  UNZIP = "unzip",
}

type OnProgressCallBack = (
  step: number,
  totalStep: number,
  action: string
) => void;

export type Task = {
  fun: (...args: any[]) => any | Promise<any>;
  name: string;
};

const privateProps = new WeakMap<
  Parser,
  {
    input: string;
    cryptoProvider: CryptoProvider;
    logger: Logger;
    onProgress?: OnProgressCallBack;
  }
>();

class Parser {
  static Action = Action;
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions(): BaseParserOption {
    return {
      unzipPath: undefined,
      overwrite: true,
    };
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes(): BaseParserOptionType {
    return {
      unzipPath: "String|Undefined",
      overwrite: "Boolean",
    };
  }

  /**
   * Get default values of read options
   */
  static get readDefaultOptions(): BaseReadOption | undefined {
    return {
      force: false,
    };
  }

  /**
   * Get types of read option
   */
  static get readOptionTypes(): BaseReadOptionType | undefined {
    return {
      force: "Boolean",
    };
  }

  /**
   * Get file or directory
   */
  get input() {
    return privateProps.get(this).input;
  }

  /**
   * Get en/decrypto provider
   */
  get cryptoProvider() {
    return privateProps.get(this).cryptoProvider;
  }

  /**
   * Get logger
   */
  get logger() {
    return privateProps.get(this).logger;
  }

  /**
   * Get onProgress callback
   */
  get onProgress() {
    return privateProps.get(this).onProgress || (() => {});
  }

  /**
   * Set callback that tells progress of parse and readItems.
   * @example
   * parser.onProgress = (step, totalStep, action) => {
   *   console.log(`[${action}] ${step} / ${totalStep}`);
   * }
   * @see Parser.Action
   */
  set onProgress(onProgress: OnProgressCallBack) {
    if (!isFunc(onProgress)) {
      throw createError(
        Errors.EINVAL,
        "onProgress",
        "reason",
        "must be function type"
      );
    }
    privateProps.set(this, { ...privateProps.get(this), onProgress });
  }

  /**
   * Create new Parser
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EINVAL} invalid input
   * @example
   * class FooParser extends Parser {
   *   ...
   * }
   * new FooParser('./foo/bar.zip' or './foo/bar');
   */
  constructor(
    input: string,
    cryptoProvider?: CryptoProvider,
    loggerOptions: Partial<LoggerOptions> = {}
  ) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw createError(Errors.ENOENT, input);
      }
      removeCacheFile(input);
    } else {
      throw createError(
        Errors.EINVAL,
        "input",
        "reason",
        "must be String type"
      );
    }
    if (
      isExists(cryptoProvider) &&
      !(cryptoProvider instanceof CryptoProvider)
    ) {
      throw createError(
        Errors.EINVAL,
        "cryptoProvider",
        "reason",
        "must be CryptoProvider subclassing type"
      );
    }
    const { namespace, logLevel } = loggerOptions;
    const logger = new Logger(namespace || Parser.name, logLevel);
    logger.debug(
      `Create new parser with input: '${input}', cryptoProvider: ${
        isExists(cryptoProvider) ? "Y" : "N"
      }.`
    );
    privateProps.set(this, { input, cryptoProvider, logger });
  }

  protected _getParseContextClass(): typeof BaseParseContext {
    return mustOverride();
  }

  protected _getBookClass(): typeof BaseBook {
    return mustOverride();
  }

  protected _getReadContextClass(): typeof BaseReadContext {
    return mustOverride();
  }

  protected _getReadItemClass(): typeof BaseItem {
    return mustOverride();
  }

  protected _parseBeforeTasks(): Task[] {
    return [
      { fun: this._prepareParse, name: "prepareParse" },
      { fun: this._unzipIfNeeded, name: "unzipIfNeeded" },
    ];
  }

  protected _parseTasks(): Task[] {
    return [];
  }

  protected _parseAfterTasks(): Task[] {
    return [{ fun: this._createBook, name: "createBook" }];
  }

  /**
   * Parse the input
   * @see Parser.parseDefaultOptions
   * @see Parser.parseOptionTypes
   */
  async parse(options: Partial<BaseParserOption> = {}) {
    const action = Action.PARSE;
    const tasks = [].concat(
      this._parseBeforeTasks(),
      this._parseTasks(),
      this._parseAfterTasks()
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
    return context as BaseBook;
  }

  /**
   * Validate parse options and get entries from input
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   */
  async _prepareParse(
    options: Partial<BaseParserOption> = {}
  ): Promise<BaseParseContext> {
    const { parseOptionTypes, parseDefaultOptions } = this
      .constructor as typeof Parser;
    validateOptions(options, parseOptionTypes);
    const ParseContext = this._getParseContextClass();
    const context = new ParseContext();
    context.options = mergeObjects(parseDefaultOptions, options);
    context.entries = await readEntries(
      this.input,
      this.cryptoProvider,
      this.logger
    );
    this.logger.debug(
      `Ready to parse with options: ${JSON.stringify(context.options)}.`
    );
    return context;
  }

  /**
   * Unzipping if zip source and unzipPath option specified
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EEXIST} file or directory already exists
   */
  async _unzipIfNeeded(context: BaseParseContext): Promise<BaseParseContext> {
    const { options, entries } = context;
    const { unzipPath, overwrite } = options;
    if (!isString(entries.source) && isExists(unzipPath)) {
      await entries.source.extractAll(unzipPath, overwrite);
      privateProps.set(this, { ...privateProps.get(this), input: unzipPath });
      removeCacheFile(this.input);
      context.entries = await readEntries(
        this.input,
        this.cryptoProvider,
        this.logger
      );
    }
    return context;
  }

  /**
   * Create new Book from context
   */
  protected _createBook(context: BaseParseContext): Promise<BaseBook> {
    return new Promise<BaseBook>((resolve) => {
      const Book = this._getBookClass();
      // 인터페이스로 수정
      resolve(new (Book as any)(context.rawBook));
    });
  }

  protected _readBeforeTasks(): Task[] {
    return [{ fun: this._prepareRead, name: "prepareRead" }];
  }

  protected _readTasks(): Task[] {
    return [{ fun: this._read, name: "read" }];
  }

  protected _readAfterTasks(): Task[] {
    return [];
  }

  /**
   * Reading contents of Item
   * @see Parser.readDefaultOptions
   * @see Parser.readOptionTypes
   */
  async readItem(
    item: BaseItem,
    options: Partial<BaseReadOption> = {}
  ): Promise<string | Buffer> {
    const results = await this.readItems([item], options);
    return results[0] as string | Buffer;
  }

  /**
   * Reading contents of Items
   * @see Parser.readDefaultOptions
   * @see Parser.readOptionTypes
   */
  async readItems(
    items: BaseItem[],
    options: Partial<BaseReadOption> = {}
  ): Promise<(string | Buffer)[]> {
    const action = Action.READ_ITEMS;
    const tasks = [].concat(
      this._readBeforeTasks(),
      this._readTasks(),
      this._readAfterTasks()
    );
    let context = [items, options];
    this.onProgress(0, tasks.length, action);
    await tasks.reduce((prevPromise, task, index) => {
      const result = prevPromise.then(async () => {
        const { fun, name } = task;
        const message = `${action}(${items.length}) - ${name}`;
        context = await this.logger.measure(
          fun,
          this,
          isArray(context) ? context : [context],
          message
        );
      });
      this.onProgress(index + 1, tasks.length, action);
      return result;
    }, Promise.resolve());
    this.logger.result(`${action}(${items.length})`);
    return context as (string | Buffer)[];
  }

  /**
   * Validate read options and get entries from input
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   */
  async _prepareRead(
    items: BaseItem[],
    options: Partial<BaseReadOption> = {}
  ): Promise<BaseReadContext> {
    if (
      !options.force &&
      items.find((item) => !(item instanceof this._getReadItemClass()))
    ) {
      throw createError(
        Errors.EINVAL,
        "item",
        "reason",
        "must be Parser._getReadItemClass type"
      );
    }
    const { readOptionTypes, readDefaultOptions } = this
      .constructor as typeof Parser;
    validateOptions(options, readOptionTypes);
    const entries = await readEntries(
      this.input,
      this.cryptoProvider,
      this.logger
    );
    const ReadContext = this._getReadContextClass();
    const context = new ReadContext();
    context.items = items;
    context.entries = entries;
    context.options = mergeObjects(readDefaultOptions ?? {}, options);
    this.logger.debug(
      `Ready to read with options: ${JSON.stringify(context.options)}.`
    );
    return context;
  }

  /**
   * Contents is read using loader suitable for context
   * @throws {Errors.ENOFILE} no such file
   * @see Parser.readDefaultOptions.force
   */
  // eslint-disable-next-line no-unused-vars
  async _read(context: BaseReadContext): Promise<Array<string | Buffer>> {
    return mustOverride();
  }

  private _unzipTasks(): Task[] {
    return [
      { fun: this._prepareParse, name: "prepareParse" },
      { fun: this._unzipIfNeeded, name: "unzipIfNeeded" },
    ];
  }

  /**
   * Unzip
   * @returns {Promise<boolean>} success
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   */
  async unzip(unzipPath: string, overwrite = true) {
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

export default Parser;

export { default as CryptoProvider } from "./CryptoProvider";
