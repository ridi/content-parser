import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import path from 'path';

import { EpubLoader, EpubParser, Errors } from '../src';
import Item from '../src/model/Item'

chai.use(chaiAsPromised);
should(); // Initialize should

const Files = {
  DEFAULT: path.join('.', 'test', 'res', 'default.epub'),
  COVER_HTML: path.join('.', 'test', 'res', 'default', 'OEBPS', 'Text', 'Cover.xhtml'),
  COVER_IMAGE: path.join('.', 'test', 'res', 'default', 'OEBPS', 'Images', 'ridibooks_logo.png'),
};

describe('EpubLoader input test', () => {
  it('Input is string path', () => {
    new EpubLoader().should.be.an.instanceOf(EpubLoader);
  });

  it('Input is buffer', () => {
    const buffer = fs.readFileSync(Files.DEFAULT);
    new EpubLoader(buffer).should.be.an.instanceOf(EpubLoader);
  });

  it('Invalid path', () => {
    (() => {
      new EpubLoader(Files.DEFAULT);
    }).should.throw(Errors.DIRECTROY_INPUT_REQUIRED);
  });

  it('Invalid input', () => {
    (() => {
      new EpubLoader([]);
    }).should.throw(Errors.INVALID_INPUT);
  });
});

describe('EpubLoader option test', () => {
  const buffer = fs.readFileSync(Files.DEFAULT);
  it('Invalid options', () => {
    (() => {
      new EpubLoader(buffer).read(new Item({}), { i_am_invalid_option: true });
    }).should.throw(Errors.INVALID_OPTIONS);
  });

  it('Invalid option value', () => {
    (() => {
      new EpubLoader(buffer).read(new Item({}), { encoding: true });
    }).should.throw(Errors.INVALID_OPTION_VALUE);
  });
});

const expectedSpine = fs.readFileSync(Files.COVER_HTML, { encoding: 'utf8' });
const expectedCover = fs.readFileSync(Files.COVER_IMAGE);

const buffer = fs.readFileSync(Files.DEFAULT);
new EpubParser(buffer).parse().then((book) => {
  describe('EpubLoader reading test (buffer)', () => {
    const loader = new EpubLoader(buffer);
    it('Read spines', () => {
      const options = { encoding: 'utf8' };
      loader.read(book.spines[0], options).should.equal(expectedSpine);
      loader.read(book.ncx.navPoints[0].spine, options).should.equal(expectedSpine);
      loader.read(book.guide[0].item, options).should.equal(expectedSpine);
    });
  
    it('Read resources', () => {
      loader.read(book.cover).should.equal(expectedCover);
    });
  });
});

const unzipPath = path.join('.', 'temp');
new EpubParser(Files.DEFAULT, { unzipPath }).parse().then((book) => {
  describe('EpubLoader reading test (path)', () => {
    const loader = new EpubLoader(unzipPath);
    it('Read spines', () => {
      const options = { encoding: 'utf8' };
      loader.read(book.spines[0], options).should.equal(expectedSpine);
      loader.read(book.ncx.navPoints[0].spine, options).should.equal(expectedSpine);
      loader.read(book.guide[0].item, options).should.equal(expectedSpine);
    });
  
    it('Read resources', () => {
      loader.read(book.cover).should.equal(expectedCover);
    });
  });
});
