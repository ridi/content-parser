/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import fs from 'fs';
import validateOptions from './validateOptions';

import { removeCacheFile } from './cacheFile';
import CryptoProvider from './CryptoProvider';
import Errors, { createError } from './errors';
import Logger from './Logger';
import mergeObjects from './mergeObjects';
import type { BaseParserOption } from './BaseParseContext';
import type { BaseReadOption } from './BaseReadContext';
import type { LoggerOption } from './Logger';
import type BaseParseContext from './BaseParseContext';
import type BaseReadContext from './BaseReadContext';

import {
  isArray,
  isExists,
  isFunc,
  isString,
} from './typecheck';

import readEntries from './readEntries';
import type BaseBook from './BaseBook';
import type BaseItem from './BaseItem';
import type { ZipFileInformation } from './zipUtil';

enum Action {
  PARSE = 'parse',
  READ_ITEMS = 'readItems',
  UNZIP = 'unzip',
}

export type TaskFunctions<T extends BaseParseContext<BaseBook>> =
((context: T) => Promise<T>)
| ((options?: BaseParserOption | undefined) => Promise<T>)
| ((context: T) => Promise<BaseBook>)
| ((items: BaseItem[], options?: BaseReadOption | undefined) => Promise<BaseReadContext>)
| ((context: BaseReadContext) => Promise<Array<string | Buffer>>)
| ((context?: BaseReadContext)=> Promise<Array<string | Buffer> | void>);

const privateProps = new WeakMap();
export interface Task<T extends BaseParseContext<BaseBook>>{
  fun: TaskFunctions<T>
  name: string
}
abstract class Parser<T extends BaseParseContext<BaseBook>> {
  static get parseDefaultOptions(): BaseParserOption {
    return {
      unzipPath: undefined,
      overwrite: true,
    };
  }

  static get parseOptionTypes(): { [key in keyof BaseParserOption]: string } {
    return {
      unzipPath: 'String|Undefined',
      overwrite: 'Boolean',
    };
  }

  static get readDefaultOptions(): BaseReadOption {
    return {
      force: false,
    };
  }


  static get readOptionTypes(): { [key in keyof BaseReadOption]: string } {
    return {
      force: 'Boolean',
    };
  }


  get input(): string { return privateProps.get(this).input; }


  get cryptoProvider(): CryptoProvider { return privateProps.get(this).cryptoProvider; }


  get logger(): Logger { return privateProps.get(this).logger; }

  get onProgress(): (step: number, totalStep: number, action: string) => void { return privateProps.get(this).onProgress || (() => { }); }

  /**
   * Set callback that tells progress of parse and readItems.
   * @example
   * parser.onProgress = (step, totalStep, action) => {
   *   console.log(`[${action}] ${step} / ${totalStep}`);
   * }
   */
  set onProgress(onProgress: (step: number, totalStep: number, action: string) => void) {
    if (!isFunc(onProgress)) {
      throw createError(Errors.EINVAL, 'onProgress', 'reason', 'must be function type');
    }
    privateProps.set(this, { ...privateProps.get(this), onProgress });
  }

  /**
   * Create new Parser
   * @example
   * class FooParser extends Parser {
   *   ...
   * }
   * new FooParser('./foo/bar.zip' or './foo/bar');
   */
  constructor(input: string, cryptoProvider?: CryptoProvider, loggerOptions?: LoggerOption) {
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
    const logger = new Logger(loggerOptions?.namespace || Parser.name, loggerOptions?.logLevel);
    logger.debug(`Create new parser with input: '${input}', cryptoProvider: ${isExists(cryptoProvider) ? 'Y' : 'N'}.`);
    privateProps.set(this, { input, cryptoProvider, logger });
  }


  protected abstract getParseContextClass(): T;

  protected abstract getBookClass(): typeof BaseBook;

  protected abstract getReadContextClass(): typeof BaseReadContext | void;

  protected abstract getReadItemClass(): typeof BaseItem | void;

  protected parseBeforeTasks(): Task<T>[] {
    return [
      { fun: this.prepareParse, name: 'prepareParse' },
      { fun: this.unzipIfNeeded, name: 'unzipIfNeeded' },
    ];
  }

  protected parseTasks(): Task<T>[] {
    return [];
  }

  protected parseAfterTasks(): Task<T>[] {
    return [
      { fun: this.createBook, name: 'createBook' },
    ];
  }

  public async parse(options?: BaseParserOption): Promise<BaseBook> {
    const action = Action.PARSE;
    const tasks = [
      ...this.parseBeforeTasks(),
      ...this.parseTasks(),
      ...this.parseAfterTasks(),
    ]
    const context = options;
    this.onProgress(0, tasks.length, action);
    const result: BaseBook = await tasks.reduce<Promise<any>>((prevPromise: Promise<any>, task: Task<T>, index: number) => {
      const newPromise = new Promise<any>(resolve => {
        prevPromise.then(() => {
          const { fun, name } = task;
          const message = `${action} - ${name}`;
          resolve(this.logger.measure<any>(fun, this, [context], message));
        })
      });
      this.onProgress(index + 1, tasks.length, action);
      return newPromise;
    }, Promise.resolve());
    this.logger.result(action);
    return result;
  }

  protected async prepareParse(options?: BaseParserOption): Promise<T> {
    // @ts-ignore
    const { parseOptionTypes, parseDefaultOptions } = this.constructor;
    validateOptions(options, parseOptionTypes);
    const ParseContext = this.getParseContextClass();
    // @ts-ignore
    const context = new ParseContext();
    context.options = mergeObjects(parseDefaultOptions, options);
    context.entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    this.logger.debug(`Ready to parse with options: ${JSON.stringify(context.options)}.`);
    return context;
  }

  /**
   * Unzipping if zip source and unzipPath option specified
   */
  protected async unzipIfNeeded(context: T): Promise<T> {
    const { options, entries } = context;
    if (entries && options?.unzipPath && entries.source && !(entries.source instanceof String)) {
      await (entries.source as ZipFileInformation).extractAll(options.unzipPath, options.overwrite);
      privateProps.set(this, { ...privateProps.get(this), input: options?.unzipPath });
      removeCacheFile(this.input);
      context.entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    }
    return context;
  }

  protected abstract createBook(context: T): Promise<BaseBook>;

  protected readBeforeTasks(): Task<T>[] {
    return [
      { fun: this.prepareRead, name: 'prepareRead' },
    ];
  }

  protected readTasks(): Task<T>[] {
    return [
      { fun: this.read, name: 'read' },
    ];
  }

  protected readAfterTasks(): Task<T>[] {
    return [];
  }

  public async readItem(item: BaseItem, options?: BaseReadOption): Promise<(BaseItem[] | BaseReadOption | undefined)> {
    const results = await this.readItems([item], options);
    return results[0];
  }

  public async readItems(items: BaseItem[], options?: BaseReadOption): Promise<(BaseItem[] | BaseReadOption | undefined)[]> {
    const action = Action.READ_ITEMS;
    const tasks = [
      ...this.readBeforeTasks(),
      ...this.readTasks(),
      ...this.readAfterTasks(),
    ]
    let context = [items, options];
    this.onProgress(0, tasks.length, action);
    await tasks.reduce((prevPromise, task, index) => {
      const result = prevPromise.then(async () => {
        const { fun, name } = task;
        const message = `${action}(${items.length}) - ${name}`;
        context = await this.logger.measure<any>(fun, this, isArray(context) ? context : [context], message);
      });
      this.onProgress(index + 1, tasks.length, action);
      return result;
    }, Promise.resolve());
    this.logger.result(`${action}(${items.length})`);
    return context;
  }

  protected async prepareRead(items: BaseItem[], options?: BaseReadOption): Promise<BaseReadContext> {
    // @ts-ignore
    if (!options?.force && items.find(item => !(item instanceof this.getReadItemClass()))) {
      throw createError(Errors.EINVAL, 'item', 'reason', 'must be Parser.getReadItemClass type');
    }
    // @ts-ignore
    const { readOptionTypes, readDefaultOptions } = this.constructor;
    validateOptions(options, readOptionTypes);
    const entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    const ReadContext = this.getReadContextClass();
    // @ts-ignore
    const context = new ReadContext();
    context.items = items;
    context.entries = entries;
    context.options = mergeObjects(readDefaultOptions, options);
    this.logger.debug(`Ready to read with options: ${JSON.stringify(context.options)}.`);
    return context;
  }

  abstract async read(context?: BaseReadContext): Promise<Array<string | Buffer> | void>;

  protected unzipTasks(): Task<T>[] {
    return [
      { fun: this.prepareParse, name: 'prepareParse' },
      { fun: this.unzipIfNeeded, name: 'unzipIfNeeded' },
    ];
  }

  async unzip(unzipPath?: string, overwrite = true): Promise<boolean | void> {
    const action = Action.UNZIP;
    const tasks = this.unzipTasks();
    let context = { unzipPath, overwrite };
    this.onProgress(0, tasks.length, action);
    await tasks.reduce((prevPromise, task, index) => {
      const result = prevPromise.then(async () => {
        const { fun, name } = task;
        const message = `${action} - ${name}`;
        context = await this.logger.measure<any>(fun, this, [context], message);
      });
      this.onProgress(index + 1, tasks.length, action);
      return result;
    }, Promise.resolve());
    this.logger.result(action);
    return isString(this.input);
  }
}

export default Parser;
