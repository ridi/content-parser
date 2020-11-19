import {
  Parser, isString, stringContains, isExists, createError, Errors, BaseCryptor, LogLevel, CryptoProvider,
} from '@ridi/parser-core';
import * as imageSize from 'image-size';
import * as path from 'path';
import naturalCompare from 'string-natural-compare';

import ComicBook from './model/ComicBook';
import ComicItem from './model/ComicItem';
import ComicReadContext from './model/ComicReadContext';
import ComicParseContext from './model/ComicParseContext';
import type { BaseParserOption } from '@ridi/parser-core/type/BaseParseContext';
import type { BaseReadOption } from '@ridi/parser-core/type/BaseReadContext';
import type { Task } from '@ridi/parser-core/type/Parser';

class ComicParser extends Parser<ComicParseContext> {
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions(): BaseParserOption & { ext: string[], parseImageSize: boolean } {
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
  static get parseOptionTypes(): Record<keyof BaseParserOption, string> & { ext: string, parseImageSize: string } {
    return {
      ...super.parseOptionTypes,
      ext: 'Array',
      parseImageSize: 'Boolean|Number',
    };
  }

  /**
   * Get default values of read options
   * @returns {ComicReadOption}
   */
  static get readDefaultOptions(): BaseReadOption & { base64: boolean } {
    return {
      ...super.readDefaultOptions,
      // If false, reads image into a buffer.
      base64: false,
    };
  }

  /**
   * Get types of read option
   * @returns {ComicReadOptionType}
   */
  static get readOptionTypes(): Record<keyof BaseReadOption, string> & { base64: string } {
    return {
      ...super.readOptionTypes,
      base64: 'Boolean',
    };
  }

  /**
   * Create new ComicParser
   * @example new ComicParser('./foo/bar.zip' or './foo/bar');
   */
  constructor(input: string, cryptoProvider?: CryptoProvider, logLevel?: LogLevel) {
    /* istanbul ignore next */
    logLevel = isString(cryptoProvider) ? LogLevel.WARN : logLevel;
    cryptoProvider = isString(cryptoProvider) ? undefined : cryptoProvider;
    super(input, cryptoProvider, { namespace: 'ComicParser', logLevel });
  }

  getParseContextClass(): ComicParseContext {
    return new ComicParseContext;
  }

  getBookClass(): typeof ComicBook {
    return ComicBook;
  }

  getReadContextClass(): ComicReadContext {
    return ComicReadContext;
  }

  getReadItemClass(): typeof ComicItem {
    return ComicItem;
  }

  parseTasks(): Task<ComicParseContext>[] {
    return [
      ...super.parseTasks(),
      { fun: this._parse, name: 'parse' },
    ];
  }

  /**
   * extracts only necessary metadata from entries and create item list
   */
  async parse(context: ComicReadContext): Promise<ComicReadContext> {
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
          ...await this.parseImageSize(item, options),
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
  async parseImageSize(entry, options) {
    const { parseImageSize } = options;
    if (parseImageSize === false) {
      return {};
    }
    const readOptions = Number.isInteger(parseImageSize) ? { end: parseImageSize } : {};
    const buffer = await entry.getFile(readOptions);
    try {
      const size = imageSize.imageSize(buffer);
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
