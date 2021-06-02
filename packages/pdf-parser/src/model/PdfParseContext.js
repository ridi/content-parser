import { BaseParseContext } from '@ridi/parser-core';

import PdfBook from './PdfBook';

class PdfParseContext extends BaseParseContext {
  /**
   * @type {import('pdfjs-dist').PDFDocumentProxy}
   */
  document;

  /**
   * @type {{[Key in keyof PdfBook]: any} & {info: import('pdfjs-dist').PDFInfo}}
   */
  rawBook;

  constructor() {
    super();
    const rawBook = {};
    Object.keys(new PdfBook()).forEach(key => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
    this.document = undefined;
    this.worker = undefined;
  }
}

export default PdfParseContext;
