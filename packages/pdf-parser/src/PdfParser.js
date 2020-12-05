import {
  Errors, createError,
  isArray, isExists, isString,
  Parser,
  readEntries,
} from '@ridi/parser-core';

import fs from 'fs';
import pdfJs, { PDFWorker } from 'pdfjs-dist';
import { v4 as uuid } from 'uuid';

import PdfBook from './model/PdfBook';
import PdfParseContext from './model/PdfParseContext';

class PdfParser extends Parser {
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions() {
    return {
      ...super.parseDefaultOptions,
      // Use fake worker when used in a browser environment such as Electron Renderer Proccess.
      fakeWorker: false,
    };
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes() {
    return {
      ...super.parseOptionTypes,
      fakeWorker: 'Boolean',
    };
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
   * @param {import('@ridi/parser-core/type/CryptoProvider').default} [cryptoProvider] en/decrypto provider
   * @param {string} [logLevel] logging level
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
   * @returns {PdfParseContext}
   */
  _getParseContextClass() {
    return PdfParseContext;
  }

  /**
   * @returns {PdfBook}
   */
  _getBookClass() {
    return PdfBook;
  }

  _getReadContextClass() {
    throw createError(Errors.ENOIMP);
  }

  _getReadItemClass() {
    throw createError(Errors.ENOIMP);
  }

  /**
   * @returns {import('@ridi/parser-core/type/Parser').Task[]} return tasks
   */
  _parseTasks() {
    return [
      ...super._parseTasks(),
      { fun: this._loadDocuemnt, name: 'loadDocuemnt' },
      { fun: this._parseMetadata, name: 'parseMetadata' },
      { fun: this._parseOutline, name: 'parseOutline' },
      { fun: this._parsePermission, name: 'parsePermission' },
    ];
  }

  /**
   * @returns {import('@ridi/parser-core/type/Parser').Task[]} return after tasks
   */
  _parseAfterTasks() {
    return [
      { fun: this._destoryWorkerIfNeeded, name: 'destoryWorkerIfNeeded' },
      ...super._parseAfterTasks(),
    ];
  }

  /**
   * @param {object} that
   * @param {function} fun
   * @param {*[]} args
   * @returns {*}
   */
  async _execute(that, fun, args = []) {
    const result = await new Promise((resolve, reject) => {
      let runner = fun.apply(that, args);
      if (isExists(runner.promise)) {
        runner = runner.promise;
      }
      runner.then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(createError(Errors.EPDFJS, error));
      });
    });
    return result;
  }

  /**
   * @typedef {import('@ridi/parser-core/type/Parser').BaseReadContext} BaseReadContext
   */
  /**
   * load pdf document and get number of pages
   * @param {BaseReadContext} context intermediate result
   * @returns {Promise<BaseReadContext>} return Context containing document and page count
   * @throws {Errors.EPDFJS} pdfjs error
   */
  async _loadDocuemnt(context) {
    const { rawBook, entries, options } = context;
    const worker = options.fakeWorker ? new PDFWorker(`pdfWorker_${uuid()}`) : null;
    const data = await entries.first.getFile();
    const document = await this._execute(pdfJs, pdfJs.getDocument, [{ data, worker }]);
    context.document = document;
    context.worker = worker;
    rawBook.pageCount = document.numPages;
    return context;
  }

  /**
   * Metadata parsing in Document
   * @param {PdfParseContext} context intermediate result
   * @returns {Promise<PdfParseContext>} return Context containing metadata
   * @throws {Errors.EPDFJS} pdfjs error
   */
  async _parseMetadata(context) {
    const { rawBook, document } = context;
    const metadata = await this._execute(document, document.getMetadata);
    const { info } = metadata;
    const { Title: title } = info;
    if (!isExists(title) || title.length === 0) {
      [info.Title] = this.input.split('/').slice(-1);
    }
    rawBook.info = info;
    return context;
  }

  /**
   * Outline parsing in Document
   * @param {PdfParseContext} context intermediate result
   * @returns {Promise<PdfParseContext>} return Context containing outline
   * @throws {Errors.EPDFJS} pdfjs error
   */
  async _parseOutline(context) {
    const { rawBook, document } = context;
    const outline = await this._execute(document, document.getOutline);
    if (isExists(outline)) {
      await new Promise((resolveAll) => {
        const makePromise = (items) => {
          return (items).reduce((list, item) => {
            list = [
              ...list,
              // eslint-disable-next-line no-async-promise-executor
              new Promise(async (resolve) => {
                let ref = item.dest;
                let key = ref;
                if (isArray(ref) && isExists(ref[0]) && isExists(ref[0].num)) {
                  key = ref[0].num;
                } else if (isString(ref)) {
                  ref = await this._execute(document, document.getDestination, [ref]);
                } else {
                  this.logger.warn('Outline \'%s\' ignored. (reason: pageIndexRef not found)', item.title);
                  resolve(null);
                  return;
                }

                try {
                  const page = await this._execute(document, document.getPageIndex, [ref[0]]);
                  resolve({ [`${key}`]: page });
                } catch (error) {
                  this.logger.warn('Outline \'%s\' ignored. (reason: %s)', item.title, error.toString());
                  resolve(null);
                }
              }),
              ...makePromise(item.items),
            ];
            return list;
          }, []);
        };
        Promise.all(makePromise(outline)).then((results) => {
          let pageMap = {};
          results.forEach((result) => {
            if (isExists(result)) {
              pageMap = { ...pageMap, ...result };
            }
          });
          rawBook.pageMap = pageMap;
          resolveAll();
        });
      });
    }
    rawBook.outline = outline;
    return context;
  }

  /**
   * Permission parsing in Document
   * @param {PdfParseContext} context intermediate result
   * @returns {Promise<PdfParseContext>} return Context containing permissions
   * @throws {Errors.EPDFJS} pdfjs error
   */
  async _parsePermission(context) {
    const { rawBook, document } = context;
    rawBook.permissions = await this._execute(document, document.getPermissions);
    return context;
  }

  /**
   * Destory fake worker.
   * @param {PdfParseContext} context intermediate result
   * @returns {Promise<PdfParseContext>} return Context containing permissions
   */
  async _destoryWorkerIfNeeded(context) {
    const { worker } = context;
    if (isExists(worker)) {
      worker.destroy();
    }
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

  _read() {
    throw createError(Errors.ENOIMP);
  }

  unzip() {
    throw createError(Errors.ENOIMP);
  }
}

export default PdfParser;
