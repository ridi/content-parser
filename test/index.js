import { assert, should } from 'chai';
import fs from 'fs';
import path from 'path';

import { EpubParser, Errors } from '../src';
import {
  getPropertyDescriptor,
  getPropertyKeys,
  isArray,
  isBuffer,
  isExists,
  isObject,
  isString,
  objectMerge,
  createDirectory,
  removeDirectory,
  removeLastPathComponent,
  safePathJoin,
} from '../src/utils';
import Author from '../src/model/Author';
import Book from '../src/model/Book';
import Context from '../src/model/Context';
import DateTime from '../src/model/DateTime';
import Guide from '../src/model/Guide';
import Identifier from '../src/model/Identifier';
import NcxItem from '../src/model/NcxItem'
import SpineItem from '../src/model/SpineItem';

should(); // Initialize should

const Files = {
  DEFAULT: './test/res/default.epub',
  INVALID_PACKAGE: './test/res/invalidPackage.epub',
  INVALID_XML: './test/res/invalidXml.epub',
  NCX_MISSING: './test/res/ncxMissing.epub',
  META_INF_MISSING: './test/res/metainfMissing.epub',
  OPF_MISSING: './test/res/opfMissing.epub',
  EXPECTED_DEFAULT_CONTEXT: './test/res/expectedDefaultContext.json',
  EXPECTED_DEFAULT_BOOK: './test/res/expectedDefaultBook.json'
};

describe('Util test', () => {
  it('getPropertyDescriptor test', () => {
    const object = { value: 5 };
    getPropertyDescriptor(object, 'value').should.deep.equal({
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  it('getPropertyKeys test', () => {
    const object = { a: true, b: '2', c: 3 };
    getPropertyKeys(object).should.deep.equal(['a', 'b', 'c']);
  });

  it('isArray test', () => {
    isArray(Array()).should.be.true;
    isArray(new Array()).should.be.true;
    isArray({}).should.be.false;
    isArray(new Book()).should.be.false;
    isArray('string').should.be.false;
    isArray([]).should.be.true;
    isArray(5).should.be.false;
    isArray(false).should.be.false;
    isArray(null).should.be.false;
    isArray(undefined).should.be.false;

    const temp = Array.isArray;
    Array.isArray = undefined;
    isArray([]).should.be.true;
    Array.isArray = temp;
  });

  it('isBuffer test', () => {
    const buffer = fs.readFileSync(Files.DEFAULT);
    isBuffer(buffer).should.be.true;
    isBuffer({}).should.be.false;
    isBuffer(new Book()).should.be.false;
    isBuffer('string').should.be.false;
    isBuffer([]).should.be.false;
    isBuffer(5).should.be.false;
    isBuffer(false).should.be.false;
    isBuffer(null).should.be.false;
    isBuffer(undefined).should.be.false;
  });

  it('isExists test', () => {
    isExists({}).should.be.true;
    isExists(new Book()).should.be.true;
    isExists('string').should.be.true;
    isExists([]).should.be.true;
    isExists(5).should.be.true;
    isExists(false).should.be.true;
    isExists(null).should.be.false;
    isExists(undefined).should.be.false;
  });

  it('isObject test', () => {
    isObject({}).should.be.true;
    isObject(new Book()).should.be.true;
    isObject('string').should.be.false;
    isObject([]).should.be.false;
    isObject(5).should.be.false;
    isObject(false).should.be.false;
    isObject(null).should.be.false;
    isObject(undefined).should.be.false;
  });

  it('isString test', () => {
    isString({}).should.be.false;
    isString(new Book()).should.be.false;
    isString('string').should.be.true;
    isString([]).should.be.false;
    isString(5).should.be.false;
    isString(false).should.be.false;
    isString(null).should.be.false;
    isString(undefined).should.be.false;
  });

  const list = [
    {
      createPath: path.join('.', 'temp', 'a', 'b', 'c'),
      removePath: path.join('.', 'temp'),
    },
    {
      createPath: path.join('temp', '..', 'temp', 'a', 'b', 'c'),
      removePath: path.join('temp'),
    },
    {
      createPath: path.join('~', 'temp', 'a', 'b', 'c'),
      removePath: path.join('~'),
    },
    {
      createPath: path.join(process.cwd(), 'temp', 'a', 'b', 'c'),
      removePath: path.join(process.cwd(), 'temp'),
    },
  ];
  it('createDirectory and removeDirectory test', () => {
    list.forEach((item) => {
      createDirectory(item.createPath);
      fs.existsSync(item.createPath).should.be.true;
      fs.lstatSync(item.createPath).isDirectory().should.be.true;
      removeDirectory(item.removePath);
      let current = item.createPath;
      while (current.length > item.removePath.length) {
        fs.existsSync(current).should.be.false;
        current = removeLastPathComponent(current);
      }
    });
  });

  it('removeLastPathComponent test', () => {
    const sep = path.sep;
    removeLastPathComponent(`temp${sep}a${sep}b${sep}c`).should.equal(`temp${sep}a${sep}b`);
    removeLastPathComponent(`temp${sep}a${sep}b`).should.equal(`temp${sep}a`);
    removeLastPathComponent(`temp${sep}a`).should.equal('temp');
    removeLastPathComponent('temp').should.equal('');
    removeLastPathComponent('').should.equal('');
    removeLastPathComponent('/tmp').should.equal('/');
    removeLastPathComponent('/').should.equal('/');
  });

  it('safePathJoin test', () => {
    const sep = path.sep;
    safePathJoin('temp', 'a', 'b', 'c').should.equal(`temp${sep}a${sep}b${sep}c`);
    safePathJoin('temp', undefined).should.equal('');
    safePathJoin('temp', '..', '..', 'a', 'b').should.equal(`..${sep}a${sep}b`);
    safePathJoin('..', '..', 'temp').should.equal(`..${sep}..${sep}temp`);
  });
});

describe('Input test', () => {
  it('Input is string path', () => {
    new EpubParser(Files.DEFAULT).should.be.an.instanceOf(EpubParser);
  });

  it('Input is buffer', () => {
    const buffer = fs.readFileSync(Files.DEFAULT);
    new EpubParser(buffer).should.be.an.instanceOf(EpubParser);
  });

  it('Invalid file path', () => {
    (() => { 
      new EpubParser('./test/res/test.epub');
    }).should.throw(Errors.INVALID_FILE_PATH);
  });

  it('Invalid file type', () => {
    (() => { 
      new EpubParser('./test/res/unzippedPath');
    }).should.throw(Errors.INVALID_FILE_TYPE);
  });

  it('Invalid input', () => {
    (() => { 
      new EpubParser([]);
    }).should.throw(Errors.INVALID_INPUT);
  });
});

describe('Option test', () => {
  it('Invalid options', () => {
    (() => { 
      new EpubParser(Files.DEFAULT, { i_am_invalid_option: true });
    }).should.throw(Errors.INVALID_OPTIONS);
    (() => { 
      new EpubParser(Files.DEFAULT, { xmlParserOptions: { textNodeName: '@text' } });
    }).should.throw(Errors.INVALID_OPTIONS);
  });

  it('Invalid option value', () => {
    (() => { 
      new EpubParser(Files.DEFAULT, { shouldValidatePackage: 'true' });
    }).should.throw(Errors.INVALID_OPTION_VALUE);
  });

  // TODO: Add more cases.
  it('Invalid package', () => {
    return new EpubParser(Files.INVALID_PACKAGE, { shouldValidatePackage: true }).parse().catch((err) => {
      err.should.equal(Errors.INVALID_PACKAGE);
    });
  });

  it('Invalid XML', () => {
    return new EpubParser(Files.INVALID_XML, { shouldXmlValidation: true }).parse().catch((err) => {
      err.should.equal(Errors.INVALID_XML);
    });
  });

  it('Not allow NCX file missing', () => {
    return new EpubParser(Files.NCX_MISSING, { allowNcxFileMissing: false }).parse().catch((err) => {
      err.should.equal(Errors.NCX_NOT_FOUND);
    });
  });
});

describe('Parsing Test', () => {
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
  it('_prepare test', () => {
    return _parser._prepare().then((context) => {
      context.options.should.deep.equal(EpubParser.defaultOptions);
      context.zip.should.not.null;
      _context = context;
    });
  });

  it('_validatePackageIfNeeded test', () => {
    _context.options.shouldValidatePackage = true;
    return _parser._validatePackageIfNeeded(_context).then((context) => {
      context.verified.should.equal(expectedContext.verified);
      _context = context;
    });
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
        item.compressedSize.should.not.null;
        item.uncompressedSize.should.not.null;
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
    _context.options.unzipPath = './temp';
    return _parser._unzipIfNeeded(_context).then((context) => {
      context.unzipped.should.equal(expectedContext.unzipped);
      _context = context;
    });
  });

  const expectedBook = JSON.parse(fs.readFileSync(Files.EXPECTED_DEFAULT_BOOK));
  it('_createBook test', () => {
    return _parser._createBook(_context).then((book) => {
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
        item.id.should.equal(expectedBook.items[idx].id);
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
        style.id.should.equal(expectedBook.styles[idx].id);
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
    });
  });

  it('The final return value should be Book type', () => {
    return new EpubParser(Files.DEFAULT).parse().then((book) => {
      book.should.be.an.instanceOf(Book);
    });
  });
});
