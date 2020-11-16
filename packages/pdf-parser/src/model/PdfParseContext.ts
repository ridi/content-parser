import { BaseParseContext } from '@ridi/parser-core';
import type { PDFDocumentProxy, PDFWorker } from 'pdfjs-dist';
import type PdfBook from './PdfBook';

class PdfParseContext extends BaseParseContext {

  document?: PDFDocumentProxy;

  rawBook?: PdfBook;

  worker?: PDFWorker;

  constructor() {
    super();
  }
}

export default PdfParseContext;
