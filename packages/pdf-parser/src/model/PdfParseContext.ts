import type BaseParseContext from '@ridi/parser-core/type/BaseParseContext';
import type { BaseParserOption } from '@ridi/parser-core/type/BaseParseContext';
import type { ReadEntriesReturnType } from '@ridi/parser-core/type/readEntries';
import type { PDFDocumentProxy, PDFWorker } from 'pdfjs-dist';
import type PdfBook from './PdfBook';

interface PdfParseContext extends BaseParseContext<PdfBook> {

  document: PDFDocumentProxy;

  worker: PDFWorker;

  options: BaseParserOption | undefined;

  entries: ReadEntriesReturnType;

  rawBook: PdfBook;

}

export default PdfParseContext;
