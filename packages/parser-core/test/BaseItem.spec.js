import { expect, should } from 'chai';
import BaseItem from '../lib/BaseItem';

should(); // Initialize should

describe('BaseItem', () => {
  const defaultSize = 10;
  const baseItemParam = { size: 10 };
  const baseBook = new BaseItem(baseItemParam);
  it('toRaw() should throw an error', () => {
    expect(baseBook.toRaw).to.throw(Error, 'You must override in a subclass.');
  })
  it('constructed will copy values', () => {
    expect(baseBook.size).to.be.equal(defaultSize);
  })
});
