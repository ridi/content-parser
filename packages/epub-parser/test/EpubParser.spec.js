import { Errors, isExists, isString } from '@ridi/parser-core';
import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs-extra';
import path from 'path';

import EpubParser from '../src/EpubParser';
import Book from '../src/model/Book';
import DeadItem from '../src/model/DeadItem';
import InlineCssItem from '../src/model/InlineCssItem';
import NcxItem from '../src/model/NcxItem';
import SpineItem from '../src/model/SpineItem';
import Paths from '../../../test/paths';
import ReadContext from '../src/model/ReadContext';
import ParseContext from '../src/model/ParseContext';
import validationBook from './validationBook';
import TestCryptoProvider from './TestCryptoProvider';

chai.use(chaiAsPromised);
should(); // Initialize should

describe('EpubParser', () => {
  describe('Parsing test', () => {
    describe('Error situation', () => {
      it('META-INF not found', () => {
        return new EpubParser(Paths.META_INF_MISSING).parse().catch(err => {
          err.code.should.equal(Errors.ENOFILE.code);
        });
      });

      it('NCX not found (File missing)', () => {
        return new EpubParser(Paths.NCX_FILE_MISSING).parse({ allowNcxFileMissing: false }).catch(err => {
          err.code.should.equal(Errors.ENOFILE.code);
        });
      });

      it('NCX not found (Ncx id not matched)', () => {
        return new EpubParser(Paths.NCX_ID_NOT_MATCHED).parse().then(book => {
          assert(book.ncx === undefined);
        });
      });

      it('NCX not found (In OPF)', () => {
        return new EpubParser(Paths.NCX_MISSING_IN_OPF).parse({ allowNcxFileMissing: false }).catch(err => {
          err.code.should.equal(Errors.EINVAL.code);
        });
      });
  
      it('Invalid package (mimetype file must be first file in archive.)', () => {
        return new EpubParser(Paths.INVALID_PACKAGE1).parse({ validatePackage: true }).catch(err => {
          err.toString().should.equal('Error: EINVAL: invalid package. (reason: mimetype file must be first file in archive.)');
        });
      });

      it('Invalid package (mimetype file should not compressed.)', () => {
        return new EpubParser(Paths.INVALID_PACKAGE2).parse({ validatePackage: true }).catch(err => {
          err.toString().should.equal('Error: EINVAL: invalid package. (reason: mimetype file should not compressed.)');
        });
      });

      it('Invalid package (mimetype file should only contain string \'application/epub+zip\'.)', () => {
        return new EpubParser(Paths.INVALID_PACKAGE3).parse({ validatePackage: true }).catch(err => {
          err.toString().should.equal('Error: EINVAL: invalid package. (reason: mimetype file should only contain string \'application/epub+zip\'.)');
        });
      });

      it('Invalid package (shouldn\'t use extra field feature of ZIP format for mimetype file.)', () => {
        return new EpubParser(Paths.INVALID_PACKAGE4).parse({ validatePackage: true }).catch(err => {
          err.toString().should.equal('Error: EINVAL: invalid package. (reason: shouldn\'t use extra field feature of ZIP format for mimetype file.)');
        });
      });
    });
  
    describe('Check context by step', () => {
      const expectedContext = JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_CONTEXT));
      let parser = new EpubParser(Paths.DEFAULT);
      let _context;
    
      it('_prepareParse test', () => {
        return parser._prepareParse().then(context => {
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

      it('_unzipIfNeeded test', () => {
        _context.options.unzipPath = path.join('.', 'temp');
        return parser._unzipIfNeeded(_context).should.be.fulfilled;
      });
    
      it('_parseMetaInf test', () => {
        return parser._parseMetaInf(_context).then(context => {
          context.opfPath.should.equal(expectedContext.opfPath);
          context.basePath.should.equal(expectedContext.basePath);
          _context = context;
        });
      });
    
      it('_parseOpf test', () => {
        return parser._parseOpf(_context).then(context => {
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
          rawBook.languages.should.deep.equal(expectedRawBook.languages);
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
        return parser._parseNcx(_context).then(context => {
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
    
      it('_createBook test', () => {
        return parser._createBook(_context).then(book => {
          validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
        });
      });
    });
  
    it('Parse with default options from file', () => {
      return new EpubParser(Paths.DEFAULT).parse().then(book => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
      });
    });
  
    it('Parse with default options from directory', () => {
      return new EpubParser(Paths.UNZIPPED_DEFAULT).parse().then(book => {
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
      });
    });

    it('Use parseStyle option', () => {
      const additionalInlineStyle = 'body { color: #ff0000; } p { font-size: 5em !important; }';
      return new EpubParser(Paths.EXTRACT_STYLE).parse({ additionalInlineStyle }).then(book => {
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

    it('Not use parseStyle option', () => {
      return new EpubParser(Paths.EXTRACT_STYLE).parse({ parseStyle: false }).then(book => {
        book.styles.forEach(style => {
          assert(style.namespace === undefined);
          (style instanceof InlineCssItem).should.be.false;
        });
        book.spines.forEach(spine => {
          assert(spine.styles === undefined);
        });
      });
    });

    describe('Identify problems that occur when searching for covers or analyze spine styles', () => {
      it('Pass edge cases (1)', () => {
        return new EpubParser(Paths.EDGE_CASES1).parse(book => {
          book.cover.should.be.not.null;
        });
      });
  
      it('Pass edge cases (2)', () => {
        return new EpubParser(Paths.EDGE_CASES2).parse(book => {
          book.cover.should.be.not.null;
        });
      });
  
      it('Pass edge cases (3)', () => {
        return new EpubParser(Paths.EDGE_CASES3).parse(book => {
          assert(book.cover === undefined);
        });
      });
    });
  });

  describe('Book serialization test', () => {
    it('Book -> RawBook -> Book', () => {
      return new EpubParser(Paths.DEFAULT).parse().then(book => {
        const rawBook = book.toRaw();
        const newBook = new Book(rawBook);
        validationBook(book, JSON.parse(fs.readFileSync(Paths.EXPECTED_DEFAULT_BOOK)));
      });
    });
  
    it('Never build a cycle structure in a Book', () => {
      return new EpubParser(Paths.DEFAULT).parse().then(book => {
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
    parser.parse().then(book => {
      describe('Read test', () => {
        it('Read single item', () => {
          return parser.readItem(book.spines[0]).then(result => {
            assert(isString(result));
          });
        });
  
        it('Read multiple items', () => {
          const items = book.spines.concat(book.styles).concat(book.fonts);
          return parser.readItems(items).then(results => {
            results.map(result => isString(result) || Buffer.isBuffer(result)).should.deep.equal(items.map(_ => true));
          });
        });
      });
    });
  });

  describe('Cryption test', () => {
    const unzipPath = path.join('.', 'decryptedDefault');
    const provider = new TestCryptoProvider('epub-parser');
    const parser = new EpubParser(Paths.ENCRYPTED_DEFAULT, provider);
    parser.parse({ unzipPath }).then(book => {
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
});
