export default PdfParseContext;
declare class PdfParseContext extends BaseParseContext {
    /**
     * @type {import('pdfjs-dist').PDFDocumentProxy}
     */
    document: import('pdfjs-dist').PDFDocumentProxy;
    worker: any;
}
import { BaseParseContext } from "@ridi/parser-core";
