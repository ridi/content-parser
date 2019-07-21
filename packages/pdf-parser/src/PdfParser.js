import {
  Errors, createError,
  isExists, isString,
  Parser,
  readEntries,
} from '@ridi/parser-core';

import fs from 'fs';
import pdfJs from 'pdfjs-dist';

import Book from './model/Book';
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

  static get readDefaultOptions() {
    throw createError(Errors.ENOIMP);
  }

  static get readOptionTypes() {
    throw createError(Errors.ENOIMP);
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

  _getReadContextClass() {
    throw createError(Errors.ENOIMP);
  }

  _getReadItemClass() {
    throw createError(Errors.ENOIMP);
  }

  /**
   * @returns {ParseTask[]} return tasks
   */
  _parseTasks() {
    return [
      ...super._parseTasks(),
      { fun: this._loadDocuemnt, name: 'loadDocuemnt' },
      { fun: this._parseMetadata, name: 'parseMetadata' },
      { fun: this._parseOutline, name: 'parseOutline' },
    ];
  }

  /**
   * load pdf document and get number of pages
   * @param {ReadContext} context intermediate result
   * @returns {Promise.<ReadContext>} return Context containing document and page count
   * @throws {Errors.EPDFJS} pdfjs error
   */
  async _loadDocuemnt(context) {
    const { rawBook, entries } = context;
    await new Promise(async (resolve) => {
      const pdfFile = await entries.first.getFile();
      pdfJs.getDocument(pdfFile)
        .promise
        .then((document) => {
          context.document = document;
          rawBook.pageCount = document.numPages;
          resolve();
        })
        .catch((error) => {
          throw createError(Errors.EPDFJS, error);
        });
    });
    return context;
  }

  /**
   * Metadata parsing in Document
   * @param {ParseContext} context intermediate result
   * @returns {Promise.<ParseContext>} return Context containing metadata
   * @throws {Errors.EPDFJS} pdfjs error
   */
  async _parseMetadata(context) {
    const { rawBook, document } = context;
    await new Promise(async (resolve) => {
      document.getMetadata()
        .then((metadata) => {
          const { info } = metadata;
          const { Title: title } = info;
          if (!isExists(title) || title.length === 0) {
            [info.Title] = this.input.split('/').slice(-1);
          }
          rawBook.info = info;
          resolve();
        })
        .catch((error) => {
          throw createError(Errors.EPDFJS, error);
        });
    });
    return context;
  }

  /**
   * Outline parsing in Document
   * @param {ParseContext} context intermediate result
   * @returns {Promise.<ParseContext>} return Context containing outline
   * @throws {Errors.EPDFJS} pdfjs error
   */
  async _parseOutline(context) {
    const { rawBook, document } = context;
    await new Promise(async (resolve) => {
      document.getOutline()
        .then((outline) => {
          rawBook.outline = outline;
          resolve();
        })
        .catch((error) => {
          throw createError(Errors.EPDFJS, error);
        });
    });
    return context;
  }

  /**
   * Returns PDF file as Buffer
   * @returns {Buffer}
   */
  async read() {
    const entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    const file = await entries.first.getFile();
    return file;
  }

  async _read() {
    throw createError(Errors.ENOIMP);
  }

  unzip() {
    throw createError(Errors.ENOIMP);
  }
}

export default PdfParser;
