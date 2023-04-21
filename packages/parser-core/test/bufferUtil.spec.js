import { should } from 'chai';

import { trim, trimStart, trimEnd } from '../lib/bufferUtil';

should(); // Initialize should

describe('Util - buffer', () => {
  it('trimStart', () => {
    trimStart(Buffer.from([0x00, 0x00, 0x11, 0x22, 0x33])).should.deep.equal(Buffer.from([0x11, 0x22, 0x33]));
  });

  it('trimEnd', () => {
    trimEnd(Buffer.from([0x11, 0x22, 0x33, 0x00, 0x00])).should.deep.equal(Buffer.from([0x11, 0x22, 0x33]));
  });

  it('trim', () => {
    trim(Buffer.from([0x00, 0x00, 0x33, 0x00, 0x00])).should.deep.equal(Buffer.from([0x33]));
  });
});
