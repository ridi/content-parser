import { Errors, isExists, isString } from '@ridi/parser-core';
import chai, { assert, expect, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

import ComicBook from '../src/model/ComicBook';
import ComicParser from '../src/ComicParser';
import ComicItem from '../src/model/ComicItem';
import ComicReadContext from '../src/model/ComicReadContext';
import ComicParseContext from '../src/model/ComicParseContext';
import Paths from '../../../test/paths';
import validationBook from './validationBook';

chai.use(chaiAsPromised);
should(); // Initialize should

describe('ComicParser', () => {
  describe('Parsing test', () => {
    describe('Check context by step', () => {
      const expectedContext = JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK));
      let parser = new ComicParser(Paths.COMIC);
      let _context;

      it('_prepareParse test', () => {
        return parser._prepareParse().then((context) => {
          context.should.be.an.instanceOf(ComicParseContext);
          context.options.should.deep.equal(ComicParser.parseDefaultOptions);
          context.entries.should.not.null;
          _context = context;
        });
      });

      it('_unzipIfNeeded test', function () {
        this.timeout(5 * 1000);
        _context.options.unzipPath = path.join('.', 'temp');
        return parser._unzipIfNeeded(_context).should.be.fulfilled;
      });

      it('_parse test', () => {
        return parser._parse(_context).then((context) => {
          const { items } = context.rawBook;
          assert(items.length > 0);
          items.forEach((item) => {
            item.index.should.not.null;
            item.path.should.not.null;
            item.size.should.not.null;
            isExists(item.width).should.be.false;
            isExists(item.height).should.be.false;
          });
          _context = context;
        });
      });

      it('_createBook test', () => {
        return parser._createBook(_context).then(book => {
          validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
        });
      });
    });

    it('Parse with default options from file', () => {
      return new ComicParser(Paths.COMIC).parse().then(book => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
      });
    });

    it('Parse with default options from directory', () => {
      return new ComicParser(Paths.UNZIPPED_COMIC).parse().then(book => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
      });
    });

    it('Use ext option', () => {
      return new ComicParser(Paths.UNZIPPED_COMIC).parse({ ext: [] }).then(book => {
        book.items.length.should.equal(0);
      });
    });

    it('Use parseImageSize option (boolean)', function () {
      this.timeout(5 * 1000);
      const parseOptions = { parseImageSize: true };
      return new ComicParser(Paths.UNZIPPED_COMIC).parse(parseOptions).then(book => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK_WITH_SIZE)), parseOptions);
      });
    });

    it('Use parseImageSize option (number)', function () {
      this.timeout(5 * 1000);
      const parseOptions = { parseImageSize: 1024 * 50 };
      return new ComicParser(Paths.UNZIPPED_COMIC).parse(parseOptions).then(book => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK_WITH_SIZE)), parseOptions);
      });
    });
  });

  it('initialize without cryptoProvider', () => {
    const comicParser = new ComicParser(Paths.COMIC, 'fakeProvider');
    expect(comicParser.cryptoProvider).to.be.undefined;
  })

  it('parseImageSize return undefined when sizeof throws', async () => {
    const comicParser = new ComicParser(Paths.COMIC, 'fakeProvider');
    const imageSize = await comicParser._parseImageSize({getFile:sinon.fake.returns(Buffer.from(['f','a','k','e']))}, {parseImageSize: true});
    expect(imageSize.height).to.be.undefined;
    expect(imageSize.width).to.be.undefined;
  });

  describe('Book serialization test', () => {
    it('Book -> RawBook -> Book', () => {
      return new ComicParser(Paths.COMIC).parse().then(book => {
        const rawBook = book.toRaw();
        const newBook = new ComicBook(rawBook);
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
      });
    });
  });

  describe('Reading test', () => {
    const parser = new ComicParser(Paths.COMIC);
    parser.parse().then(book => {
      describe('Read test', () => {
        it('Read single item', () => {
          return parser.readItem(book.items[0]).then((result) => {
            assert(Buffer.isBuffer(result));
          });
        });

        it('Read single item with base64', () => {
          return parser.readItem(book.items[0], { base64: true }).then((result) => {
            const expected = fs.readFileSync(Paths.COMIC_BASE64, 'utf-8');
            result.length.should.equal(expected.length);
            result.substr(0, 500).should.equal(expected.substr(0, 500));
          });
        });

        it('Read single item with force', () => {
          return parser.readItem({ path: '1.jpg' }, { force: true }).then((result) => {
            const expected = fs.readFileSync(Paths.COMIC_FIRST);
            result.length.should.equal(expected.length);
            result.equals(expected).should.be.true;
          });
        });

        it('Read multiple items', function () {
          this.timeout(10 * 1000);
          return parser.readItems(book.items).then((results) => {
            results.map(result => Buffer.isBuffer(result)).should.deep.equal(book.items.map(_ => true));
          });
        });
      });
    });
  });
});
