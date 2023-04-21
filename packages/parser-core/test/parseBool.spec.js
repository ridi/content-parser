import { should } from 'chai';

import parseBool from '../lib/parseBool';

should(); // Initialize should

describe('Util - Primitive type parser', () => {
  it('parseBool test', () => {
    parseBool('true').should.be.true;
    parseBool('yes').should.be.true;
    parseBool('1').should.be.true;
    parseBool('t').should.be.true;
    parseBool('y').should.be.true;
    parseBool('false').should.be.false;
    parseBool('no').should.be.false;
    parseBool('0').should.be.false;
    parseBool('f').should.be.false;
    parseBool('n').should.be.false;
    parseBool(undefined).should.be.false;
    parseBool(5).should.be.false;
    parseBool({}).should.be.false;
    parseBool([]).should.be.false;
    parseBool(true).should.be.true;
  });
});
