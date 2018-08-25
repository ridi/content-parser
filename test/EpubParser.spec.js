import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import path from 'path';

import { EpubParser, Errors } from '../src';
import { isExists } from '../src/utils';
import Author from '../src/model/Author';
import Book from '../src/model/Book';
import Context from '../src/model/Context';
import DateTime from '../src/model/DateTime';
import DeadItem from '../src/model/DeadItem';
import Files from './files';
import Guide from '../src/model/Guide';
import Identifier from '../src/model/Identifier';
import InlineCssItem from '../src/model/InlineCssItem';
import Item from '../src/model/Item';
import NcxItem from '../src/model/NcxItem'
import SpineItem from '../src/model/SpineItem';
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

  it('Input is buffer', () => {
    const buffer = fs.readFileSync(Files.DEFAULT);
    new EpubParser(buffer).should.be.an.instanceOf(EpubParser);
  });

  it('Invalid file path', () => {
    (() => {
      new EpubParser('./test/res/test.epub');
    }).should.throw(Errors.PATH_NOT_FOUND);
  });

  it('Invalid input', () => {
    (() => {
      new EpubParser([]);
    }).should.throw(Errors.INVALID_INPUT);
  });
});

describe('Options validation test', () => {
  it('Invalid options (Unknown option)', () => {
    return new EpubParser(Files.DEFAULT).parse({ i_am_invalid_option: true }).catch((err) => {
      err.should.equal(Errors.INVALID_OPTIONS);
    });
  });

  it('Invalid option value (Type mismatch)', () => {
    return new EpubParser(Files.DEFAULT).parse({ validatePackage: 'true' }).catch((err) => {
      err.should.equal(Errors.INVALID_OPTION_VALUE);
    });
  });
});

describe('Parsing method test', () => {
  it('META-INF not found', () => {
    return new EpubParser(Files.META_INF_MISSING).parse().catch((err) => {
      err.should.equal(Errors.META_INF_NOT_FOUND);
    });
  });

  it('OPF file not found', () => {
    return new EpubParser(Files.OPF_MISSING).parse().catch((err) => {
      err.should.equal(Errors.OPF_NOT_FOUND);
    });
  });

  // TODO: Add more cases.
  it('Invalid package', () => {
    return new EpubParser(Files.INVALID_PACKAGE).parse({ validatePackage: true }).catch((err) => {
      err.should.equal(Errors.INVALID_PACKAGE);
    });
  });

  it('Invalid XML', () => {
    return new EpubParser(Files.INVALID_XML).parse({ validateXml: true }).catch((err) => {
      err.should.equal(Errors.INVALID_XML);
    });
  });

  it('Not allow NCX file missing', () => {
    return new EpubParser(Files.NCX_MISSING).parse({ allowNcxFileMissing: false }).catch((err) => {
      err.should.equal(Errors.NCX_NOT_FOUND);
    });
  });

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

  const expectedContext = JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_CONTEXT));
  let _parser = new EpubParser(Files.DEFAULT);
  let _context;

  it('_prepareParse test', () => {
    return _parser._prepareParse().then((context) => {
      context.options.should.deep.equal(EpubParser.parseDefaultOptions);
      context.zip.should.not.null;
      _context = context;
    });
  });

  it('_validatePackageIfNeeded test', () => {
    _context.options.validatePackage = true;
    return _parser._validatePackageIfNeeded(_context).should.be.fulfilled;
  });

  it('_parseMetaInf test', () => {
    return _parser._parseMetaInf(_context).then((context) => {
      context.opfPath.should.equal(expectedContext.opfPath);
      context.basePath.should.equal(expectedContext.basePath);
      _context = context;
    });
  });

  it('_parseOpf test', () => {
    return _parser._parseOpf(_context).then((context) => {
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
      rawBook.epubVersion.should.equal(expectedRawBook.epubVersion);
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
            assert(!isExists(item.size));
          }
        } else {
          item.size.should.not.null;
        }
        if (item.spineIndex > SpineItem.UNKNOWN_INDEX) {
          item.spineIndex.should.equal(current);
          current += 1;
        } else {
          assert(!isExists(item.spineIndex));
        }
      });
      rawBook.guide.should.deep.equal(expectedRawBook.guide);

      _context = context;
    });
  });

  it('_parseNcx test', () => {
    return _parser._parseNcx(_context).then((context) => {
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
            assert(!isExists(navPoint.children));
          }
        });
      };
      shouldEqual(ncxItem.navPoints, expectedNcxItem.navPoints);
      _context = context;
    });
  });

  it('_unzipIfNeeded test', () => {
    _context.options.unzipPath = path.join('.', 'temp');
    return _parser._unzipIfNeeded(_context).should.be.fulfilled;
  });

  it('_createBook test', () => {
    return _parser._createBook(_context).then((book) => {
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

  it('Input is buffer', () => {
    const buffer = fs.readFileSync(Files.DEFAULT);
    return new EpubParser(buffer).parse().then((book) => {
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
    it('Invalid item', () => {
      (() => {
        parser.read({ href: Files.EXPECTED_READ_SPINE_WITH_BASE_PATH }, { encoding: 'utf8' });
      }).should.throw(Errors.INVALID_ITEM);
    });

    it('Read single item', () => {
      let expected = fs.readFileSync(Files.EXPECTED_READ_SPINE_WITH_BASE_PATH, 'utf8');
      let options = { encoding: 'utf8', basePath: './a/b/c' };
      parser.read(book.spines[0], options).should.equal(expected);

      expected = fs.readFileSync(Files.EXPECTED_READ_SPIN, 'utf8');
      parser.read(book.spines[0]).should.equal(expected);
    });

    it('Read multiple item', () => {
      const expectedList = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_STYLES));
      const options = { css: { removeTags: ['html', 'body'] } };
      parser.read(book.styles, options).should.deep.equal(expectedList);
    });

    it('Extract body from SpineItem', () => {
      let expected = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_BODY, 'utf8'));
      let options = { spine: { extractBody: true } };
      parser.read(book.spines[0], options).should.deep.equal(expected);

      expected = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_BODY_WITH_NO_ADAPTOR, 'utf8'));
      options = { spine: { extractBody: true, extractAdapter: undefined } };
      parser.read(book.spines[0], options).should.deep.equal(expected);
    });

    it('Extract styles from CssItems', () => {
      const expectedList = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_STYLES_WITH_BASE_PATH));
      const options = { encoding: 'utf8', basePath: './a/b/c', css: { removeTags: ['html', 'body'] } };
      parser.read(book.styles, options).should.deep.equal(expectedList);
    });
  });
});
