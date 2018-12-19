import {
  Errors, createError,
  isExists, isString,
  mergeObjects,
  readEntries,
  stringContains,
  validateOptions,
} from '@ridi/parser-core';

import fs from 'fs';
import { orderBy } from 'natural-orderby';
import path from 'path';

import Context from './model/Context';
import Book from './model/Book';
import Item from './model/Item';

const privateProps = new WeakMap();

class ComicParser {
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions() {
    return {
      // If specified, uncompress to that path. (only using if input is Zip file.)
      unzipPath: undefined,
      // If true, overwrite to unzipPath when uncompress. (only using if unzipPath specified.)
      overwrite: true,
      // File extension to allow when extracting lists.
      ext: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
    };
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes() {
    return {
      unzipPath: 'String|Undefined',
      overwrite: 'Boolean',
      ext: 'Array',
    };
  }

  /**
   * Get default values of read options
   */
  static get readDefaultOptions() {
    return {
      // If false, reads image into a buffer.
      base64: false,
    };
  }

  /**
   * Get types of read option
   */
  static get readOptionTypes() {
    return {
      base64: 'Boolean',
    };
  }

  /**
   * Get file or directory
   */
  get input() { return privateProps.get(this).input; }

  /**
   * Get en/decrypto provider
   */
  get cryptoProvider() { return privateProps.get(this).cryptoProvider; }

  /**
   * Create new ComicParser
   * @param {string} input file or directory
   * @param {CryptoProvider} cryptoProvider en/decrypto provider
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EINVAL} invalid input
   * @example new ComicParser('./foo/bar.zip' or './foo/bar');
   */
  constructor(input, cryptoProvider) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw createError(Errors.ENOENT, input);
      }
    } else {
      throw createError(Errors.EINVAL, 'input', 'input', input);
    }
    privateProps.set(this, { input, cryptoProvider });
  }

  /**
   * Comic Parsing
   * @param {?object} options parse options
   * @returns {Promise.<Book>} return Book
   * @see ComicParser.parseDefaultOptions
   * @see ComicParser.parseOptionTypes
   * @example
   * const options = { unzipPath: './foo/bar' };
   * parser.parse(options).then((book) => {
   *   ...
   * });
   */
  async parse(options = {}) {
    let context = await this._prepareParse(options);
    context = await this._parse(context);
    context = await this._unzipIfNeeded(context);
    const list = await this._createBook(context);
    return list;
  }

  /**
   * Validate parse options and get entries from input
   * @param {?object} options parse options
   * @returns {Promise.<Context>} return Context containing parse options, entries
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   * @see ComicParser.parseDefaultOptions
   * @see ComicParser.parseOptionTypes
   */
  async _prepareParse(options = {}) {
    validateOptions(options, ComicParser.parseOptionTypes);
    const context = new Context();
    context.options = mergeObjects(ComicParser.parseDefaultOptions, options);
    context.entries = await readEntries(this.input, this.cryptoProvider);
    return context;
  }

  /**
   * extracts only necessary metadata from entries and create item list
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context containing item list
   * @see ComicParser.parseDefaultOptions.filter
   */
  async _parse(context) {
    const { entries, rawBook, options } = context;
    const items = orderBy(entries.map(entry => entry), entry => entry.entryPath)
      .filter((entry) => {
        const ext = path.extname(entry.entryPath);
        return ext.length > 0 && stringContains(options.ext.map(e => `.${e}`), ext);
      });
    rawBook.items = [];
    await items.reduce((prevPromise, entry, index) => { // eslint-disable-line arrow-body-style
      return prevPromise.then(async () => {
        rawBook.items.push({
          index,
          path: entry.entryPath,
          size: entry.size,
        });
      });
    }, Promise.resolve());
    return context;
  }

  /**
   * Unzipping if zip source and unzipPath option specified
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context (no change at this step)
   * @throws {Errors.ENOENT} no such file or directory
   * @see ComicParser.parseDefaultOptions.unzipPath
   * @see ComicParser.parseDefaultOptions.overwrite
   */
  async _unzipIfNeeded(context) {
    const { options, entries } = context;
    const { unzipPath, overwrite } = options;
    if (!isString(entries.source) && isExists(unzipPath)) {
      await entries.source.extractAll(unzipPath, overwrite);
      privateProps.set(this, { ...privateProps.get(this), input: unzipPath });
    }
    return context;
  }

  /**
   * Create new Book from context
   * @param {Context} context intermediate result
   * @returns {Promise.<Book>} return Book
   */
  _createBook(context) {
    return new Promise((resolve) => {
      resolve(new Book(context.rawBook));
    });
  }

  /**
   * Reading contents of Item
   * @param {Item} item target
   * @param {?object} options read options
   * @returns {(string|Buffer)} reading result
   * @see ComicParser.readDefaultOptions
   * @see ComicParser.readOptionTypes
   * @example
   * const options = { ... };
   * parse.readItem(book.spine[0], options).then((result) => {
   *   ...
   * });
   */
  async readItem(item, options = {}) {
    const results = await this.readItems([item], options);
    return results[0];
  }

  /**
   * Reading contents of Items
   * @param {Item[]} items targets
   * @param {?object} options read options
   * @returns {(string|Buffer)[]} reading results
   * @see ComicParser.readDefaultOptions
   * @see ComicParser.readOptionTypes
   * @example
   * const options = { ... };
   * parse.readItems(book.styles, options).then((results) => {
   *   ...
   * });
   */
  async readItems(items, options = {}) {
    const context = await this._prepareRead(items, options);
    const results = await this._read(context);
    return results;
  }

  /**
   * @typedef ReadContext
   * @property {Item[]} items targets
   * @property {object} entries from input
   * @property {object} options read options
   */
  /**
   * Validate read options and get entries from input
   * @param {Item[]} items targets
   * @param {?object} options read options
   * @returns {Promise.<ReadContext>}
   *          returns ReadContext containing target items, read options, entries
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   * @see ComicParser.readDefaultOptions
   * @see ComicParser.readOptionTypes
   */
  async _prepareRead(items, options = {}) {
    if (items.find(item => !(item instanceof Item))) {
      throw createError(Errors.EINVAL, 'item', 'reason', 'item must be Item type');
    }
    validateOptions(options, ComicParser.readOptionTypes);
    const entries = await readEntries(this.input, this.cryptoProvider);
    return {
      items,
      entries,
      options: mergeObjects(ComicParser.readDefaultOptions, options),
    };
  }

  /**
   * Contents is read using loader suitable for context
   * @param {ReadContext} context properties required for reading
   * @returns {(string|Buffer)[]} reading results
   * @throws {Errors.ENOFILE} no such file
   */
  async _read(context) {
    const { items, entries, options } = context;
    const results = [];
    await items.reduce((prevPromise, item) => { // eslint-disable-line arrow-body-style
      return prevPromise.then(async () => {
        const entry = entries.find(item.path);
        if (!isExists(entry)) {
          throw createError(Errors.ENOFILE, item.path);
        }
        const file = await entry.getFile();
        if (options.base64) {
          results.push(file.toString('base64'));
        } else {
          results.push(file);
        }
      });
    }, Promise.resolve());
    return results;
  }
}

export default ComicParser;
