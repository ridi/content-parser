import { Errors, isExists, isString } from '@ridi/parser-core';
import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs-extra';
import path from 'path';

import EpubParser from '../src/EpubParser';
import Book from '../src/model/Book';
import DeadItem from '../src/model/DeadItem';
import NcxItem from '../src/model/NcxItem';
import SpineItem from '../src/model/SpineItem';
import Paths from '../../../test/paths';
import ReadContext from '../src/model/ReadContext';
import ParseContext from '../src/model/ParseContext';
import validationBook from './validationBook';
import TestCryptoProvider from './TestCryptoProvider';

chai.use(chaiAsPromised);
should(); // Initialize should

describe('Input test', () => {
  it('Input is epub path', () => {
    new EpubParser(Paths.DEFAULT).should.be.an.instanceOf(EpubParser);
  });

  it('Input is unzipped epub path', () => {
    new EpubParser(Paths.UNZIPPED_DEFAULT).should.be.an.instanceOf(EpubParser);
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
      return new EpubParser(Paths.DEFAULT).parse({ i_am_invalid_option: true }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  
    it('Invalid option value (Type mismatch)', () => {
      return new EpubParser(Paths.DEFAULT).parse({ validatePackage: 'true' }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  });

  describe('Error Situation', () => {
    it('META-INF not found', () => {
      return new EpubParser(Paths.META_INF_MISSING).parse().catch((err) => {
        err.code.should.equal(Errors.ENOFILE.code);
      });
    });

    it('OPF file not found', () => {
      return new EpubParser(Paths.OPF_MISSING).parse().catch((err) => {
        err.code.should.equal(Errors.ENOFILE.code);
      });
    });

    it('NCX not found', () => {
      return new EpubParser(Paths.NCX_MISSING).parse({ allowNcxFileMissing: false }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });

    // TODO: Add more cases.
    it('Invalid package', () => {
      return new EpubParser(Paths.INVALID_PACKAGE).parse({ validatePackage: true }).catch((err) => {
        err.code.should.equal(Errors.EINVAL.code);
      });
    });
  });

  describe('Check context by step', () => {
    const expectedContext = JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_CONTEXT));
    let parser = new EpubParser(Paths.DEFAULT);
    let _context;
  
    it('_prepareParse test', () => {
      return parser._prepareParse().then((context) => {
        context.should.be.an.instanceOf(ParseContext);
        context.options.should.deep.equal(EpubParser.parseDefaultOptions);
        context.entries.should.not.null;
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
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
      });
    });
  });

  describe('Parsing test by input', () => {
    it('Input is epub path', () => {
      return new EpubParser(Paths.DEFAULT).parse().then((book) => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
      });
    });
  
    it('Input is unzipped epub path', () => {
      return new EpubParser(Paths.UNZIPPED_DEFAULT).parse().then((book) => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
      });
    });
  });

  describe('Parsing test by options', () => {
    it('Ignore linear property', () => {
      return new EpubParser(Paths.DEFAULT).parse({ ignoreLinear: true }).then((book) => {
        book.spines.filter(spine => spine.index === SpineItem.IGNORED_INDEX).should.have.lengthOf(0);
      });
    });

    it('Parse style', () => {
      return new EpubParser(Paths.EXTRACT_STYLE).parse().then((book) => {
        const expectedBook = JSON.parse(fs.readFileSync(Paths.EXPECTED_EXTRACT_STYLE_BOOK));
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
    return new EpubParser(Paths.DEFAULT).parse().then((book) => {
      const rawBook = book.toRaw();
      const newBook = new Book(rawBook);
      validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
    });
  });

  it('Never build a cycle structure in a Book', () => {
    return new EpubParser(Paths.DEFAULT).parse().then((book) => {
      isExists(JSON.stringify(book)).should.be.true;
      // because following errors may occur in case of ipc communication in Electron.
      // Uncaught Exception:
      // TypeError: Converting circular structure to JSON
      //   at JSON,stringify (<anonymous>)
      //   at Event.set (...)
      //   at EventEmitter.n.ipcMain.on (...)
      //   ...
    });
  });
});

describe('Reading test', () => {
  const parser = new EpubParser(Paths.UNZIPPED_EXTRACT_STYLE);
  parser.parse().then((book) => {
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
          assert(isString(result) && result.length > 0);
        });
      });

      it('Read multiple items', () => {
        const items = book.spines;
        return parser.readItems(items).then((results) => {
          results.map(result => isString(result) && result.length > 0).should.deep.equal(items.map(_ => true));
        });
      });
    });
  });
});

describe('Cryption test', () => {
  const unzipPath = path.join('.', 'decryptedDefault');
  const provider = new TestCryptoProvider('epub-parser');
  const parser = new EpubParser(Paths.ENCRYPTED_DEFAULT, provider);
  parser.parse({ unzipPath }).then((book) => {
    describe('', () => {
      after(() => {
        fs.removeSync(unzipPath);
      });

      it('EPUB file decryption', () => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
      });
  
      it('Item file decryption', () => {
        return parser.readItem(book.spines[0]).then((result) => {
          const actual = result.replace(/\r/g, '');
          const expected = fs.readFileSync(Paths.DEFAULT_COVER, 'utf8');
          actual.should.equal(expected);
        });
      });
    });
  });
});
