import { should } from 'chai';

import EpubBook from '../../epub-parser/src/model/EpubBook';
import { isArray, isBool, isExists, isFunc, isObject, isString, isUrl, getType } from '../lib/typecheck';

should(); // Initialize should

function test() { }

describe('Util - Type check', () => {
  it('getType strict mode test', () => {
    getType(Array, true).should.equal('Array');
    getType(new Array(), true).should.equal('Array');
    getType({}, true).should.equal('Object');
    getType(new EpubBook(), true).should.equal('EpubBook');
    getType('string', true).should.equal('String');
    getType([], true).should.equal('Array');
    getType(5, true).should.equal('Number');
    getType(false, true).should.equal('Boolean');
    getType(null, true).should.equal('Null');
    getType(undefined, true).should.equal('Undefined');
    getType(() => { }, true).should.equal('');
    getType(test, true).should.equal('test');
  });

  it('isArray test', () => {
    isArray(Array()).should.be.true;
    isArray(new Array()).should.be.true;
    isArray({}).should.be.false;
    isArray(new EpubBook()).should.be.false;
    isArray('string').should.be.false;
    isArray([]).should.be.true;
    isArray(5).should.be.false;
    isArray(false).should.be.false;
    isArray(null).should.be.false;
    isArray(undefined).should.be.false;
    isArray(() => { }).should.be.false;
    isArray(test).should.be.false;

    const temp = Array.isArray;
    Array.isArray = undefined;
    isArray([]).should.be.true;
    Array.isArray = temp;
  });

  it('isBool test', () => {
    isBool({}).should.be.false;
    isBool(new EpubBook()).should.be.false;
    isBool('string').should.be.false;
    isBool([]).should.be.false;
    isBool(5).should.be.false;
    isBool(false).should.be.true;
    isBool(null).should.be.false;
    isBool(undefined).should.be.false;
    isBool(() => { }).should.be.false;
    isBool(test).should.be.false;
  });

  it('isExists test', () => {
    isExists({}).should.be.true;
    isExists(new EpubBook()).should.be.true;
    isExists('string').should.be.true;
    isExists([]).should.be.true;
    isExists(5).should.be.true;
    isExists(false).should.be.true;
    isExists(null).should.be.false;
    isExists(undefined).should.be.false;
    isExists(() => { }).should.be.true;
    isExists(test).should.be.true;
  });

  it('isFunc test', () => {
    isFunc({}).should.be.false;
    isFunc(new EpubBook()).should.be.false;
    isFunc('string').should.be.false;
    isFunc([]).should.be.false;
    isFunc(5).should.be.false;
    isFunc(false).should.be.false;
    isFunc(null).should.be.false;
    isFunc(undefined).should.be.false;
    isFunc(() => { }).should.be.true;
    isFunc(test).should.be.true;
  });

  it('isObject test', () => {
    isObject({}).should.be.true;
    isObject(new EpubBook()).should.be.true;
    isObject('string').should.be.false;
    isObject([]).should.be.false;
    isObject(5).should.be.false;
    isObject(false).should.be.false;
    isObject(null).should.be.false;
    isObject(undefined).should.be.false;
    isObject(() => { }).should.be.false;
    isObject(test).should.be.false;
  });

  it('isString test', () => {
    isString({}).should.be.false;
    isString(new EpubBook()).should.be.false;
    isString('string').should.be.true;
    isString([]).should.be.false;
    isString(5).should.be.false;
    isString(false).should.be.false;
    isString(null).should.be.false;
    isString(undefined).should.be.false;
    isString(() => { }).should.be.false;
    isString(test).should.be.false;
  });

  it('isUrl test', () => {
    isUrl('http://...').should.be.true;
    isUrl('https://...').should.be.true;
    isUrl('ftp://...').should.be.true;
    isUrl('nas://...').should.be.true;
    isUrl('foo').should.be.false;
    isUrl('./foo/bar').should.be.false;
  });
});
