import { should } from 'chai';

import { MatchOption, stringContains } from '../src/stringContains';

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
});
