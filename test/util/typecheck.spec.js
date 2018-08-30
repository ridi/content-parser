import { should } from 'chai';

import Book from '../../src/model/Book';
import { isArray, isBool, isExists, isObject, isString, isUrl } from '../../src/util/typecheck';

should(); // Initialize should

describe('Util - Type check', () => {
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

  it('isBool test', () => {
    isBool({}).should.be.false;
    isBool(new Book()).should.be.false;
    isBool('string').should.be.false;
    isBool([]).should.be.false;
    isBool(5).should.be.false;
    isBool(false).should.be.true;
    isBool(null).should.be.false;
    isBool(undefined).should.be.false;
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

  it('isUrl test', () => {
    isUrl('http://...').should.be.true;
    isUrl('https://...').should.be.true;
    isUrl('foo').should.be.false;
  });
});
