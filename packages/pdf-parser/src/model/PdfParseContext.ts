import type BaseParseContext from '@ridi/parser-core/type/BaseParseContext';
import type { BaseParserOption } from '@ridi/parser-core/type/BaseParseContext';
import type { ReadEntriesReturnType } from '@ridi/parser-core/type/readEntries';
import type { PDFDocumentProxy, PDFWorker } from 'pdfjs-dist';
import PdfBook from './PdfBook';

class PdfParseContext implements BaseParseContext<PdfBook> {

  document?: PDFDocumentProxy;

  worker?: PDFWorker;

  options: BaseParserOption | undefined;

  entries: ReadEntriesReturnType;

  rawBook: PdfBook;

  constructor(){
    this.rawBook = new PdfBook();
  }

}

export default PdfParseContext;
