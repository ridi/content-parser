import {
  Errors, createError,
  isExists,
  Parser,
  stringContains,
} from '@ridi/parser-core';

import { orderBy } from 'natural-orderby';
import path from 'path';

import Book from './model/Book';
import Item from './model/Item';
import ReadContext from './model/ReadContext';
import ParseContext from './model/ParseContext';

class ComicParser extends Parser {
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions() {
    return {
      ...super.parseDefaultOptions,
      // File extension to allow when extracting lists.
      ext: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
    };
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes() {
    return {
      ...super.parseOptionTypes,
      ext: 'Array',
    };
  }

  /**
   * Get default values of read options
   */
  static get readDefaultOptions() {
    return {
      ...super.readDefaultOptions,
      // If false, reads image into a buffer.
      base64: false,
    };
  }

  /**
   * Get types of read option
   */
  static get readOptionTypes() {
    return {
      ...super.readOptionTypes,
      base64: 'Boolean',
    };
  }

  /**
   * Create new ComicParser
   * @param {string} input file or directory
   * @param {CryptoProvider} cryptoProvider en/decrypto provider
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EINVAL} invalid input
   * @example new ComicParser('./foo/bar.zip' or './foo/bar');
   */
  constructor(input, cryptoProvider) {
    super(input, cryptoProvider, 'ComicParser');
  }

  /**
   * @returns {ParseContext}
   */
  _getParseContextClass() {
    return ParseContext;
  }

  /**
   * @returns {Book}
   */
  _getBookClass() {
    return Book;
  }

  /**
   * @returns {ReadContext}
   */
  _getReadContextClass() {
    return ReadContext;
  }

  /**
   * @returns {Item}
   */
  _getReadItemClass() {
    return Item;
  }

  /**
   * @returns {ParseTask[]} return tasks
   */
  _parseTasks() {
    return [
      ...super._parseTasks(),
      { func: this._parse, name: 'parse' },
    ];
  }

  /**
   * extracts only necessary metadata from entries and create item list
   * @param {ReadContext} context intermediate result
   * @returns {Promise.<ReadContext>} return Context containing item list
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
   * Contents is read using loader suitable for context
   * @param {ReadContext} context properties required for reading
   * @returns {(string|Buffer)[]} reading results
   * @throws {Errors.ENOFILE} no such file
   * @see ComicParser.readDefaultOptions.force
   */
  async _read(context) {
    const { items, entries, options } = context;
    const results = [];
    await items.reduce((prevPromise, item) => { // eslint-disable-line arrow-body-style
      return prevPromise.then(async () => {
        const entry = entries.find(item.path);
        if (!options.force && !isExists(entry)) {
          throw createError(Errors.ENOFILE, item.path);
        }
        const file = await entry.getFile();
        if (options.base64) {
          results.push(`data:${item.mimeType};base64,${file.toString('base64')}`);
        } else {
          results.push(file);
        }
      });
    }, Promise.resolve());
    return results;
  }
}

export default ComicParser;
