import { Errors, isExists, isString } from '@ridi/parser-core';
import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs-extra';
import path from 'path';

import Book from '../src/model/Book';
import ParseContext from '../src/model/ParseContext';
import Paths from '../../../test/paths';
import PdfParser from '../src/PdfParser';
import validationBook from './validationBook';

chai.use(chaiAsPromised);
should(); // Initialize should

describe('PdfParser', () => {
  describe('Error situation', () => {
    it('Input must be file path', () => {
      try { new PdfParser(Paths.UNZIPPED_DEFAULT); } catch (err) { err.code.should.equal(Errors.EINVAL.code); }
    });

    it('Unsupported unzip function', () => {
      try { new PdfParser(Paths.PDF).unzip(); } catch (err) { err.code.should.equal(Errors.ENOIMP.code); }
    });

    it('Unsupported readDefaultOptions property', () => {
      try { PdfParser.readDefaultOptions; } catch (err) { err.code.should.equal(Errors.ENOIMP.code); }
    });

    it('Unsupported readOptionTypes property', () => {
      try { PdfParser.readOptionTypes; } catch (err) { err.code.should.equal(Errors.ENOIMP.code); }
    });

    it('Unsupported _getReadContextClass function', () => {
      try { new PdfParser(Paths.PDF)._getReadContextClass(); } catch (err) { err.code.should.equal(Errors.ENOIMP.code); }
    });

    it('Unsupported _getReadItemClass function', () => {
      try { new PdfParser(Paths.PDF)._getReadItemClass(); } catch (err) { err.code.should.equal(Errors.ENOIMP.code); }
    });
  });

  describe('Parsing test', () => {
    describe('Check context by step', () => {
      const expectedContext = JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_BOOK));
      let parser = new PdfParser(Paths.PDF);
      let _context;

      it('_prepareParse test', () => {
        return parser._prepareParse().then((context) => {
          context.should.be.an.instanceOf(ParseContext);
          context.options.should.deep.equal(PdfParser.parseDefaultOptions);
          context.entries.should.not.null;
          _context = context;
        });
      });

      it('_loadDocuemnt test', () => {
        return parser._loadDocuemnt(_context).then((context) => {
          const { document, rawBook } = context;
          document.should.not.null;
          _context = context;
        });
      });

      it('_parseMetadata test', () => {
        const expectedRawBook = JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_RAW_BOOK));
        return parser._parseMetadata(_context).then((context) => {
          const { document, rawBook } = context;
          rawBook.pageCount.should.equal(expectedRawBook.pageCount);
          rawBook.info.should.deep.equal(expectedRawBook.info);
          _context = context;
        });
      });

      it('_parseOutline test', () => {
        const counting = (items) => {
          return items.reduce((count, item) => {
            if (item.items.length > 0) {
              return count + counting(item.items);
            }
            return count + 1;
          }, 0);
        };
        return parser._parseOutline(_context).then((context) => {
          const { rawBook } = context;
          counting(rawBook.outline).should.equal(9);
          _context = context;
        });
      });

      it('_createBook test', () => {
        return parser._createBook(_context).then(book => {
          validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_BOOK)));
        });
      });
    });
  });
  
  describe('Book serialization test', () => {
    it('Book -> RawBook -> Book', () => {
      return new PdfParser(Paths.PDF).parse().then(book => {
        const rawBook = book.toRaw();
        const newBook = new Book(rawBook);
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_BOOK)));
      });
    });
  });
});
