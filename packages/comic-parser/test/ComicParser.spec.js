import { Errors, isExists, isString } from '@ridi/parser-core';
import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs-extra';
import path from 'path';

import Book from '../src/model/Book';
import ComicParser from '../src/ComicParser';
import Item from '../src/model/Item';
import Paths from '../../../test/paths';
import validationBook from './validationBook';

chai.use(chaiAsPromised);
should(); // Initialize should

describe('Input test', () => {
  it('Input is zip path', () => {
    new ComicParser(Paths.COMIC).should.be.an.instanceOf(ComicParser);
  });

  it('Input is unzipped zip path', () => {
    new ComicParser(Paths.UNZIPPED_COMIC).should.be.an.instanceOf(ComicParser);
  });

  describe('Error Situation', () => {
    it('Invalid file path', () => {
      try {
        new ComicParser('./test/res/test.zip');
      } catch (err) {
        err.code.should.equal(Errors.ENOENT.code);
      }
    });
  
    it('Invalid input', () => {
      try {
        new ComicParser([]);
      } catch (err) {
        err.code.should.equal(Errors.EINVAL.code);
      }
    });
  });
});


describe('Parsing test', () => {
  describe('Options validation', () => {
    it('Invalid options (Unknown option)', () => {
      return new ComicParser(Paths.COMIC).parse({ i_am_invalid_option: true }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  
    it('Invalid option value (Type mismatch)', () => {
      return new ComicParser(Paths.COMIC).parse({ unzipPath: 5 }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  });

  describe('Check context by step', () => {
    const expectedContext = JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK));
    let parser = new ComicParser(Paths.COMIC);
    let _context;
  
    it('_prepareParse test', () => {
      return parser._prepareParse().then((context) => {
        context.options.should.deep.equal(ComicParser.parseDefaultOptions);
        context.entries.should.not.null;
        _context = context;
      });
    });
  
    it('_parse test', () => {
      return parser._parse(_context).then((context) => {
        const { items } = context.rawBook;
        assert(items.length > 0);
        items.forEach((item) => {
          item.index.should.not.null;
          item.path.should.not.null;
          item.size.should.not.null;
        });
        _context = context;
      });
    });
  
    it('_unzipIfNeeded test', () => {
      _context.options.unzipPath = path.join('.', 'temp');
      return parser._unzipIfNeeded(_context).should.be.fulfilled;
    });
  
    it('_createBook test', () => {
      return parser._createBook(_context).then((book) => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
      });
    });
  });

  describe('Parsing test by input', () => {
    it('Input is zip path', () => {
      return new ComicParser(Paths.COMIC).parse().then((book) => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
      });
    });
  
    it('Input is unzipped zip path', () => {
      return new ComicParser(Paths.UNZIPPED_COMIC).parse().then((book) => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
      });
    });
  });
});

describe('Book serialization test', () => {
  it('Book -> RawBook -> Book', () => {
    return new ComicParser(Paths.COMIC).parse().then((book) => {
      const rawBook = book.toRaw();
      const newBook = new Book(rawBook);
      validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_COMIC_BOOK)));
    });
  });
});

describe('Reading test', () => {
  const parser = new ComicParser(Paths.COMIC);
  parser.parse().then((book) => {
    describe('Options validation', () => {
      it('Invalid options (Unknown option)', () => {
        return parser.readItem(book.items[0], { i_am_invalid_option: true }).catch((err) => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    
      it('Invalid option value (Type mismatch)', () => {
        return parser.readItem(book.items[0], { base64: 'true' }).catch((err) => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    });

    describe('Error Situation', () => {
      it('Invalid item', () => {
        return parser.readItem({ path: './test' }).catch((err) => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    });

    describe('Read test', () => {
      it('Read single item', () => {
        return parser.readItem(book.items[0]).then((result) => {
          assert(Buffer.isBuffer(result));
        });
      });

      it('Read single item with base64', () => {
        return parser.readItem(book.items[0], { base64: true }).then((result) => {
          result.should.equal(fs.readFileSync(Paths.COMIC_BASE64, 'utf8'));
        });
      });

      it('Read multiple items', function () {
        this.timeout(1000 * 10);
        return parser.readItems(book.items).then((results) => {
          results.map(result => Buffer.isBuffer(result)).should.deep.equal(book.items.map(_ => true));
        });
      });
    });
  });
});
