import chai, { assert, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import path from 'path';

import { EpubLoader, EpubParser, Errors } from '../src';
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

chai.use(chaiAsPromised);
should(); // Initialize should

const Files = {
  DEFAULT: path.join('.', 'test', 'res', 'default.epub'),
  COVER_HTML: path.join('.', 'test', 'res', 'epub', 'Cover.xhtml'),
  COVER_IMAGE: path.join('.', 'test', 'res', 'epub', 'ridibooks_logo.png'),
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
    }).should.throw(Errors.INVALID_FILE_PATH);
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
      new EpubLoader(buffer, { i_am_invalid_option: true });
    }).should.throw(Errors.INVALID_OPTIONS);
  });

  it('Invalid option value', () => {
    (() => { 
      new EpubParser(buffer, { extractBody: 'true' });
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
      loader.readText(book.spines[0]).should.equal(expectedSpine);
      loader.readText(book.ncx.navPoints[0].spine).should.equal(expectedSpine);
      loader.readText(book.guide[0].item).should.equal(expectedSpine);
    });
  
    it('Read resources', () => {
      loader.readData(book.cover).should.equal(expectedCover);
    });
  });
});

const unzipPath = path.join('.', 'temp');
new EpubParser(Files.DEFAULT, { unzipPath }).parse().then((book) => {
  describe('EpubLoader reading test (path)', () => {
    const loader = new EpubLoader(unzipPath);
    it('Read spines', () => {
      loader.readText(book.spines[0]).should.equal(expectedSpine);
      loader.readText(book.ncx.navPoints[0].spine).should.equal(expectedSpine);
      loader.readText(book.guide[0].item).should.equal(expectedSpine);
    });
  
    it('Read resources', () => {
      loader.readData(book.cover).should.equal(expectedCover);
    });
  });
});
