import { should } from 'chai';
import fs from 'fs';

import { EpubParser, Errors } from '../src';
import Author from '../src/model/Author';
import Book from '../src/model/Book';
import Context from '../src/model/Context';
import DateTime from '../src/model/DateTime';
import Guide from '../src/model/Guide';
import Identifier from '../src/model/Identifier';
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

describe('Options test', () => {
  it('Invalid options', () => {
    (() => { 
      new EpubParser(Files.DEFAULT, { i_am_invalid_option: true });
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
    (() => {
      new EpubParser(Files.NCX_MISSING, { allowNcxFileMissing: false }).parse();
    }).should.throw(Errors.NCX_NOT_FOUND);
  });

  it('Buffer input and unzip option can not coexist', () => {
    (() => {
      const buffer = fs.readFileSync(Files.DEFAULT);
      new EpubParser(buffer, { unzipPath: './temp' });
    }).should.throw(Errors.FILE_PATH_INPUT_REQUIRED);
  })
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
      let current = 0;
      rawBook.items.forEach((item, idx) => {
        const expectedItem = expectedRawBook.items[idx];
        item.id.should.equal(expectedItem.id);
        item.href.should.equal(expectedItem.href);
        item.mediaType.should.equal(expectedItem.mediaType);
        item.compressedSize.should.not.null;
        item.uncompressedSize.should.not.null;
        if (item.spineIndex > SpineItem.UNKNOWN_INDEX) {
          item.spineIndex.should.equal(current);
          current += 1;
        }
      });
      rawBook.guide.should.deep.equal(expectedRawBook.guide);
      _context = context;
    });
  });

  it('_parseNcx test', () => {
    return _parser._parseNcx(_context).then((context) => {
      context.items.forEach((item, idx) => {
        const expectedItem = expectedContext.items[idx];
        item.id.should.equal(expectedItem.id);
        item.itemType.should.equal(expectedItem.itemType);
        if (item.navPoints) {
          item.navPoints.should.equal(expectedItem.navPoints);
        }
      });
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
        dates.name.should.equal(expectedDate.name);
        dates.event.should.equal(expectedDate.role);
      });

      book.type.should.equal(expectedBook.type);

      book.format.should.equal(expectedBook.format);

      book.identifiers.should.have.lengthOf(expectedBook.identifiers.length);
      book.identifiers.forEach((identifier, idx) => {
        const expectedIdentifier = expectedBook.identifiers[idx];
        identifier.name.should.equal(expectedIdentifier.name);
        identifier.scheme.should.equal(expectedIdentifier.role);
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
        const expectedNavPoints = expectedBook.ncx.navPoints[idx];
        navPoint.id.should.equal(expectedNavPoint.id);
        navPoint.label.should.equal(expectedNavPoint.label);
        navPoint.src.should.equal(expectedNavPoint.src);
        navPoint.anchor.should.equal(expectedNavPoint.anchor);
        navPoint.depth.should.equal(expectedNavPoint.depth);
        navPoint.children.should.have.lengthOf(expectedNavPoint.children.length);
        navPoint.children.forEach((childNavPoint, idx) => {
          const expectedChildNavPoint = expectedNavPoint.children[idx];
          childNavPoint.id.should.equal(expectedChildNavPoint.id);
          childNavPoint.children.should.have.lengthOf(expectedChildNavPoint.children.length);
        });
        if (navPoint.spine) {
          navPoint.spine.id.should.equal(expectedNavPoint.spine.id);
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
      });
    });
  });
});
