import { should } from 'chai';
import fs from 'fs';

import { EpubParser, Errors } from '../src';
import Author from '../src/model/Author';
import Book from '../src/model/Book';
import DateTime from '../src/model/DateTime';
import Guide from '../src/model/Guide';
import Identifier from '../src/model/Identifier';

should(); // Initialize should

const Files = {
  DEFAULT: './test/res/default.epub',
  INVALID_PACKAGE: './test/res/invalidPackage.epub',
  INVALID_XML: './test/res/invalidXml.epub',
  NCX_MISSING: './test/res/ncxMissing.epub',
  META_INF_MISSING: './test/res/metainfMissing.epub',
  OPF_MISSING: './test/res/opfMissing.epub',
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
      new EpubParser('//');
    }).should.throw(Errors.INVALID_FILE_PATH);
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
    (() => {
      new EpubParser(Files.INVALID_PACKAGE, { shouldValidatePackage: true }).parse();
    }).should.throw(Errors.INVALID_PACKAGE);
  });

  it('Invalid XML', () => {
    (() => {
      new EpubParser(Files.INVALID_XML, { shouldXmlValidation: true }).parse();
    }).should.throw(Errors.INVALID_XML);
  });

  it('The package and all XML files were verified', () => {
    const options = { shouldValidatePackage: true, shouldXmlValidation: true };
    return new EpubParser(Files.DEFAULT, options).parse().then((book) => {
      book.should.be.an.instanceOf(Book);
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
      new EpubParser(buffer, { unzipPath: './temp' }).parse();
    }).should.throw(Errors.FILE_PATH_INPUT_REQUIRED);
  })
});

describe('Parsing Test', () => {
  it('META-INF not found', () => {
    (() => {
      new EpubParser(Files.META_INF_MISSING).parse();
    }).should.throw(Errors.META_INF_NOT_FOUND);
  });

  it('OPF file not found', () => {
    (() => {
      new EpubParser(Files.OPF_MISSING).parse();
    }).should.throw(Errors.OPF_NOT_FOUND);
  });

  it('Pasred', () => {
    return new EpubParser(Files.DEFAULT).parse().then((book) => {
      book.titles.should.have.lengthOf(1);
      book.titles[0].should.equal('Default');

      book.creators.should.have.lengthOf(2);
      let creator = book.creators[0];
      creator.name.should.equal('Davin Ahn');
      creator.role.should.equal(Author.Roles.AUTHOR);
      creator = book.creators[1];
      creator.name.should.equal('Davin Ahn');
      creator.role.should.equal(Author.Roles.EDITOR);

      book.subjects.should.have.lengthOf(1);
      book.subjects[0].should.equal('Subject');

      book.description.should.equal('Description');

      book.publisher.should.equal('Davin');

      book.contributors.should.have.lengthOf(1);
      book.contributors[0].name.should.equal('Davin Ahn');
      book.contributors[0].role.should.equal(Author.Roles.UNDEFINED);

      book.dates.should.have.lengthOf(2);
      let date = book.dates[0];
      date.value.should.equal('2018-08-07');
      date.value.should.equal(DateTime.Events.MODIFICATION);
      date = book.dates[1];
      date.value.should.equal('2018-08-07');
      date.value.should.equal(DateTime.Events.CREATION);

      book.type.should.equal('Type');

      book.format.should.equal('Format');

      book.identifiers.should.have.lengthOf(2);
      let identifier = book.identifiers[0];
      identifier.value.should.equal('0-306-40615-2');
      identifier.scheme.should.equal(Identifier.Schemes.ISBN);
      identifier = book.identifiers[1];
      identifier.value.should.equal('urn:uuid:1379039a-3ea4-4071-9ce8-2b0c29fc0030');
      identifier.scheme.should.equal(Identifier.Schemes.UUID);

      book.source.should.equal('My brain');
      
      book.language.should.equal('en');

      book.relation.should.equal('https://github.com/ridi/epub-parser');

      book.coverage.should.equal('Coverage');

      book.rights.should.equal('Copyright (c) 2018 Davin');

      book.epubVersion.should.equal(2.0);

      book.checkSum.should.be.above(0);

      let expectedList = [
        { id: 'ncx', href: 'toc.ncx', mediaType: 'application/x-dtbncx+xml' },
        { id: 'Cover.xhtml', href: 'Text/Cover.xhtml', mediaType: 'application/xhtml+xml' },
        { id: 'Section0001.xhtml', href: 'Text/Section0001.xhtml', mediaType: 'application/xhtml+xml' },
        { id: 'Section0002.xhtml', href: 'Text/Section0002.xhtml', mediaType: 'application/xhtml+xml' },
        { id: 'Style0001.css', href: 'Styles/Style0001.css', mediaType: 'text/css' },
        { id: 'NotoSans-Regular.ttf', href: 'Fonts/NotoSans-Regular.ttf', mediaType: 'application/x-font-ttf' },
        { id: 'ridibooks_logo.png', href: 'Images/ridibooks_logo.png', mediaType: 'image/png' }
      ];
      book.items.length.should.equal(expectedList.length);
      book.items.forEach((item, idx) => {
        const expectedItem = expectedList[idx];
        item.id.should.equal(expectedItem.id);
        item.href.should.equal(expectedItem.href);
        item.mediaType.should.equal(expectedItem.mediaType);
        item.compressedSize.should.be.above(0);
        item.uncompressedSize.should.be.above(0);
        item.checkSum.should.be.above(0);
      });

      expectedList = [
        { id: 'navPoint-1', label: 'Cover', src: 'Text/Cover.xhtml', anchor: undefined, depth: 0, childrenCount: 0, spine: book.spines[0] },
        { id: 'navPoint-2', label: 'Chapter 1', src: 'Text/Section0001.xhtml', anchor: undefined, depth: 0, childrenCount: 2, spine: book.spines[1] },
        { id: 'navPoint-3', label: '1.', src: 'Text/Section0001.xhtml#1', anchor: '1', depth: 1, childrenCount: 2, spine: book.spines[1] },
        { id: 'navPoint-4', label: '1.1.', src: 'Text/Section0001.xhtml#1_1', anchor: '1_1', depth: 2, childrenCount: 0, spine: book.spines[1] },
        { id: 'navPoint-5', label: '1.2.', src: 'Text/Section0001.xhtml#1_2', anchor: '1_2', depth: 2, childrenCount: 0, spine: book.spines[1] },
        { id: 'navPoint-6', label: '2.', src: 'Text/Section0001.xhtml#2', anchor: '2', depth: 1, childrenCount: 2, spine: book.spines[1] },
        { id: 'navPoint-7', label: '2.1.', src: 'Text/Section0001.xhtml#2_1', anchor: '2_1', depth: 2, childrenCount: 0, spine: book.spines[1] },
        { id: 'navPoint-8', label: '2.2.', src: 'Text/Section0001.xhtml#2_2', anchor: '2_2', depth: 2, childrenCount: 0, spine: book.spines[1] },
        { id: 'navPoint-9', label: 'Chapter 2', src: 'Text/Section0002.xhtml', anchor: undefined, depth: 0, childrenCount: 2, spine: book.spines[2] },
        { id: 'navPoint-10', label: '1.', src: 'Text/Section0002.xhtml#1', anchor: '1', depth: 0, childrenCount: 0, spine: book.spines[2] },
        { id: 'navPoint-11', label: '1.1.', src: 'Text/Section0002.xhtml#1_1', anchor: '1_1', depth: 1, childrenCount: 0, spine: book.spines[2] },
        { id: 'navPoint-12', label: '1.2.', src: 'Text/Section0002.xhtml#1_2', anchor: '1_2', depth: 1, childrenCount: 0, spine: book.spines[2] },
        { id: 'navPoint-13', label: '1.3.', src: 'Text/Section0002.xhtml#1_3', anchor: '1_3', depth: 1, childrenCount: 1, spine: book.spines[2] },
        { id: 'navPoint-14', label: '1.3.1.', src: 'Text/Section0002.xhtml#1_3_1', anchor: '1_3_1', depth: 2, childrenCount: 0, spine: book.spines[2] },
        { id: 'navPoint-15', label: '2.', src: 'Text/Section0002.xhtml', anchor: '2', depth: 0, childrenCount: 0, spine: book.spines[2] },
        { id: 'navPoint-16', label: 'Copyrights', src: '', anchor: undefined, depth: 0, childrenCount: 0, spine: undefined },
      ];
      book.ncx.navPoints.length.should.equal(expectedList.length);
      book.ncx.navPoints.forEach((navPoint, idx) => {
        const expectedNavPoint = expectedList[idx];
        navPoint.id.should.equal(expectedNavPoint.id);
        navPoint.label.should.equal(expectedNavPoint.label);
        navPoint.src.should.equal(expectedNavPoint.src);
        navPoint.anchor.should.equal(expectedNavPoint.anchor);
        navPoint.depth.should.equal(expectedNavPoint.depth);
        navPoint.children.should.lengthOf(expectedNavPoint.childrenCount);
        navPoint.spine.should.deep.equal(expectedNavPoint.spine);
      });

      expectedList = [
        { id: 'Cover.xhtml', spineIndex: 0 },
        { id: 'Section0001.xhtml', spineIndex: 1 },
        { id: 'Section0002.xhtml', spineIndex: 2 },
      ];
      book.spines.length.should.equal(expectedList.length);
      book.spines.forEach((spine, idx) => {
        const expectedSpine = expectedList[idx];
        spine.id.should.equal(expectedSpine.id);
        spine.spineIndex.should.equal(expectedSpine.spineIndex);
        spine.isLinear.should.be.false;
      });

      book.fonts.should.have.lengthOf(1);
      book.fonts[0].id.should.equal('NotoSans-Regular.ttf');

      book.cover.id.should.equal('ridibooks_logo.png');

      book.images.should.have.lengthOf(1);
      book.images[0].id.should.equal('ridibooks_logo.png');

      book.styles.should.have.lengthOf(1);
      book.styles[0].id.should.equal('Style0001.css');

      book.guide.should.have.lengthOf(1);
      book.guide[0].title.should.equal('Cover');
      book.guide[0].type.should.equal(Guide.Types.COVER);
      book.guide[0].href.should.equal('Text/Cover.xhtml');
      book.guide[0].item.should.deep.equal(book.items[1]);
    });
  });
});
