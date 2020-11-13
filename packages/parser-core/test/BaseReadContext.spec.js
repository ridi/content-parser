import { expect, should } from 'chai';
import BaseReadContext from '../src/BaseReadContext';

should(); // Initialize should

describe('BaseReadContext', () => {
  const baseReadContext = new BaseReadContext();
  it('constructed initialize keys to undefined', () => {
    expect(baseReadContext.entries).to.be.undefined;
    expect(baseReadContext.options).to.be.undefined;
    expect(baseReadContext.items).to.be.undefined;
  })
});
