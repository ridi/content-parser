import { should } from 'chai';
import fs from 'fs';
import path from 'path';

import {
  isArray,
  isBuffer,
  isExists,
  isObject,
  isString,
  mergeObjects,
  createDirectory,
  removeDirectory,
  safeDirname,
  safePathJoin,
  getPathes,
} from '../src/utils';
import Book from '../src/model/Book';
import Files from './files';

should(); // Initialize should

describe('Util test', () => {
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

  it('createDirectory and removeDirectory test', () => {
    [
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
    ].forEach((item) => {
      createDirectory(item.createPath);
      fs.existsSync(item.createPath).should.be.true;
      fs.lstatSync(item.createPath).isDirectory().should.be.true;
      removeDirectory(item.removePath);
      let current = item.createPath;
      while (current.length > item.removePath.length) {
        fs.existsSync(current).should.be.false;
        current = safeDirname(current);
      }
    });
  });

  it('safePathJoin test', () => {
    safePathJoin('temp', 'a', 'b', 'c').should.equal(`temp/a/b/c`);
    safePathJoin('temp', undefined).should.equal('');
    safePathJoin('temp', '..', '..', 'a', 'b').should.equal(`../a/b`);
    safePathJoin('..', '..', 'temp').should.equal(`../../temp`);
  });

  it('getPathes test', () => {
    const expectedPathes = [
      path.join('META-INF', 'container.xml'),
      path.join('OEBPS', 'Fonts', 'NotoSans-Regular.ttf'),
      path.join('OEBPS', 'Images', 'ridibooks_logo.png'),
      path.join('OEBPS', 'Styles', 'Style0001.css'),
      path.join('OEBPS', 'Text', 'Cover.xhtml'),
      path.join('OEBPS', 'Text', 'Section0001.xhtml'),
      path.join('OEBPS', 'Text', 'Section0002.xhtml'),
      path.join('OEBPS', 'content.opf'),
      path.join('OEBPS', 'toc.ncx'),
      path.join('mimetype'),
    ];
    const offset = path.normalize(Files.UNZIPPED_DEFAULT).length + path.sep.length;
    const pathes = getPathes(Files.UNZIPPED_DEFAULT).map(subpath => subpath.substring(offset));
    pathes.should.deep.equal(expectedPathes);
  });
});
