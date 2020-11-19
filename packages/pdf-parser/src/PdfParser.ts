import {  createError, CryptoProvider, Errors, isExists, isString, LogLevel, Parser, readEntries, Task } from "@ridi/parser-core";
import fs from 'fs-extra';
import pdfJs, { PDFLoadingTask, PDFPromise, PDFWorker } from "pdfjs-dist";
import PdfBook from "./model/PdfBook";
import PdfParseContext from "./model/PdfParseContext";


class PdfParser extends Parser<PdfParseContext> {
  static get parseDefaultOptions(): BaseParserOption & {fakeWorker: boolean} {
    return {
      ...super.parseDefaultOptions,
      // Use fake worker when used in a browser environment such as Electron Renderer Proccess.
      fakeWorker: false,
    };
  }

  static get parseOptionTypes(): Record<keyof BaseParserOption, string> & {fakeWorker: string} {
    return {
      ...super.parseOptionTypes,
      fakeWorker: 'Boolean',
    };
  }

  static get readDefaultOptions(): void {
    throw createError(Errors.ENOIMP);
  }

  static get readOptionTypes(): void {
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
  constructor(input: string, cryptoProvider?: CryptoProvider, logLevel?: LogLevel) {
    /* istanbul ignore next */
    logLevel = isString(logLevel) ? logLevel : LogLevel.WARN;
    cryptoProvider = isString(cryptoProvider) ? undefined : cryptoProvider;
    super(input, cryptoProvider, { namespace: 'PdfParser', logLevel });
    if (fs.statSync(input).isDirectory()) {
      throw createError(Errors.EINVAL, 'input', 'reason', 'must be file path');
    }
  }

  getParseContextClass(): PdfParseContext {
    return new PdfParseContext;
  }


  getBookClass(): typeof PdfBook {
    return PdfBook;
  }

  getReadContextClass(): void {
    throw createError(Errors.ENOIMP);
  }

  getReadItemClass(): void {
    throw createError(Errors.ENOIMP);
  }

  protected createBook(): Promise<PdfBook> {
    return new Promise(resolve=>resolve(new PdfBook()));
  }

  protected parseTasks(): Task<PdfParseContext>[] {
    return [
      ...super.parseTasks(),
      { fun: this.loadDocuemnt, name: 'loadDocuemnt' },
      { fun: this.parseMetadata, name: 'parseMetadata' },
      { fun: this.parseOutline, name: 'parseOutline' },
      { fun: this.parsePermission, name: 'parsePermission' },
    ];
  }

  protected parseAfterTasks(): Task<PdfParseContext>[] {
    return [
      { fun: this.destoryWorkerIfNeeded, name: 'destoryWorkerIfNeeded' },
      ...super.parseAfterTasks(),
    ];
  }

  /**
   * @param {object} that
   * @param {function} fun
   * @param {*[]} args
   * @returns {*}
   */
  private async execute<T>(that: any, fun:(...param: any[]) => PDFLoadingTask<T> | PDFPromise<T>, args?: any[]): Promise<T> {
    return new Promise((resolve) => {
      const runner = fun.apply(that, args);
      const runnerPromise = runner.promise;
      runnerPromise.then((data) => {
        resolve(data);
      })
    });
  }

  private async loadDocuemnt(context: PdfParseContext) {
    const { rawBook, entries, options } = context;
    const worker = options? new PDFWorker(`pdfWorker_${uuid()}`) : null;
    const data = await entries?.first.getFile();
    const document = await this.execute<pdfJs.PDFDocumentProxy>(pdfJs, pdfJs.getDocument, [{ data, worker }]);
    context.document = document;
    context.worker = worker || undefined;
    rawBook.pageCount = document.numPages;
    return context;
  }

  /**
   * Metadata parsing in Document
   * @param {PdfParseContext} context intermediate result
   * @returns {Promise<PdfParseContext>} return Context containing metadata
   * @throws {Errors.EPDFJS} pdfjs error
   */
  private async parseMetadata(context: PdfParseContext) {
    const { rawBook, document } = context;
    const metadata = await this.execute<any>(document, document.getMetadata);
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
  private async parseOutline(context: PdfParseContext) {
    const { rawBook, document } = context;
    const outline = await this.execute(document, document.getOutline);
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
                  ref = await this.execute(document, document.getDestination, [ref]);
                } else {
                  this.logger.warn('Outline \'%s\' ignored. (reason: pageIndexRef not found)', item.title);
                  resolve(null);
                  return;
                }

                try {
                  const page = await this.execute(document, document.getPageIndex, [ref[0]]);
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
  private async parsePermission(context: PdfParseContext): Promise<PdfParseContext> {
    const { rawBook, document } = context;
    if(rawBook && document){
      rawBook.permissions = await this.execute(document, document.getPermissions);
    }
    return context;
  }

  protected async destoryWorkerIfNeeded(context: PdfParseContext): Promise<PdfParseContext> {
    const { worker } = context;
    if (worker && isExists(worker)) {
      worker.destroy();
    }
    return context;
  }

  async read(): Promise<void | (string | Buffer)[]> {
    const entries = await readEntries(this.input, this.cryptoProvider, this.logger);
    const file = await entries.first.getFile();
    return [file];
  }

  public async unzip(): Promise<void> {
    throw createError(Errors.ENOIMP);
  }
}

export default PdfParser;
