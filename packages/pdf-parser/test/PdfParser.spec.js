import { Errors, isExists, isString } from '@ridi/parser-core';
import chai, { assert, expect, should } from 'chai';
import spies from 'chai-spies';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

import PdfBook from '../src/model/PdfBook';
import PdfParseContext from '../src/model/PdfParseContext';
import Paths from '../../../test/paths';
import PdfParser from '../src/PdfParser';
import DummyDocument from './DummyDocument';
import validationBook from './validationBook';

chai.use(chaiAsPromised);
chai.use(spies);
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

    it('Unsupported readOptionTypes property', () => {
      expect(new PdfParser(Paths.PDF)._read).to.throw('function not implemented.');
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
          context.should.be.an.instanceOf(PdfParseContext);
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

      it('_parseMetadata test - not empty title', async () => {
        const testBookTItle = 'sample title';
        sinon.replace(_context.document, 'getMetadata', sinon.fake.resolves({ info: { Title: testBookTItle } }));
        const newContext = await parser._parseMetadata(_context);
        expect(newContext.rawBook.info.Title).to.equal(testBookTItle);
        sinon.restore();
      })
      it('_parseMetadata test - proper test', () => {
        const expectedRawBook = JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_RAW_BOOK));
        return parser._parseMetadata(_context).then((context) => {
          const { document, rawBook } = context;
          rawBook.pageCount.should.equal(expectedRawBook.pageCount);
          rawBook.info.should.deep.equal(expectedRawBook.info);
          _context = context;
        });
      })
      it('_parseOutline test - empty outline', async () => {
        sinon.replace(_context.document, 'getOutline', sinon.fake.resolves(undefined));
        await parser._parseOutline(_context).then((context) => {
          const { rawBook } = context;
          expect(rawBook.outline).to.be.undefined;
        });
        sinon.restore();
      });
      it('_parseOutline test - proper outline', () => {
        const counting = (items) => {
          return (items || []).reduce((count, item) => {
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

    it('Outline parse test by edge cases', () => {
      const parser = new PdfParser(Paths.PDF);
      const context = new PdfParseContext();
      context.document = new DummyDocument(JSON.parse(fs.readFileSync(Paths.OUTLINE)));
      return parser._parseOutline(context).then(context => {
        const expected = JSON.parse(fs.readFileSync(Paths.EXPECTED_OUTLINE));
        const book = new PdfBook(context.rawBook);
        const actual = book.outlineItems;
        actual.forEach((item, idx) => {
          const expectedItem = expected[idx];
          item.title.should.equal(expectedItem.title);
          if (item.title.startsWith('Case 1')) {
            item.page.should.equal(4);
          } else if (item.title.startsWith('Case 2')) {
            item.page.should.equal(5);
          } else {
            isExists(item.page).should.be.false;
          }
        });
      });
    });

    it('Use fakeWorker option', () => {
      return new PdfParser(Paths.PDF).parse({ fakeWorker: true }).then(book => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_BOOK)));
      });
    });
    it('Read should return a buffer', async () => {
      const pdfParser = new PdfParser(Paths.PDF);
      expect(await pdfParser.read()).to.deep.equal(fs.readFileSync(Paths.PDF));
    });
    it('Init with CryptoProvider', async () => {
      const pdfParser = new PdfParser(Paths.PDF, 'fakeProvider');
      expect(pdfParser.cryptoProvider).to.undefined;
    });
  });

  describe('Book serialization test', () => {
    it('Book -> RawBook -> Book', () => {
      return new PdfParser(Paths.PDF).parse().then(book => {
        const rawBook = book.toRaw();
        const newBook = new PdfBook(rawBook);
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_PDF_BOOK)));
      });
    });
  });
});
