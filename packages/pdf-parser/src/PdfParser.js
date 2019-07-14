import {
  Errors, createError,
  isExists, isString,
  Parser,
} from '@ridi/parser-core';

import fs from 'fs';
import pdfParser from 'pdf-parser';

import Book from './model/Book';
import Item from './model/Item';
import ReadContext from './model/ReadContext';
import ParseContext from './model/ParseContext';

class PdfParser extends Parser {
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions() {
    return {};
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes() {
    return {};
  }

  /**
   * Get default values of read options
   */
  static get readDefaultOptions() {
    return { // TODO
      ...super.readDefaultOptions,
      // If false, reads image into a buffer.
      base64: false,
    };
  }

  /**
   * Get types of read option
   */
  static get readOptionTypes() {
    return { // TODO
      ...super.readOptionTypes,
      base64: 'Boolean',
    };
  }

  /**
   * Create new PdfParser
   * @param {string} input file
   * @param {?CryptoProvider} cryptoProvider en/decrypto provider
   * @param {?string} logLevel logging level
   * @throws {Errors.ENOENT} no such file
   * @throws {Errors.EINVAL} invalid input
   * @example new PdfParser('./foo/bar.pdf');
   */
  constructor(input, cryptoProvider, logLevel) {
    /* istanbul ignore next */
    logLevel = isString(cryptoProvider) ? cryptoProvider : logLevel;
    cryptoProvider = isString(cryptoProvider) ? undefined : cryptoProvider;
    super(input, cryptoProvider, { namespace: 'PdfParser', logLevel });
    if (fs.statSync(input).isDirectory()) {
      throw createError(Errors.EINVAL, 'input', 'reason', 'must be file path');
    }
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
    return ReadContext; // TODO
  }

  /**
   * @returns {Item}
   */
  _getReadItemClass() {
    return Item; // TODO
  }

  /**
   * @returns {ParseTask[]} return tasks
   */
  _parseTasks() {
    return [
      ...super._parseTasks(),
      { fun: this._parse, name: 'parse' },
    ];
  }

  /**
   * extracts only necessary metadata from entries and create item list
   * @param {ReadContext} context intermediate result
   * @returns {Promise.<ReadContext>} return Context containing item list
   */
  async _parse(context) {
    const { rawBook, entries } = context;
    await new Promise(async (resolve) => {
      const pdfFile = await entries.first.getFile();
      pdfParser.pdf2json(pdfFile, (error, pdf) => {
        if (isExists(error)) {
          throw createError(Errors.EPDFJS, this.input);
        } else {
          rawBook.items = pdf.pages.sort((lhs, rhs) => lhs.pageId - rhs.pageId);
          resolve();
        }
      });
    });
    return context;
  }

  /**
   * Contents is read using loader suitable for context
   * @param {ReadContext} context properties required for reading
   * @returns {(string|Buffer)[]} reading results
   * @see PdfParser.readDefaultOptions.base64
   */
  async _read(context) { // eslint-disable-line
    return null; // TODO
  }

  unzip() {
    throw createError(Errors.ENOIMP);
  }
}

export default PdfParser;
