import { Errors, isExists, isString } from '@ridi/parser-core';
import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs-extra';
import path from 'path';

import Book from '../src/model/Book';
import Item from '../src/model/Item';
import ReadContext from '../src/model/ReadContext';
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

      it('_parse test', function() {
        this.timeout(10 * 1000);
        return parser._parse(_context).then((context) => {
          const { items } = context.rawBook;
          assert(items.length > 0);
          items.forEach((item) => {
            item.pageId.should.not.null;
          });
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
    it('Book -> RawBook -> Book', function() {
      this.timeout(10 * 1000);
      return new PdfParser(Paths.PDF).parse().then(book => {
        const rawBook = book.toRaw();
        const newBook = new Book(rawBook);
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_BOOK)));
      });
    });
  });
});
