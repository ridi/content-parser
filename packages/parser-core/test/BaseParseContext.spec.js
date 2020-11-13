import { expect, should } from 'chai';
import BaseParseContext from '../src/BaseParseContext';

should(); // Initialize should

describe('BaseParseContext', () => {
  const baseParseContext = new BaseParseContext();
  it('constructed initialize keys to undefined', () => {
    expect(baseParseContext.entries).to.be.undefined;
    expect(baseParseContext.options).to.be.undefined;
    expect(baseParseContext.rawBook).to.be.undefined;
  })
});
