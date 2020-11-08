import { should, expect } from 'chai';

import { MatchOption, stringContains, safeDecodeURI } from '../src/stringUtil';

should(); // Initialize should

describe('Util - String util', () => {
  it('stringContains test', () => {
    const list = ['Abc', 'def', 'gHi'];
    stringContains(list, 'abc').should.be.true;
    stringContains(list, 'gHi').should.be.true;
    stringContains(list, 'de').should.be.false;
    stringContains(list, 'de', MatchOption.STARTSWITH).should.be.true;
    stringContains(list, 'de', MatchOption.CONTAINING).should.be.true;
    stringContains(list, 'de', MatchOption.ENDSWITH).should.be.false;
    stringContains(list, 'hi', MatchOption.ENDSWITH).should.be.true;
    stringContains().should.be.false;
    stringContains(list).should.be.false;
  });

  describe('safeDecodeURI', () => {
    it('should decode URI', () => {
      safeDecodeURI('%E0%A4%A').should.equal('%E0%A4%A');
      safeDecodeURI('Chapter%201.html').should.equal('Chapter 1.html');
    })
    it('should throw', () => {
      const wrapper = () => {
        return safeDecodeURI(Symbol('someStrig'));
      }
      expect(wrapper).to.throw();
    })
  });
});
