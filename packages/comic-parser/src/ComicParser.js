import {
  Parser, isString, stringContains, isExists, createError, Errors,
} from '@ridi/parser-core';
import sizeOf from 'image-size';
import * as path from 'path';
import naturalCompare from 'string-natural-compare';

import ComicBook from './model/ComicBook';
import ComicItem from './model/ComicItem';
import ComicReadContext from './model/ComicReadContext';
import ComicParseContext from './model/ComicParseContext';

class ComicParser extends Parser {
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions() {
    return {
      ...super.parseDefaultOptions,
      // File extension to allow when extracting lists.
      ext: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
      // If true, image size parse. (parse may be slower.)
      parseImageSize: false,
    };
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes() {
    return {
      ...super.parseOptionTypes,
      ext: 'Array',
      parseImageSize: 'Boolean|Number',
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
   * @param {import('@ridi/parser-core').CryptoProvider} cryptoProvider en/decrypto provider
   * @param {import('@ridi/parser-core').LogLevel} logLevel logging level
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EINVAL} invalid input
   * @example new ComicParser('./foo/bar.zip' or './foo/bar');
   */
  constructor(input, cryptoProvider, logLevel) {
    /* istanbul ignore next */
    logLevel = isString(cryptoProvider) ? cryptoProvider : logLevel;
    cryptoProvider = isString(cryptoProvider) ? undefined : cryptoProvider;
    super(input, cryptoProvider, { namespace: 'ComicParser', logLevel });
  }

  /**
   * @returns {ComicParseContext}
   */
  _getParseContextClass() {
    return ComicParseContext;
  }

  /**
   * @returns {ComicBook}
   */
  _getBookClass() {
    return ComicBook;
  }

  /**
   * @returns {ComicReadContext}
   */
  _getReadContextClass() {
    return ComicReadContext;
  }

  /**
   * @returns {ComicItem}
   */
  _getReadItemClass() {
    return ComicItem;
  }

  /**
   * @returns {import('@ridi/parser-core/type/Parser').Task[]} return tasks
   */
  _parseTasks() {
    return [
      ...super._parseTasks(),
      { fun: this._parse, name: 'parse' },
    ];
  }

  /**
   * extracts only necessary metadata from entries and create item list
   * @param {ComicReadContext} context intermediate result
   * @returns {Promise<ComicReadContext>} return Context containing item list
   * @see ComicParser.parseDefaultOptions.ext
   * @see ComicParser.parseDefaultOptions.parseImageSize
   */
  async _parse(context) {
    const { entries, rawBook, options } = context;
    const items = entries.sort((e1, e2) => naturalCompare(e1.entryPath, e2.entryPath))
      .filter((entry) => {
        const ext = path.extname(entry.entryPath);
        return ext.length > 0 && stringContains(options.ext.map(e => `.${e}`), ext);
      });
    rawBook.items = [];
    await items.reduce((prevPromise, item, index) => {
      return prevPromise.then(async () => {
        rawBook.items.push({
          index,
          path: item.entryPath,
          size: item.size,
          ...await this._parseImageSize(item, options),
        });
      });
    }, Promise.resolve());
    return context;
  }

  /**
   *
   * @typedef {Object} ImageMetaData
   * @property {number} width
   * @property {number} height
   */
  /**
   * parse image size from entry
   * @param {import('@ridi/parser-core/type/readEntries').EntryBasicInformation} entry image entry
   * @param {ComicParser.parseDefaultOptions} options parse options
   * @returns {Promise<ImageMetaData>} return image size
   */
  async _parseImageSize(entry, options) {
    const { parseImageSize } = options;
    if (parseImageSize === false) {
      return {};
    }
    const readOptions = Number.isInteger(parseImageSize) ? { end: parseImageSize } : {};
    const buffer = await entry.getFile(readOptions);
    try {
      const size = sizeOf(buffer);
      return { width: size.width, height: size.height };
    } catch (e) {
      this.logger.error(e);
      return { width: undefined, height: undefined };
    }
  }

  /**
   * Contents is read using loader suitable for context
   * @param {ComicReadContext} context properties required for reading
   * @returns {(string|Buffer)[]} reading results
   * @throws {Errors.ENOFILE} no such file
   * @see ComicParser.readDefaultOptions.base64
   */
  async _read(context) {
    const { items, entries, options } = context;
    const results = [];
    await items.reduce((prevPromise, item) => {
      return prevPromise.then(async () => {
        const entry = entries.find(item.path);
        /* istanbul ignore next */
        if (!options.force && !isExists(entry)) {
          /* istanbul ignore next */
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
