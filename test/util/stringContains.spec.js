import { should } from 'chai';

import stringContains from '../../src/util/stringContains';

should(); // Initialize should

describe('Util - String util', () => {
  it('stringContains test', () => {
    const list = ['A', 'b', 'c'];
    stringContains(list, 'a').should.be.true;
    stringContains(list, 'b').should.be.true;
    stringContains(list, 'C').should.be.true;
    stringContains(list, 'd').should.be.false;
    stringContains().should.be.false;
    stringContains(list).should.be.false;
  });
});
