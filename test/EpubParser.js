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
import Guide from '../src/model/Guide';
import Identifier from '../src/model/Identifier';
import InlineCssItem from '../src/model/InlineCssItem';
import Item from '../src/model/Item';
import NcxItem from '../src/model/NcxItem'
import SpineItem from '../src/model/SpineItem';

chai.use(chaiAsPromised);
should(); // Initialize should

const Files = {
  DEFAULT: path.join('.', 'test', 'res', 'default.epub'),
  UNZIPPED_DEFAULT: path.join('.', 'test', 'res', 'default'),
  EXPECTED_DEFAULT_CONTEXT: path.join('.', 'test', 'res', 'expectedDefaultContext.json'),
  EXPECTED_DEFAULT_BOOK: path.join('.', 'test', 'res', 'expectedDefaultBook.json'),
  INVALID_PACKAGE: path.join('.', 'test', 'res', 'invalidPackage.epub'),
  INVALID_XML: path.join('.', 'test', 'res', 'invalidXml.epub'),
  NCX_MISSING: path.join('.', 'test', 'res', 'ncxMissing.epub'),
  META_INF_MISSING: path.join('.', 'test', 'res', 'metainfMissing.epub'),
  OPF_MISSING: path.join('.', 'test', 'res', 'opfMissing.epub'),
  EXTRACT_STYLE: path.join('.', 'test', 'res', 'extractStyle.epub'),
  UNZIPPED_EXTRACT_STYLE: path.join('.', 'test', 'res', 'extractStyle'),
  EXPECTED_EXTRACT_STYLE_CONTEXT: path.join('.', 'test', 'res', 'expectedExtractStyleContext.json'),
  EXPECTED_EXTRACT_STYLE_BOOK: path.join('.', 'test', 'res', 'expectedExtractStyleBook.json'),
  EXPECTED_EXTRACT_BODY: path.join('.', 'test', 'res', 'expectedExtractBody.json'),
  EXPECTED_EXTRACT_BODY_WITH_NO_ADAPTOR: path.join('.', 'test', 'res', 'expectedExtractBodyWithNoAdaptor.json'),
};

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

describe('Options test', () => {
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
});

const expectedBook = JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_BOOK));
const validationDefalutBook = (book) => {
  book.titles.should.have.lengthOf(expectedBook.titles.length);
  book.titles.forEach((title, idx) => {
    title.should.equal(expectedBook.titles[idx]);
  });

  book.creators.should.have.lengthOf(expectedBook.creators.length);
  book.creators.forEach((creator, idx) => {
    const expectedCreator = expectedBook.creators[idx];
    creator.name.should.equal(expectedCreator.name);
    creator.role.should.equal(expectedCreator.role);
  });

  book.subjects.should.have.lengthOf(expectedBook.subjects.length);
  book.subjects.forEach((subject, idx) => {
    subject.should.equal(expectedBook.subjects[idx]);
  });

  book.description.should.equal(expectedBook.description);

  book.publisher.should.equal(expectedBook.publisher);

  book.contributors.should.have.lengthOf(expectedBook.contributors.length);
  book.contributors.forEach((contributor, idx) => {
    const expectedContributor = expectedBook.contributors[idx];
    contributor.name.should.equal(expectedContributor.name);
    contributor.role.should.equal(expectedContributor.role);
  });

  book.dates.should.have.lengthOf(expectedBook.dates.length);
  book.dates.forEach((date, idx) => {
    const expectedDate = expectedBook.dates[idx];
    date.value.should.equal(expectedDate.value);
    date.event.should.equal(expectedDate.event);
  });

  book.type.should.equal(expectedBook.type);

  book.format.should.equal(expectedBook.format);

  book.identifiers.should.have.lengthOf(expectedBook.identifiers.length);
  book.identifiers.forEach((identifier, idx) => {
    const expectedIdentifier = expectedBook.identifiers[idx];
    identifier.value.should.equal(expectedIdentifier.value);
    identifier.scheme.should.equal(expectedIdentifier.scheme);
  });

  book.source.should.equal(expectedBook.source);
  
  book.language.should.equal(expectedBook.language);

  book.relation.should.equal(expectedBook.relation);

  book.coverage.should.equal(expectedBook.coverage);

  book.rights.should.equal(expectedBook.rights);

  book.epubVersion.should.equal(expectedBook.epubVersion);

  book.items.should.have.lengthOf(expectedBook.items.length);
  book.items.forEach((item, idx) => {
    const expectedItem = expectedBook.items[idx];
    item.id.should.equal(expectedItem.id);
    item.href.should.equal(expectedItem.href);
    item.mediaType.should.equal(expectedItem.mediaType);
    item.size.should.not.null;
  });

  book.ncx.navPoints.should.have.lengthOf(expectedBook.ncx.navPoints.length);
  book.ncx.navPoints.forEach((navPoint, idx) => {
    const expectedNavPoint = expectedBook.ncx.navPoints[idx];
    navPoint.id.should.equal(expectedNavPoint.id);
    navPoint.label.should.equal(expectedNavPoint.label);
    navPoint.src.should.equal(expectedNavPoint.src);
    if (isExists(navPoint.anchor)) {
      navPoint.anchor.should.equal(expectedNavPoint.anchor);
    } else {
      assert(!isExists(navPoint.anchor));
    }
    navPoint.depth.should.equal(expectedNavPoint.depth);
    navPoint.children.should.have.lengthOf(expectedNavPoint.children.length);
    navPoint.children.forEach((childNavPoint, idx) => {
      const expectedChildNavPoint = expectedNavPoint.children[idx];
      childNavPoint.id.should.equal(expectedChildNavPoint.id);
      childNavPoint.children.should.have.lengthOf(expectedChildNavPoint.children.length);
    });
    if (navPoint.spine) {
      navPoint.spine.id.should.equal(expectedNavPoint.spine.id);
    } else {
      assert(!isExists(navPoint.spine));
    }
  });

  book.spines.should.have.lengthOf(expectedBook.spines.length);
  book.spines.forEach((spine, idx) => {
    const expectedSpine = expectedBook.spines[idx];
    spine.id.should.equal(expectedSpine.id);
    spine.spineIndex.should.equal(expectedSpine.spineIndex);
    spine.isLinear.should.equal(expectedSpine.isLinear);
    assert(!isExists(spine.styles));
  });

  book.fonts.should.have.lengthOf(expectedBook.fonts.length);
  book.fonts.forEach((font, idx) => {
    font.id.should.equal(expectedBook.fonts[idx].id);
  });

  book.cover.id.should.equal(expectedBook.cover.id);

  book.images.should.have.lengthOf(expectedBook.images.length);
  book.images.forEach((image, idx) => {
    image.id.should.equal(expectedBook.images[idx].id);
  });

  book.styles.should.have.lengthOf(expectedBook.styles.length);
  book.styles.forEach((style, idx) => {
    const expectedStyle = expectedBook.styles[idx];
    style.id.should.equal(expectedStyle.id);
    assert(!isExists(style.namespace));
  });

  book.guide.should.have.lengthOf(expectedBook.guide.length);
  book.guide.forEach((guide, idx) => {
    const expectedGuide = expectedBook.guide[idx];
    guide.title.should.equal(expectedGuide.title);
    guide.type.should.equal(expectedGuide.type);
    guide.item.id.should.equal(expectedGuide.item.id);
    if (guide.item) {
      guide.item.id.should.equal(expectedGuide.item.id);
    } else {
      assert(!isExists(guide.item));
    }
  });
};

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
        item.size.should.not.null;
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
      validationDefalutBook(book);
    });
  });
});

describe('Parsing test by input', () => {
  it('Input is epub path', () => {
    return new EpubParser(Files.DEFAULT).parse().then((book) => {
      book.should.be.an.instanceOf(Book);
      validationDefalutBook(book);
    });
  });

  it('Input is buffer', () => {
    const buffer = fs.readFileSync(Files.DEFAULT);
    return new EpubParser(buffer).parse().then((book) => {
      book.should.be.an.instanceOf(Book);
      validationDefalutBook(book);
    });
  });

  it('Input is unzipped epub path', () => {
    return new EpubParser(Files.UNZIPPED_DEFAULT).parse().then((book) => {
      book.should.be.an.instanceOf(Book);
      validationDefalutBook(book);
    });
  });
});

describe('Book serialization test', () => {
  it('Book -> RawBook -> Book', () => {
    return new EpubParser(Files.DEFAULT).parse().then((book) => {
      book.should.be.an.instanceOf(Book);
      const rawBook = book.toRaw();
      const newBook = new Book(rawBook);
      validationDefalutBook(newBook);
    });
  });
});

const basePath = Files.UNZIPPED_EXTRACT_STYLE
const parser = new EpubParser(basePath);
parser.parse({ useStyleNamespace: true }).then((book) => {
  const _Files = {
    Section0001: path.join(basePath, 'OEBPS', 'Text', 'Section0001.xhtml'),
    Style0001: path.join(basePath, 'OEBPS', 'Styles', 'Style0001.css'),
    Style0002: path.join(basePath, 'OEBPS', 'Styles', 'Style0002.css'),
    Style0003: path.join(basePath, 'OEBPS', 'Styles', 'Style0003.css'),
  };
  describe('Reading test', () => {
    it('Invalid item', () => {
      (() => {
        parser.read({ href: _Files.Section0001 }, { encoding: 'utf8' });
      }).should.throw(Errors.INVALID_ITEM);
    });

    it('Item not found', () => {
      (() => {
        parser.read(new Item({}), { encoding: 'utf8', ignoreEntryNotFoundError: false });
      }).should.throw(Errors.ITEM_NOT_FOUND);
    });

    it('Read single item', () => {
      const expected = fs.readFileSync(_Files.Section0001, 'utf8');
      parser.read(book.spines[0], { encoding: 'utf8' }).should.equal(expected);
    });

    it('Read multiple item', () => {
      const expectedBook = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_STYLE_BOOK));
      const expectedList = [
        fs.readFileSync(_Files.Style0001, 'utf8'),
        fs.readFileSync(_Files.Style0002, 'utf8'),
        fs.readFileSync(_Files.Style0003, 'utf8'),
        expectedBook.styles[3].text,
        expectedBook.styles[4].text,
      ];
      parser.read(book.styles, { encoding: 'utf8' }).should.deep.equal(expectedList);
    });

    it('Extract body from SpineItem', () => {
      let expected = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_BODY, 'utf8'));
      let options = { encoding: 'utf8', spine: { extractBody: true } };
      parser.read(book.spines[0], options).should.deep.equal(expected);

      expected = JSON.parse(fs.readFileSync(Files.EXPECTED_EXTRACT_BODY_WITH_NO_ADAPTOR, 'utf8'));
      options = { encoding: 'utf8', spine: { extractBody: true, extractAdapter: undefined } };
      parser.read(book.spines[0], options).should.deep.equal(expected);
    });
  });
});
