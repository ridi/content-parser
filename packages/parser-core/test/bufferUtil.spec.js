import { should } from 'chai';

import { trim, trimStart, trimEnd } from '../src/bufferUtil';

should(); // Initialize should

describe('Util - buffer', () => {
  it('trimStart', () => {
    trimStart(new Buffer([0x00, 0x00, 0x11, 0x22, 0x33])).should.deep.equal(new Buffer([0x11, 0x22, 0x33]));
  });

  it('trimEnd', () => {
    trimEnd(new Buffer([0x11, 0x22, 0x33, 0x00, 0x00])).should.deep.equal(new Buffer([0x11, 0x22, 0x33]));
  });

  it('trim', () => {
    trim(new Buffer([0x00, 0x00, 0x33, 0x00, 0x00])).should.deep.equal(new Buffer([0x33]));
  });
});
