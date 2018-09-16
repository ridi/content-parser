import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import path from 'path';

import Errors from '../src/constant/errors';
import EpubParser from '../src/EpubParser';
import Book from '../src/model/Book';
import DeadItem from '../src/model/DeadItem';
import NcxItem from '../src/model/NcxItem';
import SpineItem from '../src/model/SpineItem';
import { isExists, isString } from '../src/util';
import Files from './files';
import validationBook from './validationBook';

chai.use(chaiAsPromised);
should(); // Initialize should

describe('Input test', () => {
  it('Input is epub path', () => {
    new EpubParser(Files.DEFAULT).should.be.an.instanceOf(EpubParser);
  });

  it('Input is unzipped epub path', () => {
    new EpubParser(Files.UNZIPPED_DEFAULT).should.be.an.instanceOf(EpubParser);
  });

  describe('Error Situation', () => {
    it('Invalid file path', () => {
      try {
        new EpubParser('./test/res/test.epub');
      } catch (err) {
        err.code.should.equal(Errors.ENOENT.code);
      }
    });
  
    it('Invalid input', () => {
      try {
        new EpubParser([]);
      } catch (err) {
        err.code.should.equal(Errors.EINVAL.code);
      }
    });
  });
});

describe('Parsing test', () => {
  describe('Options validation', () => {
    it('Invalid options (Unknown option)', () => {
      return new EpubParser(Files.DEFAULT).parse({ i_am_invalid_option: true }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  
    it('Invalid option value (Type mismatch)', () => {
      return new EpubParser(Files.DEFAULT).parse({ validatePackage: 'true' }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  });

  describe('Error Situation', () => {
    it('META-INF not found', () => {
      return new EpubParser(Files.META_INF_MISSING).parse().catch((err) => {
        err.code.should.equal(Errors.ENOFILE.code);
      });
    });

    it('OPF file not found', () => {
      return new EpubParser(Files.OPF_MISSING).parse().catch((err) => {
        err.code.should.equal(Errors.ENOFILE.code);
      });
    });

    it('NCX not found', () => {
      return new EpubParser(Files.NCX_MISSING).parse({ allowNcxFileMissing: false }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });

    // TODO: Add more cases.
    it('Invalid package', () => {
      return new EpubParser(Files.INVALID_PACKAGE).parse({ validatePackage: true }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  });

  describe('Check context by step', () => {
    const expectedContext = JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_CONTEXT));
    let parser = new EpubParser(Files.DEFAULT);
    let _context;
  
    it('_prepareParse test', () => {
      return parser._prepareParse().then((context) => {
        context.options.should.deep.equal(EpubParser.parseDefaultOptions);
        context.zip.should.not.null;
        _context = context;
      });
    });
  
    it('_validatePackageIfNeeded test', () => {
      _context.options.validatePackage = true;
      return parser._validatePackageIfNeeded(_context).should.be.fulfilled;
    });
  
    it('_parseMetaInf test', () => {
      return parser._parseMetaInf(_context).then((context) => {
        context.opfPath.should.equal(expectedContext.opfPath);
        context.basePath.should.equal(expectedContext.basePath);
        _context = context;
      });
    });
  
    it('_parseOpf test', () => {
      return parser._parseOpf(_context).then((context) => {
        const { rawBook } = context;
        const { rawBook: expectedRawBook } = expectedContext;
        rawBook.titles.should.deep.equal(expectedRawBook.titles);
        rawBook.creators.should.deep.equal(expectedRawBook.creators);
        rawBook.subjects.should.deep.equal(expectedRawBook.subjects);
        rawBook.description.should.equal(expectedRawBook.description);
        rawBook.publisher.should.equal(expectedRawBook.publisher);
        rawBook.contributors.should.deep.equal(expectedRawBook.contributors);
        rawBook.dates.should.deep.equal(expectedRawBook.dates);
        rawBook.type.should.equal(expectedRawBook.type);
        rawBook.format.should.equal(expectedRawBook.format);
        rawBook.identifiers.should.deep.equal(expectedRawBook.identifiers);
        rawBook.source.should.equal(expectedRawBook.source);
        rawBook.language.should.equal(expectedRawBook.language);
        rawBook.relation.should.equal(expectedRawBook.relation);
        rawBook.coverage.should.equal(expectedRawBook.coverage);
        rawBook.rights.should.equal(expectedRawBook.rights);
        rawBook.version.should.equal(expectedRawBook.version);
        rawBook.metas.should.deep.equal(expectedRawBook.metas);
  
        let current = 0;
        rawBook.items.forEach((item, idx) => {
          const expectedItem = expectedRawBook.items[idx];
          item.id.should.equal(expectedItem.id);
          item.href.should.equal(expectedItem.href);
          item.mediaType.should.equal(expectedItem.mediaType);
          item.itemType.name.should.equal(expectedItem.itemType);
          if (item.itemType === DeadItem) {
            item.reason.should.equal(expectedItem.reason);
            if (item.reason === DeadItem.Reason.NOT_EXISTS) {
              isExists(item.size).should.be.false;
            }
          } else {
            item.size.should.not.null;
          }
          if (item.spineIndex > SpineItem.UNKNOWN_INDEX) {
            item.spineIndex.should.equal(current);
            current += 1;
          } else {
            isExists(item.spineIndex).should.be.false;
          }
        });
        rawBook.guides.should.deep.equal(expectedRawBook.guides);
  
        context.foundCover.should.be.true;

        _context = context;
      });
    });
  
    it('_parseNcx test', () => {
      return parser._parseNcx(_context).then((context) => {
        const { rawBook } = context;
        const { rawBook: expectedRawBook } = expectedContext;
        const ncxItem = rawBook.items.find(item => item.itemType === NcxItem);
        const expectedNcxItem = expectedRawBook.items[0];
        const shouldEqual = (navPoints, expectedNavPoints) => {
          navPoints.forEach((navPoint, idx) => {
            const expectedNavPoint = expectedNavPoints[idx];
            navPoint.id.should.equal(expectedNavPoint.id);
            navPoint.navLabel.text.should.equal(expectedNavPoint.navLabel.text);
            navPoint.content.src.should.equal(expectedNavPoint.content.src);
            if (isExists(navPoint.children)) {
              shouldEqual(navPoint.children, expectedNavPoint.children);
            } else {
              isExists(navPoint.children).should.be.false;
            }
          });
        };
        shouldEqual(ncxItem.navPoints, expectedNcxItem.navPoints);
        _context = context;
      });
    });
  
    it('_unzipIfNeeded test', () => {
      _context.options.unzipPath = path.join('.', 'temp');
      return parser._unzipIfNeeded(_context).should.be.fulfilled;
    });
  
    it('_createBook test', () => {
      return parser._createBook(_context).then((book) => {
        validationBook(book, JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_BOOK)));
      });
    });
  });

  describe('Parsing test by input', () => {
    it('Input is epub path', () => {
      return new EpubParser(Files.DEFAULT).parse().then((book) => {
        book.should.be.an.instanceOf(Book);
        validationBook(book, JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_BOOK)));
      });
    });
  
    it('Input is unzipped epub path', () => {
      return new EpubParser(Files.UNZIPPED_DEFAULT).parse().then((book) => {
        book.should.be.an.instanceOf(Book);
        validationBook(book, JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_BOOK)));
      });
    });
  });

  describe('Parsing test by options', () => {
    it('Use style namespace', () => {
      return new EpubParser(Files.EXTRACT_STYLE).parse({ useStyleNamespace: true }).then((book) => {
        const expectedBook = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_STYLE_BOOK));
        book.styles.forEach((style, idx) => {
          const expectedStyle = expectedBook.styles[idx];
          style.id.should.equal(expectedStyle.id);
          style.href.should.equal(expectedStyle.href);
          style.namespace.should.equal(expectedStyle.namespace);
          style.mediaType.should.equal(expectedStyle.mediaType);
          style.size.should.not.null;
          if (isExists(style.text)) {
            style.text.should.equal(expectedStyle.text);
          }
        });
  
        book.spines.forEach((spine, spineIdx) => {
          spine.styles.forEach((style, styleIdx) => {
            const expectedStyle = expectedBook.spines[spineIdx].styles[styleIdx];
            style.id.should.equal(expectedStyle.id);
          });
        });
      });
    });
  });
});

describe('Book serialization test', () => {
  it('Book -> RawBook -> Book', () => {
    return new EpubParser(Files.DEFAULT).parse().then((book) => {
      book.should.be.an.instanceOf(Book);
      const rawBook = book.toRaw();
      const newBook = new Book(rawBook);
      validationBook(book, JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_BOOK)));
    });
  });
});

const parser = new EpubParser(Files.UNZIPPED_EXTRACT_STYLE);
parser.parse({ useStyleNamespace: true }).then((book) => {
  describe('Reading test', () => {
    describe('Options validation', () => {
      it('Invalid options (Unknown option)', () => {
        return parser.readItem(book.spines[0], { i_am_invalid_option: true }).catch((err) => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    
      it('Invalid option value (Type mismatch)', () => {
        return parser.readItem(book.spines[0], { basePath: true }).catch((err) => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    });

    describe('Error Situation', () => {
      it('Invalid item', () => {
        return parser.readItem({ href: './test' }).catch((err) => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
    });

    describe('Read test', () => {
      it('Read single item', () => {
        return parser.readItem(book.spines[0]).then((result) => {
          assert(isString(result));
        });
        return parser.readItem(book.cover).then((result) => {
          assert(Buffer.isBuffer(result));
        });
      });

      it('Read multiple items', () => {
        const items = book.styles.concat(book.spines);
        return parser.readItems(items).then((results) => {
          results.map(result => isString(result)).should.deep.equal(items.map(_ => true));
        });
      });
    });
  });
});
